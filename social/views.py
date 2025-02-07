from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

# Serializer for the User model
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']  # Include necessary fields

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