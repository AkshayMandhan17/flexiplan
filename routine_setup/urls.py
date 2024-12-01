from django.urls import path
from .views import RoutineSetupView

urlpatterns = [
    path('routine-setup/', RoutineSetupView.as_view(), name='routine-setup'),
]
