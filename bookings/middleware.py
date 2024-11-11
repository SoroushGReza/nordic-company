from django.utils import timezone
from .models import TimezoneSetting


class DynamicTimezoneMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        timezone_setting, _ = TimezoneSetting.objects.get_or_create(pk=1)
        timezone.activate(timezone_setting.timezone)
        print(
            f"Middleware activated timezone: {timezone_setting.timezone}"
        )  # For debugging
        response = self.get_response(request)
        timezone.deactivate()
        return response
