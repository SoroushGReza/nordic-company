from rest_framework import serializers
from .models import Booking, Availability


class AvailabilitySerializer(serializers.ModelSerializer):
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()

    class Meta:
        model = Availability
        fields = ["date", "start_time", "end_time"]

    def get_start_time(self, obj):
        return obj.start_time.isoformat()

    def get_end_time(self, obj):
        return obj.end_time.isoformat()


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = "__all__"
