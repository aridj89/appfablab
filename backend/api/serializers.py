from rest_framework import serializers, exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Notification, LabSession

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            email = email.strip()
            user = User.objects.filter(email=email).first()
            if user and user.check_password(password):
                if not user.is_active:
                    raise exceptions.PermissionDenied("User account is disabled.")
                
                refresh = self.get_token(user)
                data = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'is_staff': user.is_staff,
                }
                return data
            else:
                raise exceptions.AuthenticationFailed("No active account found with the given credentials")
        else:
            raise exceptions.ValidationError("Must include 'email' and 'password'.")

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['full_name'] = user.full_name
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'student_card_number', 'is_staff', 'password', 'profile_picture')
        extra_kwargs = {
            'password': {'write_only': True},
            'student_card_number': {'required': False} # Non-admins have it, admins might not
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            student_card_number=validated_data['student_card_number']
        )
        # Create notification for admin
        Notification.objects.create(
            message=f"New user signed up: {user.full_name} ({user.email})"
        )
        return user

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class LabSessionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    duration = serializers.SerializerMethodField()

    class Meta:
        model = LabSession
        fields = ('id', 'user', 'user_email', 'user_name', 'location', 'activity', 'entry_time', 'exit_time', 'duration')
        read_only_fields = ('user', 'entry_time', 'exit_time', 'duration')

    def get_duration(self, obj):
        if obj.exit_time:
            diff = obj.exit_time - obj.entry_time
            return str(diff).split('.')[0] # Format as H:MM:SS
        return "Ongoing"
