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
        # Retrieve selected services and calculate total worktime
        services = serializer.validated_data["services"]
        total_worktime = timedelta()

        for service in services:
            total_worktime += service.worktime

        # Now, we can check availability based on total_worktime before saving the booking
        booking_time = serializer.validated_data["date_time"]
        available_slots = Availability.objects.filter(
            date=booking_time.date(), is_available=True
        )

        # Check if the booking can fit into the available slots
        is_slot_available = False
        for slot in available_slots:
            start_time_delta = timedelta(
                hours=slot.start_time.hour, minutes=slot.start_time.minute
            )
            end_time_delta = timedelta(
                hours=slot.end_time.hour, minutes=slot.end_time.minute
            )

            # If the time slot is long enough for the booking
            if end_time_delta - start_time_delta >= total_worktime:
                is_slot_available = True
                break

        if not is_slot_available:
            return Response(
                {"error": "No available slot for the selected services"}, status=400
            )

        # If available, save the booking with the associated user and services
        serializer.save(user=self.request.user)


# View to list user bookings
class BookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


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
