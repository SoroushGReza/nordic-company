from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import Booking, Service, Availability
from .serializers import BookingSerializer, ServiceSerializer, AvailabilitySerializer
from rest_framework.response import Response
from datetime import timedelta
from django.db.models import Q


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
        total_worktime = sum([service.worktime for service in services], timedelta())

        booking_time = serializer.validated_data["date_time"]
        end_time = booking_time + total_worktime

        # Check against the availability slots
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

            if end_time_delta - start_time_delta >= total_worktime:
                is_slot_available = True
                break

        if not is_slot_available:
            raise ValidationError(
                {"error": "No available slot for the selected services"}
            )

        # Check for overlaps with existing bookings
        overlapping_bookings = (
            Booking.objects.filter(
                Q(date_time__lt=end_time) & Q(date_time__gte=booking_time)
            )
            .filter(services__in=services)
            .exists()
        )

        if overlapping_bookings:
            raise ValidationError(
                {"error": "This booking overlaps with an existing one."}
            )

        # Save booking
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
