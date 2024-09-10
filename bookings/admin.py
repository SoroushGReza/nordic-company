from django.contrib import admin
from .models import Service, Booking, Availability


# Admin panel for the Service model
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ["name", "worktime", "price"]
    fieldsets = (
        (
            None,
            {
                "fields": ("name", "worktime", "price"),
                "description": "For worktime, use the format: HH:MM:SS (e.g., 4:00:00 for 4 hours)",
            },
        ),
    )


# Admin panel for the Booking model
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "date_time",
        "end_time",  # Add end_time to the list
        "created_at",
        "get_services",  # Display services
    ]
    list_filter = ["date_time"]  # Filter by date
    search_fields = ["user__username"]  # Search by username

    # Calculate and display the end time for each booking
    def end_time(self, obj):
        return (
            obj.calculate_end_time()
        )

    end_time.short_description = "End Time"

    # Display the services selected in the booking
    def get_services(self, obj):
        return ", ".join([service.name for service in obj.services.all()])

    get_services.short_description = "Services"


# Admin panel for the Availability model
@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = [
        "date",
        "start_time",
        "end_time",
        "is_available",
    ]  # Display availability information
    list_filter = ["date", "is_available"]
    search_fields = ["date"]  # Search by date
