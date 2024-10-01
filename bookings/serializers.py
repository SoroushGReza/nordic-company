from rest_framework import serializers
from .models import Booking, Service, Availability
from django.utils import timezone
from django.utils.timezone import localtime
from datetime import timedelta


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

    def validate(self, data):
        services = data.get("services", [])
        start_time = data.get("date_time")
        total_duration = sum([service.worktime for service in services], timedelta())

        if start_time < timezone.now():
            raise serializers.ValidationError("Cannot book in the past.")

        end_time = start_time + total_duration

        # Convert start_time and end_time to naive local time
        local_start_time = localtime(start_time).replace(tzinfo=None)
        local_end_time = localtime(end_time).replace(tzinfo=None)

        # Check if desired time is available
        if not Availability.objects.filter(
            date=local_start_time.date(),
            start_time__lte=local_start_time.time(),
            end_time__gte=local_end_time.time(),
            is_available=True,
        ).exists():
            raise serializers.ValidationError("The selected time slot is unavailable.")

        # Check for overlaped bookings
        overlapping_bookings = Booking.objects.filter(
            date_time__lt=end_time, date_time__gte=start_time
        ).exists()

        if overlapping_bookings:
            raise serializers.ValidationError(
                "The booking time overlaps with an existing booking."
            )

        return data

    def create(self, validated_data):
        services = validated_data.pop("services")
        booking = Booking.objects.create(**validated_data)
        booking.services.set(services)
        return booking


# Serializer for Availability
class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ["id", "date", "start_time", "end_time", "is_available"]
