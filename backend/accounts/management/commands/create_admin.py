from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create default admin user if not exists'

    def handle(self, *args, **kwargs):
        email = 'admin@creditcard.com'
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                email=email,
                username='admin',
                password='Admin@123456',
                first_name='System',
                last_name='Admin',
                is_admin=True,
            )
            self.stdout.write(self.style.SUCCESS(f'Admin created: {email} / Admin@123456'))
        else:
            self.stdout.write('Admin already exists.')
