import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Set up Django environment
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_root = os.path.join(project_root, 'backend')
sys.path.append(backend_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'energy_platform.settings')
django.setup()

from apps.analytics.models import EnergyData

def rebase():
    qs = EnergyData.objects.all().order_by('timestamp')
    count = qs.count()
    if count == 0:
        print("No data to rebase.")
        return

    print(f"Rebasing {count} records so the latest one is 'now'...")
    latest_record_time = qs.last().timestamp
    now = timezone.now()
    offset = now - latest_record_time

    # Bulk update is faster, but we need to calculate individual offsets if they weren't uniform.
    # Assuming uniform hourly spacing from the import script.
    from django.db.models import F
    EnergyData.objects.all().update(timestamp=F('timestamp') + offset)
    
    print(f"✅ Successfully rebased {count} records. Latest timestamp is now {now.strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    rebase()
