from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', False)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField('email address', unique=True)
    full_name = models.CharField(max_length=255)
    student_card_number = models.CharField(max_length=50, unique=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'student_card_number']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Notification(models.Model):
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message[:50]

class LabSession(models.Model):
    LOCATION_CHOICES = [
        ('SALLE_ELECTRONIC', 'Salle Electronic'),
        ('SALLE_MECANIC', 'Salle Mecanic'),
        ('SALLE_MAINTENANCE', 'Salle Maintenance'),
        ('BUREAU_3D', 'Bureaux pour l\'impression 3D'),
        ('BUREAU_CC', 'Bureaux pour CC'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lab_sessions')
    location = models.CharField(max_length=50, choices=LOCATION_CHOICES)
    activity = models.TextField()
    entry_time = models.DateTimeField(auto_now_add=True)
    exit_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.location} ({self.entry_time})"
