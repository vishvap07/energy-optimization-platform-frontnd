import os
import sys
import pandas as pd
from datetime import datetime
import django

# Set up Django environment
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_root = os.path.join(project_root, 'backend')
sys.path.append(backend_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'energy_platform.settings')
django.setup()

from apps.analytics.models import EnergyData

def import_data(csv_path):
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    print(f"Reading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    print("Clearing existing EnergyData...")
    EnergyData.objects.all().delete()
    
    records = []
    print(f"Preparing {len(df)} records for import...")
    
    for _, row in df.iterrows():
        records.append(EnergyData(
            timestamp=pd.to_datetime(row['timestamp']),
            consumption_kwh=row['consumption_kwh'],
            demand_kw=row['demand_kw'],
            voltage=row.get('voltage', 230.0),
            current=row.get('current', 0.0),
            power_factor=row.get('power_factor', 0.95),
            temperature=row.get('temperature', None),
            source='synthetic_import',
            location='Facility Alpha'
        ))
    
    print("Bulk creating records in database...")
    EnergyData.objects.bulk_create(records, batch_size=1000)
    print(f"Successfully imported {len(records)} records!")

if __name__ == "__main__":
    csv_path = os.path.join(project_root, 'demo_energy_data.csv')
    import_data(csv_path)
