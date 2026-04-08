import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'energy_platform.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = 'admin@energyai.com'
password = 'adminpassword'

if not User.objects.filter(email=email).exists():
    user = User.objects.create_superuser(
        email=email,
        password=password,
        first_name='System',
        last_name='Admin',
        role='admin'
    )
    print(f"Superuser {email} created successfully.")
else:
    print(f"Superuser {email} already exists.")
