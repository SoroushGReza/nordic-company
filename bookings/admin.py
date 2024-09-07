from django.contrib import admin
from .models import Service, Booking, Availability


# Admin panel for the Service model with new fields (worktime and price)
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "worktime",
        "price",
    ]


# Admin panel for the Booking model
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "date_time",
        "created_at",
    ]  # List user and date of the booking
    list_filter = ["date_time"]  # Filter by date
    search_fields = ["user__username"]  # Search by username


# Admin panel for the Availability model
@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = [
        "date",
        "start_time",
        "end_time",
        "is_available",
    ]  # Display availability information
    list_filter = ["date", "is_available"]  # Filter by date and availability status
    search_fields = ["date"]  # Search by date
