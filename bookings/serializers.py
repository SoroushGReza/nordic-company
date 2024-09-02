from rest_framework import serializers
from .models import Booking, Service


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name"]


class BookingSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), source="service", write_only=True
    )

    class Meta:
        model = Booking
        fields = ["id", "service", "service_id", "user", "date_time", "created_at"]
        read_only_fields = ["user", "created_at"]
