#!/usr/bin/env python3
"""
Create a sample Excel file for testing the SAMARA roster optimization system.
This will generate a realistic transportation roster with drivers, vehicles, and routes.
"""

import pandas as pd
from datetime import datetime, timedelta
import random

def create_sample_roster_data():
    # Create Drivers sheet
    drivers_data = [
        {
            'ID': f'D{str(i+1).zfill(3)}',
            'Name': name,
            'License Type': random.choice(['Standard', 'CDL Class B', 'CDL Class A', 'Passenger']),
            'Shift Start': f"{random.randint(5, 9)}:00",
            'Shift End': f"{random.randint(14, 18)}:00",
            'Vehicle ID': None,  # Will be assigned during optimization
            'Route ID': None,    # Will be assigned during optimization
            'Location': random.choice(['Main Depot', 'North Station', 'South Terminal', 'East Hub']),
            'Status': random.choice(['available', 'available', 'available', 'sick', 'vacation']),
            'Max Hours': random.choice([40, 44, 48]),
            'Current Hours': random.randint(0, 35),
            'Overtime Rate': 1.5,
            'Cost Per Hour': random.randint(22, 35)
        }
        for i, name in enumerate([
            'John Smith', 'Maria Garcia', 'David Johnson', 'Sarah Wilson', 'Michael Brown',
            'Jennifer Davis', 'Robert Miller', 'Lisa Anderson', 'William Taylor', 'Sandra Martinez',
            'James Thompson', 'Patricia White', 'Christopher Lee', 'Nancy Clark', 'Mark Rodriguez',
            'Susan Lewis', 'Daniel Walker', 'Karen Hall', 'Paul Allen', 'Helen Young',
            'Steven King', 'Dorothy Wright', 'Kevin Scott', 'Betty Green', 'Edward Baker'
        ])
    ]
    
    # Create Vehicles sheet
    vehicles_data = [
        {
            'ID': f'V{str(i+1).zfill(3)}',
            'Type': vehicle_type,
            'Capacity': capacity,
            'Location': random.choice(['Main Depot', 'North Station', 'South Terminal', 'East Hub']),
            'Status': random.choice(['available', 'available', 'available', 'maintenance', 'unavailable']),
            'Fuel Cost Per KM': round(random.uniform(0.6, 1.2), 2),
            'Maintenance Cost': round(random.uniform(0.10, 0.25), 2)
        }
        for i, (vehicle_type, capacity) in enumerate([
            ('Standard Bus', 50), ('Standard Bus', 50), ('Standard Bus', 50),
            ('Large Bus', 70), ('Large Bus', 70), ('Large Bus', 70),
            ('Minibus', 25), ('Minibus', 25), ('Minibus', 25),
            ('Coach', 55), ('Coach', 55), ('School Bus', 45),
            ('School Bus', 45), ('School Bus', 45), ('Articulated Bus', 90),
            ('Articulated Bus', 90), ('Van', 15), ('Van', 15),
            ('Shuttle', 20), ('Shuttle', 20)
        ])
    ]
    
    # Create Routes sheet
    routes_data = [
        {
            'ID': f'R{str(i+1).zfill(3)}',
            'Name': route_name,
            'Start Location': start,
            'End Location': end,
            'Distance KM': distance,
            'Estimated Duration': duration,
            'Required License': license_type,
            'Passenger Capacity Needed': capacity,
            'Priority': priority,
            'Time Window Start': start_time,
            'Time Window End': end_time
        }
        for i, (route_name, start, end, distance, duration, license_type, capacity, priority, start_time, end_time) in enumerate([
            ('Downtown Express', 'Main Depot', 'Downtown Terminal', 15, 45, 'Standard', 45, 'high', '07:00', '09:00'),
            ('Airport Shuttle', 'North Station', 'Airport', 25, 55, 'CDL Class B', 30, 'high', '06:00', '22:00'),
            ('School Route A', 'South Terminal', 'Elementary School', 8, 25, 'Passenger', 40, 'high', '07:30', '08:30'),
            ('School Route B', 'East Hub', 'High School', 12, 35, 'Passenger', 50, 'high', '07:15', '08:15'),
            ('Hospital Line', 'Main Depot', 'City Hospital', 18, 40, 'Standard', 35, 'medium', '06:30', '20:00'),
            ('University Express', 'Downtown Terminal', 'University Campus', 20, 50, 'CDL Class A', 60, 'medium', '07:00', '18:00'),
            ('Shopping District', 'North Station', 'Mall Complex', 10, 30, 'Standard', 25, 'low', '09:00', '21:00'),
            ('Industrial Zone', 'East Hub', 'Factory District', 22, 60, 'CDL Class B', 40, 'medium', '05:30', '14:30'),
            ('Suburban Loop', 'South Terminal', 'Residential Area', 16, 45, 'Standard', 35, 'low', '08:00', '19:00'),
            ('Night Shift Special', 'Main Depot', 'Business District', 14, 35, 'Standard', 20, 'low', '22:00', '06:00'),
            ('Weekend Service', 'Downtown Terminal', 'Recreation Center', 12, 30, 'Standard', 30, 'low', '10:00', '16:00'),
            ('Express Commuter', 'North Station', 'Tech Park', 28, 65, 'CDL Class A', 70, 'high', '06:45', '09:15'),
            ('Local Circulator', 'East Hub', 'Town Center', 6, 20, 'Standard', 15, 'medium', '08:00', '17:00'),
            ('Senior Center Route', 'South Terminal', 'Senior Center', 9, 25, 'Passenger', 20, 'medium', '09:00', '15:00'),
            ('Medical Shuttle', 'Main Depot', 'Medical Complex', 11, 30, 'Standard', 25, 'high', '07:00', '19:00')
        ])
    ]
    
    return drivers_data, vehicles_data, routes_data

def create_excel_file():
    """Create the sample Excel file with multiple sheets"""
    drivers_data, vehicles_data, routes_data = create_sample_roster_data()
    
    # Create DataFrames
    drivers_df = pd.DataFrame(drivers_data)
    vehicles_df = pd.DataFrame(vehicles_data)
    routes_df = pd.DataFrame(routes_data)
    
    # Create Excel file with multiple sheets
    with pd.ExcelWriter('sample_transportation_roster.xlsx', engine='openpyxl') as writer:
        drivers_df.to_excel(writer, sheet_name='Drivers', index=False)
        vehicles_df.to_excel(writer, sheet_name='Vehicles', index=False)
        routes_df.to_excel(writer, sheet_name='Routes', index=False)
    
    print("✅ Created sample_transportation_roster.xlsx")
    print(f"📊 Generated {len(drivers_data)} drivers, {len(vehicles_data)} vehicles, {len(routes_data)} routes")
    print("\nSheet Contents:")
    print(f"- Drivers: {len(drivers_data)} records")
    print(f"- Vehicles: {len(vehicles_data)} records") 
    print(f"- Routes: {len(routes_data)} records")
    print("\nFile ready for testing with SAMARA Excel Optimizer!")

if __name__ == "__main__":
    create_excel_file()
