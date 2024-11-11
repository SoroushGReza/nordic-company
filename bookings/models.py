from django.db import models
from django.conf import settings  # To access AUTH_USER_MODEL
from django.utils import timezone
from django.utils.timezone import timedelta


class TimezoneSetting(models.Model):
    timezone = models.CharField(max_length=50, default="Europe/Istanbul")

    def __str__(self):
        return self.timezone

    def save(self, *args, **kwargs):
        # Make sure only one instance exists
        self.pk = 1
        super(TimezoneSetting, self).save(*args, **kwargs)


# Service Category
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Service(models.Model):
    name = models.CharField(max_length=100)
    worktime = models.DurationField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    information = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="services",
    )

    def __str__(self):
        info = f" - {self.information}" if self.information else ""
        return f"{self.name} ({self.worktime}, {self.price} EUR){info}"


class Booking(models.Model):
    services = models.ManyToManyField(Service)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.date_time}"

    def is_cancellable(self):
        return self.date_time - timezone.now() >= timezone.timedelta(hours=8)

    def calculate_end_time(self):
        # Calculate total duration of services
        total_worktime = sum(
            [service.worktime for service in self.services.all()], timedelta()
        )
        # Add total_worktime to the booking's start time to get the end time
        return self.date_time + total_worktime


class Availability(models.Model):
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Available on {self.date} from {self.start_time} to {self.end_time}"
