from rest_framework import serializers
from .models import Booking, Service, Availability


# Serializer for Service with added price and worktime fields
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "worktime", "price"]  # Expose the new fields


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


# Serializer for Availability
class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ["id", "date", "start_time", "end_time", "is_available"]
