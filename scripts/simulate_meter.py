"""
Expanded dataset generator for the Energy Optimization Platform.

Generates 12 months of realistic hourly energy data and writes it to
data/energy_dataset.csv. Includes:
  - Seasonal patterns (summer/winter peaks)
  - Weekday vs. weekend variation
  - Daily load curve (morning & evening peaks)
  - Injected anomaly spikes (1% of records)
  - Realistic voltage / current / power factor variation

Usage:
    python scripts/simulate_meter.py             # live simulation (original)
    python scripts/simulate_meter.py --generate  # bulk CSV generation
"""

import os
import sys
import csv
import math
import random
import argparse
import requests
import time
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_URL = "http://localhost:8000/api"
EMAIL = "tech@energyai.com"
PASSWORD = "techpassword"


# ---------------------------------------------------------------------------
# Bulk CSV Generation
# ---------------------------------------------------------------------------

def _base_load(month: int, hour: int, weekday: int) -> float:
    """
    Compute a realistic base load (kWh) for a given month, hour, and day.
    """
    # Seasonal factor: higher in summer (Jun-Aug) and winter (Dec-Feb)
    if month in (12, 1, 2):
        seasonal = 1.15   # winter heating
    elif month in (6, 7, 8):
        seasonal = 1.20   # summer cooling
    elif month in (3, 4, 5, 9, 10, 11):
        seasonal = 0.95   # shoulder seasons
    else:
        seasonal = 1.0

    # Daily load curve: morning peak 7-10, evening peak 18-21
    daily = (
        40
        + 30 * math.sin(math.pi * max(hour - 6, 0) / 16)
        + 15 * math.exp(-0.5 * ((hour - 8.5) / 1.5) ** 2)
        + 20 * math.exp(-0.5 * ((hour - 19.0) / 1.5) ** 2)
    )

    # Weekend reduction: ~30% lower midday
    weekend_factor = 0.72 if weekday >= 5 else 1.0

    return max(10.0, daily * seasonal * weekend_factor)


def generate_csv(months: int = 12, output_path: str = None):
    """
    Generate `months` months of hourly energy data and save to a CSV file.

    Parameters
    ----------
    months : int
        Number of months of data to generate (default 12).
    output_path : str
        Destination CSV path. Defaults to data/energy_dataset.csv relative
        to the project root.
    """
    if output_path is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        output_path = os.path.join(project_root, 'data', 'energy_dataset.csv')

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    start = datetime(2024, 1, 1, 0, 0)
    total_hours = months * 30 * 24   # approximate

    print(f"Generating {total_hours:,} hourly records → {output_path}")

    anomaly_probability = 0.01   # 1% of records get a spike

    fieldnames = [
        'timestamp', 'consumption_kwh', 'demand_kw',
        'voltage', 'current', 'power_factor', 'temperature',
        'source', 'location',
    ]

    with open(output_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for i in range(total_hours):
            ts = start + timedelta(hours=i)

            base = _base_load(ts.month, ts.hour, ts.weekday())

            # Random noise ±8%
            noise = random.gauss(0, base * 0.08)
            consumption = max(5.0, base + noise)

            # Inject anomaly spike
            if random.random() < anomaly_probability:
                consumption *= random.uniform(2.0, 3.5)

            demand = consumption * random.uniform(0.82, 0.92)
            voltage = random.uniform(225, 240)
            current = demand * 1000 / (voltage * math.sqrt(3))   # approx 3-phase
            power_factor = random.uniform(0.90, 0.98)
            # Temperature: seasonal + daily
            temp_base = 15 + 12 * math.sin(math.pi * (ts.month - 3) / 6)
            temperature = temp_base + 6 * math.sin(math.pi * (ts.hour - 6) / 12) + random.gauss(0, 1.5)

            writer.writerow({
                'timestamp': ts.isoformat(),
                'consumption_kwh': round(consumption, 3),
                'demand_kw': round(demand, 3),
                'voltage': round(voltage, 1),
                'current': round(current, 2),
                'power_factor': round(power_factor, 3),
                'temperature': round(temperature, 1),
                'source': 'synthetic_generator_v2',
                'location': 'Building A - Main Meter',
            })

    print(f"Done. {total_hours:,} records written to {output_path}")
    return output_path


# ---------------------------------------------------------------------------
# Live Simulation (original)
# ---------------------------------------------------------------------------

def get_token():
    print(f"Authenticating as {EMAIL}...")
    response = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": EMAIL,
        "password": PASSWORD
    })
    if response.status_code == 200:
        return response.json()['access']
    else:
        print(f"Authentication failed: {response.text}")
        return None


def simulate_meter():
    token = get_token()
    if not token:
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print("Starting smart meter simulation (Ctrl+C to stop)...")

    try:
        while True:
            now = datetime.now()
            hour = now.hour

            base_load = 40 if 8 <= hour <= 20 else 15
            consumption = round(base_load + random.uniform(-5, 15), 2)
            demand = round(consumption * 0.85 + random.uniform(-2, 5), 2)

            payload = {
                "timestamp": now.isoformat(),
                "consumption_kwh": consumption,
                "demand_kw": demand,
                "voltage": round(random.uniform(228, 235), 1),
                "current": round(random.uniform(10, 50), 1),
                "power_factor": round(random.uniform(0.92, 0.98), 2),
                "temperature": round(random.uniform(18, 28), 1),
                "source": "smart_meter_01",
                "location": "Building A - Main Meter"
            }

            print(f"[{now.strftime('%H:%M:%S')}] Pushing data: {consumption} kWh | {demand} kW")

            response = requests.post(f"{BASE_URL}/energy/data", json=payload, headers=headers)

            if response.status_code != 201:
                print(f"Error pushing data: {response.status_code} - {response.text}")
                if response.status_code == 401:
                    token = get_token()
                    headers["Authorization"] = f"Bearer {token}"

            time.sleep(5)

    except KeyboardInterrupt:
        print("\nSimulation stopped.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Smart meter simulator / dataset generator")
    parser.add_argument(
        '--generate', action='store_true',
        help='Generate a bulk CSV dataset instead of running the live simulation'
    )
    parser.add_argument('--months', type=int, default=12, help='Months of data to generate (default: 12)')
    parser.add_argument('--output', type=str, default=None, help='Output CSV path')
    args = parser.parse_args()

    if args.generate:
        generate_csv(months=args.months, output_path=args.output)
    else:
        simulate_meter()
