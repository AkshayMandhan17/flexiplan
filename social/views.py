from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import User, Friendship
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.db import models

# Serializer for the User model
from core.serializers import UserSerializer, FriendshipSerializer

class UsersView(APIView):
    authentication_classes = [JWTAuthentication]  # Enforce JWT authentication
    permission_classes = [IsAuthenticated]  # Require authentication

    def get(self, request):
        """Fetch all users registered in the app."""
        try:
            users = User.objects.all()
            serializer = UserSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SendFriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]  # Enforce JWT authentication
    permission_classes = [IsAuthenticated]  # Require authentication

    def post(self, request, to_user_id):
        """Send a friend request"""
        from_user = request.user
        to_user = get_object_or_404(User, id=to_user_id)

        # Prevent self-friend requests
        if from_user == to_user:
            return Response({"error": "You cannot send a friend request to yourself."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if a request already exists in either direction
        if Friendship.objects.filter(user=from_user, friend=to_user).exists():
            return Response({"error": "Friend request already sent."}, status=status.HTTP_400_BAD_REQUEST)

        if Friendship.objects.filter(user=to_user, friend=from_user).exists():
            return Response({"error": "You have already received a friend request from this user."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the friend request
        friendship = Friendship.objects.create(user=from_user, friend=to_user, status="Pending")
        serializer = FriendshipSerializer(friendship)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RespondToFriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]  # Enforce JWT authentication
    permission_classes = [IsAuthenticated]  # Require authentication

    def post(self, request, request_id):
        """Accept or reject a friend request"""
        friendship = get_object_or_404(Friendship, id=request_id, friend=request.user)
        action = request.data.get("action")

        if action == "Accept":
            friendship.status = "Accepted"
            friendship.save()
            return Response({"message": "Friend request accepted."}, status=status.HTTP_200_OK)
        elif action == "Reject":
            # Delete the Friendship object if the request is rejected
            friendship.delete()
            return Response({"message": "Friend request rejected."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)


class ListFriendsView(APIView):
    authentication_classes = [JWTAuthentication]  # Enforce JWT authentication
    permission_classes = [IsAuthenticated]  # Require authentication

    def get(self, request):
        """List all friends of the authenticated user"""
        friends = Friendship.objects.filter(
            (models.Q(user=request.user) | models.Q(friend=request.user)),
            status="Accepted"
        )

        friend_list = [
            {
                "id": friend.friend.id if friend.user == request.user else friend.user.id,
                "username": friend.friend.username if friend.user == request.user else friend.user.username
            }
            for friend in friends
        ]

        return Response(friend_list, status=status.HTTP_200_OK)
    
class RemoveFriendView(APIView):
    authentication_classes = [JWTAuthentication]  # Enforce JWT authentication
    permission_classes = [IsAuthenticated]  # Require authentication

    def delete(self, request, friend_id):
        """Remove a friend from the authenticated user's friend list"""
        user = request.user
        friendship = Friendship.objects.filter(
            (models.Q(user=user, friend_id=friend_id) | models.Q(user_id=friend_id, friend=user)),
            status="Accepted"
        ).first()

        if not friendship:
            return Response({"error": "Friendship not found."}, status=status.HTTP_404_NOT_FOUND)

        friendship.delete()
        return Response({"message": "Friend removed successfully."}, status=status.HTTP_200_OK)
    
class ViewFriendshipDetailsView(APIView):
    authentication_classes = [JWTAuthentication]  # Enforce JWT authentication
    permission_classes = [IsAuthenticated]  # Require authentication

    def get(self, request):
        """View friendship details of the logged-in user."""
        friendships = Friendship.objects.filter(models.Q(user=request.user) | models.Q(friend=request.user))
        serializer = FriendshipSerializer(friendships, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)