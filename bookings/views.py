from rest_framework import generics, permissions, serializers
from .models import Booking, Service, Availability
from .serializers import BookingSerializer, ServiceSerializer, AvailabilitySerializer
from rest_framework.response import Response
from datetime import timedelta
from django.db.models import Q
from django.utils.timezone import localtime
from datetime import datetime


# View to list available services
class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


# View to create a booking, now with multiple services
class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        services = serializer.validated_data["services"]

        # Initiate total_worktime as timedelta
        total_worktime = timedelta()

        for service in services:
            total_worktime += service.worktime

        # Check availability based on total_worktime
        booking_time = serializer.validated_data["date_time"]
        end_time = booking_time + total_worktime

        # Convert booking_time and end_time to naive local time
        local_booking_time = localtime(booking_time).replace(tzinfo=None)
        local_end_time = localtime(end_time).replace(tzinfo=None)

        available_slots = Availability.objects.filter(
            date=local_booking_time.date(),
            start_time__lte=local_booking_time.time(),
            end_time__gte=local_end_time.time(),
            is_available=True,
        )

        is_slot_available = False
        for slot in available_slots:
            slot_start = datetime.combine(slot.date, slot.start_time)
            slot_end = datetime.combine(slot.date, slot.end_time)
            if local_booking_time >= slot_start and local_end_time <= slot_end:
                is_slot_available = True
                break

        if not is_slot_available:
            raise serializers.ValidationError(
                {"error": "No available slot for the selected services"}
            )

        # Save booking if its within available times
        serializer.save(user=self.request.user)


# View to list user bookings
class BookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        bookings = Booking.objects.filter(user=self.request.user).prefetch_related(
            "services"
        )

        user_data = [
            {
                "date_time": booking.date_time.isoformat(),
                "end_time": booking.calculate_end_time().isoformat(),
                "services": [
                    {"name": service.name, "worktime": service.worktime}
                    for service in booking.services.all()
                ],
                "id": booking.id,
                "created_at": booking.created_at,
            }
            for booking in bookings
        ]
        return Response(user_data)


# View to retrieve booking details
class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]


# View to create and list availability slots
class AvailabilityListCreateView(generics.ListCreateAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]


# View to list all bookings without user details, excluding the current user's own bookings
class AllBookingsListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Exclude current user's bookings
        bookings = Booking.objects.exclude(user=request.user).prefetch_related(
            "services"
        )
        anonymized_data = [
            {
                "date_time": booking.date_time.isoformat(),
                "end_time": booking.calculate_end_time().isoformat(),
                "services": [
                    {"name": service.name, "worktime": service.worktime}
                    for service in booking.services.all()
                ],
            }
            for booking in bookings
        ]
        return Response(anonymized_data)
