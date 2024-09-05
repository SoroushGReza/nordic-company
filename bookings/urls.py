from django.urls import path
from .views import (
    ServiceListView,
    BookingCreateView,
    BookingListView,
    BookingDetailView,
    AvailabilityListCreateView,
)

urlpatterns = [
    path("services/", ServiceListView.as_view(), name="service-list"),
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("bookings/mine/", BookingListView.as_view(), name="booking-list"),
    path("bookings/<int:pk>/", BookingDetailView.as_view(), name="booking-detail"),
    path(
        "availability/",
        AvailabilityListCreateView.as_view(),
        name="availability-list-create",
    ),
]
