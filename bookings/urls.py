from django.urls import path
from .views import (
    AdminServiceUpdateDeleteView,
    AdminAvailabilityListView,
    ServiceListView,
    BookingCreateView,
    BookingListView,
    AllBookingsListView,
    BookingDetailView,
    AvailabilityListCreateView,
    AdminServiceListCreateView,
)

urlpatterns = [
    # Admin
    path(
        "admin/services/",
        AdminServiceListCreateView.as_view(),
        name="admin-service-list-create",
    ),
    path(
        "admin/services/<int:pk>/",
        AdminServiceUpdateDeleteView.as_view(),
        name="admin-service-update-delete",
    ),
    path(
        "admin/availability/",
        AdminAvailabilityListView.as_view(),
        name="admin-availability-list",
    ),
    # Public (User)
    path("services/", ServiceListView.as_view(), name="service-list"),
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("bookings/mine/", BookingListView.as_view(), name="booking-list"),
    path("bookings/all/", AllBookingsListView.as_view(), name="booking-list-all"),
    path("bookings/<int:pk>/", BookingDetailView.as_view(), name="booking-detail"),
    path(
        "availability/",
        AvailabilityListCreateView.as_view(),
        name="availability-list-create",
    ),
]
