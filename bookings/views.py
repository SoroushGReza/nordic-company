from rest_framework import generics, permissions
from .models import Booking, Service, Availability
from .serializers import BookingSerializer, ServiceSerializer, AvailabilitySerializer
from rest_framework.response import Response
from datetime import timedelta


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
        total_worktime += timedelta(hours=service.worktime)

    # Control availability based on total_worktime
    booking_time = serializer.validated_data["date_time"]
    available_slots = Availability.objects.filter(
        date=booking_time.date(), is_available=True
    )

    is_slot_available = False
    for slot in available_slots:
        start_time_delta = timedelta(
            hours=slot.start_time.hour, minutes=slot.start_time.minute
        )
        end_time_delta = timedelta(
            hours=slot.end_time.hour, minutes=slot.end_time.minute
        )

        # Check if time is enough for the booking
        if end_time_delta - start_time_delta >= total_worktime:
            is_slot_available = True
            break

    if not is_slot_available:
        return Response(
            {"error": "No available slot for the selected services"}, status=400
        )

    # Save booking if its a available time
    serializer.save(user=self.request.user)


# View to list user bookings
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
                "date_time": booking.date_time,
                "end_time": booking.calculate_end_time(),
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


# View to list all bookings without user details
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
                "date_time": booking.date_time,
                "end_time": booking.calculate_end_time(),
                "services": [
                    {"name": service.name, "worktime": service.worktime}
                    for service in booking.services.all()
                ],
            }
            for booking in bookings
        ]
        return Response(anonymized_data)
