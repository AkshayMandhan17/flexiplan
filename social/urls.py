from django.urls import path
from .views import UsersView, SendFriendRequestView, RespondToFriendRequestView, ListFriendsView, RemoveFriendView, ViewFriendshipDetailsView, ViewFriendRequestsView

urlpatterns = [
    path('users/', UsersView.as_view(), name='get_all_users'),
    path("friends/send/<int:to_user_id>/", SendFriendRequestView.as_view(), name="send-friend-request"),
    path("friends/respond/<int:request_id>/", RespondToFriendRequestView.as_view(), name="respond-friend-request"),
    path("friends/list/", ListFriendsView.as_view(), name="list-friends"),
    path('friends/remove/<int:friend_id>/', RemoveFriendView.as_view(), name='remove-friend'),
    path("friends/details/", ViewFriendshipDetailsView.as_view(), name="friendship-details"),
    path('friends/requests/', ViewFriendRequestsView.as_view(), name='view_friend_requests'),
]