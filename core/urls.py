from django.urls import path
from .views import SignupView, LoginView, UserRoutineView, UserTaskDetailView, UserTasksView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/<int:user_id>/tasks/', UserTasksView.as_view(), name='user-tasks'), 
    path('users/<int:user_id>/tasks/<int:task_id>/', UserTaskDetailView.as_view(), name='user-task-detail'), 
    path('user-routine/', UserRoutineView.as_view(), name='user-routines'),
    
]
