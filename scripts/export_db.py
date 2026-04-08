import sqlite3
import pandas as pd
import os

# Configuration
DB_PATH = r"C:\Users\vishv\.gemini\antigravity\scratch\energy-optimization-platform\backend\db.sqlite3"
EXPORT_DIR = r"C:\Users\vishv\.gemini\antigravity\scratch\energy-optimization-platform\exports"

def export_database():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    if not os.path.exists(EXPORT_DIR):
        os.makedirs(EXPORT_DIR)

    conn = sqlite3.connect(DB_PATH)
    
    # List of tables to export (or get all)
    tables = [
        'energy_data',
        'tickets_ticket',
        'monitoring_log',
        'authentication_user'
    ]

    print(f"Exporting data to {EXPORT_DIR}...")

    for table in tables:
        try:
            df = pd.read_sql_query(f"SELECT * FROM {table}", conn)
            csv_path = os.path.join(EXPORT_DIR, f"{table}.csv")
            df.to_csv(csv_path, index=False)
            print(f"✅ Exported {table} to {csv_path}")
        except Exception as e:
            print(f"❌ Failed to export {table}: {e}")

    conn.close()
    print("\nData export complete! You can open these CSV files in Excel or any text editor.")

if __name__ == "__main__":
    export_database()
