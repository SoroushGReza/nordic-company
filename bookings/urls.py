from django.urls import path
from .views import (
    AdminServiceUpdateDeleteView,
    ServiceListView,
    BookingCreateView,
    BookingListView,
    AllBookingsListView,
    BookingDetailView,
    AdminAvailabilityListCreateView,
    AdminAvailabilityUpdateDeleteView,
    AdminServiceListCreateView,
    AdminBookingListCreateView,
    AdminBookingUpdateDeleteView,
    AvailabilityListCreateView,
    BookingUpdateDeleteView,
    CategoryList,
    CategoryDetail,
    ServicesByCategory,
    TimezoneAPIView
)

urlpatterns = [
    # Timezone settings
    path('api/timezone/', TimezoneAPIView.as_view(), name='timezone-api'),
    # List oF Categories
    path("categories/", CategoryList.as_view(), name="category-list"),
    path("categories/<int:pk>/", CategoryDetail.as_view(), name="category-detail"),
    path(
        "categories/<int:category_id>/services/",
        ServicesByCategory.as_view(),
        name="services-by-category",
    ),
    # Admin
    path(
        "admin/bookings/",
        AdminBookingListCreateView.as_view(),
        name="admin-booking-list-create",
    ),
    path(
        "admin/bookings/<int:pk>/",
        AdminBookingUpdateDeleteView.as_view(),
        name="admin-booking-update-delete",
    ),
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
        AdminAvailabilityListCreateView.as_view(),
        name="admin-availability-list-create",
    ),
    path(
        "admin/availability/<int:pk>/",
        AdminAvailabilityUpdateDeleteView.as_view(),
        name="admin-availability-update-delete",
    ),
    # Public (User)
    path("services/", ServiceListView.as_view(), name="service-list"),
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("bookings/mine/", BookingListView.as_view(), name="booking-list"),
    path("bookings/all/", AllBookingsListView.as_view(), name="booking-list-all"),
    path("bookings/<int:pk>/", BookingDetailView.as_view(), name="booking-detail"),
    path(
        "bookings/<int:pk>/edit/",
        BookingUpdateDeleteView.as_view(),
        name="booking-edit",
    ),
    path(
        "availability/",
        AvailabilityListCreateView.as_view(),
        name="availability-list-create",
    ),
]
