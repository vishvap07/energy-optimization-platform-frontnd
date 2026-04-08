import csv
import random
import math
from datetime import datetime, timedelta

# Configuration
NUM_MONTHS = 6
HOURS_PER_DAY = 24
DAYS_IN_MONTH = 30
TOTAL_RECORDS = NUM_MONTHS * DAYS_IN_MONTH * HOURS_PER_DAY

start_date = datetime.now() - timedelta(days=NUM_MONTHS * DAYS_IN_MONTH)

filename = "demo_energy_data.csv"

# Function to simulate typical diurnal load profile
def simulate_demand(hour):
    # Base load + dual peak (morning and evening)
    base = 35.0
    morning_peak = 30.0 * math.exp(-0.2 * (hour - 9)**2)
    evening_peak = 45.0 * math.exp(-0.15 * (hour - 19)**2)
    noise = random.uniform(-5.0, 5.0)
    
    demand = base + morning_peak + evening_peak + noise
    return max(15.0, round(demand, 2))

# Generate data
data = []
current_time = start_date

# Generate a few anomaly indices
anomaly_indices = random.sample(range(TOTAL_RECORDS), 15)

for i in range(TOTAL_RECORDS):
    demand_kw = simulate_demand(current_time.hour)
    
    # Inject anomaly
    if i in anomaly_indices:
        demand_kw += random.uniform(60.0, 150.0) # Massive spike!
    
    # Consumption is roughly demand * 1 hour + noise
    consumption_kwh = max(10.0, round(demand_kw * random.uniform(0.9, 1.1), 2))
    
    # Power factor dips slightly when demand is high
    power_factor = round(random.uniform(0.91, 0.99) - (demand_kw * 0.0005), 3)
    power_factor = max(0.85, min(0.99, power_factor))
    
    voltage = round(random.uniform(225.0, 235.0), 1)
    current = round((demand_kw * 1000) / (voltage * power_factor), 1)
    
    data.append({
        'timestamp': current_time.strftime('%Y-%m-%d %H:%M:%S'),
        'consumption_kwh': consumption_kwh,
        'demand_kw': demand_kw,
        'voltage': voltage,
        'current': current,
        'power_factor': power_factor,
        'temperature': round(random.uniform(15.0, 35.0), 1)
    })
    
    current_time += timedelta(hours=1)

# Write to CSV
with open(filename, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['timestamp', 'consumption_kwh', 'demand_kw', 'voltage', 'current', 'power_factor', 'temperature'])
    writer.writeheader()
    writer.writerows(data)

print(f"Successfully generated {TOTAL_RECORDS} rows of realistic data in {filename}!")
