from django.urls import path
from .views import SignupView, LoginView, UserTaskDetailView, UserTasksView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/<int:user_id>/tasks/', UserTasksView.as_view(), name='user-tasks'),  # Get all tasks for a user, Add a new task
    path('users/<int:user_id>/tasks/<int:task_id>/', UserTaskDetailView.as_view(), name='user-task-detail'),  # Update or delete a task
]
