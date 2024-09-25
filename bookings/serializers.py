from rest_framework import serializers
from .models import Booking, Service, Availability
from django.utils import timezone
from datetime import timedelta
import pytz


# Serializer for Service with added price and worktime fields
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "worktime", "price"]


# Serializer for Booking to handle multiple services
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
        start_time = data.get("date_time").astimezone(pytz.timezone("Europe/Dublin"))
        total_duration = sum([service.worktime for service in services], timedelta())

        if start_time < timezone.now():
            raise serializers.ValidationError("Cannot book in the past.")

        end_time = start_time + total_duration

        # Check if the requested booking time is within the available time slots
        if not Availability.objects.filter(
            date=start_time.date(),
            start_time__lte=start_time.time(),
            end_time__gte=(start_time + total_duration).time(),
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
