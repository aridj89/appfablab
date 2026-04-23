from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Notification, LabSession

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'full_name', 'student_card_number', 'is_staff')
    search_fields = ('email', 'full_name', 'student_card_number')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'student_card_number')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'student_card_number', 'password'),
        }),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Notification)

@admin.register(LabSession)
class LabSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'entry_time', 'exit_time')
    list_filter = ('location', 'entry_time')
    search_fields = ('user__email', 'user__full_name')
