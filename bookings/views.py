from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from .models import Booking, Service, Availability, Category, TimezoneSetting
from .serializers import (
    BookingSerializer,
    ServiceSerializer,
    AvailabilitySerializer,
    AdminAvailabilitySerializer,
    AdminServiceSerializer,
    AdminBookingSerializer,
    CategorySerializer,
)
from datetime import timedelta, datetime
from django.db.models import Q
from django.utils.timezone import localtime
from django.utils import timezone
import pytz


class TimezoneAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        timezone_setting, _ = TimezoneSetting.objects.get_or_create(pk=1)
        return Response({"timezone": timezone_setting.timezone})

    def post(self, request):
        timezone = request.data.get("timezone")
        if timezone:
            timezone_setting, _ = TimezoneSetting.objects.get_or_create(pk=1)
            timezone_setting.timezone = timezone
            timezone_setting.save()
            return Response({"status": "Timezone updated"})
        else:
            return Response(
                {"error": "No timezone provided"}, status=status.HTTP_400_BAD_REQUEST
            )


# List All Categories
class CategoryList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# List Services Filtered Based On Categories
class ServicesByCategory(generics.ListAPIView):
    serializer_class = ServiceSerializer

    def get_queryset(self):
        category_id = self.kwargs.get("category_id")
        return Service.objects.filter(category_id=category_id)


# Edit/Delete Specific Category
class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# (ADMIN) List all Services
class AdminServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = AdminServiceSerializer
    permission_classes = [IsAdminUser]


# (ADMIN) Create & List Services
class AdminServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = AdminServiceSerializer
    permission_classes = [IsAdminUser]


# (ADMIN) Update & Delete Service
class AdminServiceUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = AdminServiceSerializer
    permission_classes = [IsAdminUser]


# (ADMIN) List and Create Bookings
class AdminBookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = AdminBookingSerializer
    permission_classes = [IsAdminUser]


# (ADMIN) Retrieve, Update, and Delete Booking
class AdminBookingUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = AdminBookingSerializer
    permission_classes = [IsAdminUser]


# (ADMIN) Create And List ALL Availabilitys
class AdminAvailabilityListCreateView(generics.ListCreateAPIView):
    queryset = Availability.objects.all()
    serializer_class = AdminAvailabilitySerializer
    permission_classes = [IsAdminUser]


# (ADMIN) Create Availability with Overlap Check
class AdminAvailabilityListCreateView(generics.ListCreateAPIView):
    queryset = Availability.objects.all()
    serializer_class = AdminAvailabilitySerializer
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        # Overlap check
        date = request.data.get("date")
        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")

        # Check if it overlaps with existing availabilities or bookings
        if Availability.objects.filter(
            date=date, start_time__lt=end_time, end_time__gt=start_time
        ).exists():
            return Response(
                {"detail": "Overlapping availability detected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().create(request, *args, **kwargs)


# (ADMIN) Update, Delete Availability
class AdminAvailabilityUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Availability.objects.all()
    serializer_class = AdminAvailabilitySerializer
    permission_classes = [IsAdminUser]


# List Available Services (USER)
class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


# Create A New Booking (USER)
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

        # Retrieve the selected timezone from the TimezoneSetting model
        timezone_setting = TimezoneSetting.objects.get(pk=1)
        selected_timezone = pytz.timezone(timezone_setting.timezone)

        # Ensure booking_time is timezone-aware and in the selected timezone
        booking_time = serializer.validated_data["date_time"]

        if timezone.is_naive(booking_time):
            booking_time = selected_timezone.localize(booking_time)
        else:
            booking_time = booking_time.astimezone(selected_timezone)

        end_time = booking_time + total_worktime

         # Add print statements to check the times
        print(f"Selected Timezone in perform_create: {selected_timezone}")
        print(f"Booking Time (timezone-aware): {booking_time}")
        print(f"End Time (timezone-aware): {end_time}")

        # Use booking_time and end_time directly without converting to naive local time
        available_slots = Availability.objects.filter(
            date=booking_time.date(),
            start_time__lte=booking_time.time(),
            end_time__gte=end_time.time(),
            is_available=True,
        )

        is_slot_available = False
        for slot in available_slots:
            slot_start = datetime.combine(slot.date, slot.start_time).replace(
                tzinfo=selected_timezone
            )
            slot_end = datetime.combine(slot.date, slot.end_time).replace(
                tzinfo=selected_timezone
            )
            if booking_time >= slot_start and end_time <= slot_end:
                is_slot_available = True
                break

        if not is_slot_available:
            raise serializers.ValidationError(
                {"error": "No available slot for the selected services"}
            )

        # Save booking with timezone-aware date_time
        serializer.save(user=self.request.user, date_time=booking_time)


# Edit / Delete Booking (USER)
class BookingUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ensure users can only access their own bookings
        return Booking.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        # Ensure that the booking can be deleted only if it is cancellable
        if instance.is_cancellable():
            instance.delete()
        else:
            raise serializers.ValidationError(
                {
                    "error": "Booking cannot be canceled less than 8 hours before the start time."
                }
            )


# List User Bookings (USER)
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


# Retrieve Booking details (USER)
class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]


# Create & List Availability Slots (USER)
class AvailabilityListCreateView(generics.ListCreateAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]


# List ALL Bookings w/o User Details, Excluding current user's own bookings (USER)
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
