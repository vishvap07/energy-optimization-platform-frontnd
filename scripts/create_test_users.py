import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'energy_platform.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

users_to_create = [
    {
        'email': 'admin@energyai.com',
        'password': 'adminpassword',
        'first_name': 'System',
        'last_name': 'Admin',
        'role': 'admin',
        'is_superuser': True,
        'is_staff': True
    },
    {
        'email': 'tech@energyai.com',
        'password': 'techpassword',
        'first_name': 'Technical',
        'last_name': 'Support',
        'role': 'technician',
        'is_superuser': False,
        'is_staff': True
    },
    {
        'email': 'user@energyai.com',
        'password': 'userpassword',
        'first_name': 'Standard',
        'last_name': 'Employee',
        'role': 'user',
        'is_superuser': False,
        'is_staff': False
    }
]

for u in users_to_create:
    if not User.objects.filter(email=u['email']).exists():
        if u['is_superuser']:
            user = User.objects.create_superuser(
                email=u['email'],
                password=u['password'],
                first_name=u['first_name'],
                last_name=u['last_name'],
                role=u['role']
            )
        else:
            user = User.objects.create_user(
                email=u['email'],
                password=u['password'],
                first_name=u['first_name'],
                last_name=u['last_name'],
                role=u['role']
            )
        print(f"User {u['email']} ({u['role']}) created successfully.")
    else:
        print(f"User {u['email']} already exists.")
