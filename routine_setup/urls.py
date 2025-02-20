from django.urls import path
from .views import GenerateRoutineView

urlpatterns = [
    path('generate-routine/<int:user_id>/', GenerateRoutineView.as_view(), name='generate-routine'),
]
