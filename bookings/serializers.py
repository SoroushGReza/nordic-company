from rest_framework import serializers
from .models import Booking, Service, Availability
from django.utils import timezone
from django.utils.timezone import localtime
from datetime import timedelta
from accounts.models import CustomUser


# Serializer for Service with added price and worktime fields
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "worktime", "price"]


# Serializer for Booking to handle multiple services
class BookingSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)  # Return list of services
    service_ids = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), source="services", many=True, write_only=True
    )  # Handle multiple service IDs

    class Meta:
        model = Booking
        fields = ["id", "services", "service_ids", "user", "date_time", "created_at"]
        read_only_fields = ["user", "created_at"]

    # Validation for bookings
    def validate(self, data):
        services = data.get("services", [])
        start_time = data.get("date_time")
        total_duration = sum(
            [service.worktime for service in services], timedelta()
        )  # Summing worktimes

        # Prevent booking in the past
        if start_time < timezone.now():
            raise serializers.ValidationError("Cannot book in the past.")

        end_time = start_time + total_duration

        # Convert start_time and end_time to naive local time for checking availability
        local_start_time = localtime(start_time).replace(tzinfo=None)
        local_end_time = localtime(end_time).replace(tzinfo=None)

        # Check availability for the desired time slot
        if not Availability.objects.filter(
            date=local_start_time.date(),
            start_time__lte=local_start_time.time(),
            end_time__gte=local_end_time.time(),
            is_available=True,
        ).exists():
            raise serializers.ValidationError("The selected time slot is unavailable.")

        # Check for overlapping bookings
        overlapping_bookings = Booking.objects.filter(
            date_time__lt=end_time, date_time__gte=start_time
        ).exists()

        if overlapping_bookings:
            raise serializers.ValidationError(
                "The booking time overlaps with an existing booking."
            )

        return data

    # Create booking
    def create(self, validated_data):
        services = validated_data.pop("services")  # Extracting services from the data
        booking = Booking.objects.create(**validated_data)  # Creating the booking
        booking.services.set(services)  # Setting the services for the booking
        return booking


# Serializer for Availability
class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ["id", "date", "start_time", "end_time", "is_available"]


#  ----------------------- ADMIN SERIALIZERS ----------


class AdminServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "worktime", "price"]


class AdminAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ["id", "date", "start_time", "end_time", "is_available"]


class AdminBookingSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    service_ids = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), source="services", many=True, write_only=True
    )
    end_time = serializers.SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        required=False,
        default=serializers.CurrentUserDefault(),
    )
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        source="user",
        write_only=True,
    )

    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "services",
            "service_ids",
            "user",
            "user_name",
            "user_id",
            "date_time",
            "end_time",
            "created_at",
        ]
        read_only_fields = ["created_at", "end_time"]

    def get_user_name(self, obj):
        # Return the user's full name or "Unknown User" if user is None
        return f"{obj.user.name} {obj.user.surname}" if obj.user else "Unknown User"

    def create(self, validated_data):
        services = validated_data.pop("services", [])
        booking = Booking.objects.create(**validated_data)
        booking.services.set(services)
        return booking

    def update(self, instance, validated_data):
        services = validated_data.pop("services", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if services is not None:
            instance.services.set(services)
        instance.save()
        return instance

    def get_end_time(self, obj):
        total_duration = timedelta()
        for service in obj.services.all():
            if isinstance(service.worktime, timedelta):
                total_duration += service.worktime
            else:
                try:
                    h, m, s = map(int, service.worktime.split(":"))
                    total_duration += timedelta(hours=h, minutes=m, seconds=s)
                except (ValueError, AttributeError):
                    # If parsing fails, skip this service or handle the error
                    continue
        end_time = obj.date_time + total_duration
        return end_time.isoformat()

    def validate(self, data):
        services = data.get("services", [])
        start_time = data.get("date_time")
        total_duration = sum([service.worktime for service in services], timedelta())

        # Prevent booking in the past
        if start_time < timezone.now():
            raise serializers.ValidationError("Cannot book in the past.")

        end_time = start_time + total_duration

        # Convert start_time and end_time to naive local time for checking availability
        local_start_time = localtime(start_time).replace(tzinfo=None)
        local_end_time = localtime(end_time).replace(tzinfo=None)

        # Check availability for the desired time slot
        if not Availability.objects.filter(
            date=local_start_time.date(),
            start_time__lte=local_start_time.time(),
            end_time__gte=local_end_time.time(),
            is_available=True,
        ).exists():
            raise serializers.ValidationError("The selected time slot is unavailable.")

        # Check for overlapping bookings, excluding the current booking if updating
        overlapping_bookings = (
            Booking.objects.filter(date_time__lt=end_time, date_time__gte=start_time)
            .exclude(id=self.instance.id if self.instance else None)
            .exists()
        )

        if overlapping_bookings:
            raise serializers.ValidationError(
                "The booking time overlaps with an existing booking."
            )

        return data
