import os
import sys
import django
from datetime import datetime

# Set up Django environment
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_root = os.path.join(project_root, 'backend')
sys.path.append(backend_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'energy_platform.settings')
django.setup()

from apps.forecasting.views import _lstm_forecast, get_prediction_service
from apps.analytics.models import EnergyData

def verify():
    print("Checking prediction service status...")
    svc = get_prediction_service()
    if svc:
        print("✅ Prediction service loaded successfully.")
        print(f"   Model: {svc.model_path}")
        print(f"   Scaler: {svc.scaler_path}")
    else:
        print("❌ Prediction service failed to load.")
        return

    print("\nChecking historical data count...")
    count = EnergyData.objects.count()
    print(f"   Count: {count} records")
    if count < 24:
        print("❌ Not enough data for LSTM forecast (need 24).")
        return
    else:
        print("✅ Sufficient historical data found.")

    print("\nAttempting LSTM forecast...")
    try:
        results, used_lstm = _lstm_forecast(days_ahead=3)
        if used_lstm:
            print("✅ LSTM model used successfully!")
            print(f"   Forecast samples (first 3 days):")
            for r in results[:3]:
                print(f"     {r['date']}: {r['predicted_kwh']} kWh")
        else:
            print("❌ LSTM model was NOT used (fell back to synthetic).")
    except Exception as e:
        print(f"❌ LSTM forecast execution error: {e}")

if __name__ == "__main__":
    verify()
