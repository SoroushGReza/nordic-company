from django.db import models
from django.conf import (
    settings,
)  # Import settings to access AUTH_USER_MODEL
from django.utils import timezone


class Service(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Booking(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )  # Uppdaterat här
    date_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.service.name} - {self.user.username} - {self.date_time}"

    def is_cancellable(self):
        return self.date_time - timezone.now() >= timezone.timedelta(hours=8)
