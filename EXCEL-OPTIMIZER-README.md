# SAMARA Excel Optimizer - Real Transportation Roster Optimization

## Overview

The SAMARA Excel Optimizer is a production-ready web application that allows transportation companies to upload their existing Excel-based roster files and automatically optimize driver assignments, vehicle allocation, and route scheduling using AI-powered algorithms.

## Key Features

### 🚀 **Real Excel File Processing**

- Upload .xlsx and .xls files directly in the browser
- Automatically detects and parses Drivers, Vehicles, and Routes sheets
- Flexible column mapping supports various Excel formats
- Sample file available for testing

### 🧠 **AI-Powered Optimization**

- Intelligent driver-to-route assignment based on license requirements
- Vehicle allocation optimization considering capacity and maintenance
- Conflict resolution for overlapping schedules
- Cost minimization and efficiency maximization

### 📊 **Comprehensive Analytics**

- Real-time cost savings calculations
- Efficiency improvement metrics
- Conflict resolution tracking
- Before/after comparison views

### 💾 **Export & Integration**

- Download optimized roster as Excel file
- Maintains original format with optimized assignments
- Ready for integration back into existing workflows

## How It Works

### 1. **File Upload & Parsing**

```typescript
// The system automatically detects these sheet patterns:
- Drivers: 'Drivers', 'drivers', 'Driver_List', 'Staff'
- Vehicles: 'Vehicles', 'vehicles', 'Fleet', 'Buses'
- Routes: 'Routes', 'routes', 'Services', 'Lines'
```

### 2. **Data Processing**

The optimizer extracts and normalizes data from Excel sheets:

**Driver Records:**

- ID, Name, License Type
- Shift Times, Current Vehicle/Route
- Status (available, sick, vacation)
- Cost & Hour Constraints

**Vehicle Records:**

- ID, Type, Capacity, Location
- Status, Fuel & Maintenance Costs

**Route Records:**

- ID, Name, Start/End Locations
- Distance, Duration, License Requirements
- Priority Level, Time Windows

### 3. **Optimization Algorithm**

```typescript
async optimizeRoster(drivers, vehicles, routes) {
  // 1. Clear existing assignments
  // 2. Sort routes by priority (high → medium → low)
  // 3. Assign drivers based on:
  //    - License requirements
  //    - Availability status
  //    - Hour constraints
  //    - Location proximity
  // 4. Allocate vehicles considering:
  //    - Capacity requirements
  //    - Maintenance status
  //    - Cost efficiency
  // 5. Resolve conflicts and optimize schedules
  // 6. Calculate metrics and generate recommendations
}
```

### 4. **Results & Export**

- **Cost Savings**: Reduced operational costs through optimal assignments
- **Efficiency Gains**: Improved resource utilization percentages
- **Conflict Resolution**: Eliminated scheduling conflicts
- **Downloadable Excel**: Optimized roster ready for implementation

## Testing with Sample Data

### Quick Start

1. Visit: `http://localhost:5173/?demo=excel-optimizer`
2. Click "Download Sample Excel File"
3. Upload the sample file (25 drivers, 20 vehicles, 15 routes)
4. Click "Optimize with SAMARA"
5. Download the optimized results

### Sample Data Structure

```
📊 Sample Transportation Roster:
├── Drivers Sheet (25 records)
│   ├── Mixed license types (Standard, CDL Class A/B, Passenger)
│   ├── Various shift patterns and locations
│   └── Realistic availability status
├── Vehicles Sheet (20 records)
│   ├── Different vehicle types (Bus, Minibus, Coach, Van)
│   ├── Varying capacities (15-90 passengers)
│   └── Cost and maintenance data
└── Routes Sheet (15 records)
    ├── Priority levels (High/Medium/Low)
    ├── Distance and time requirements
    └── License and capacity constraints
```

## Excel File Format Requirements

### Required Columns (flexible naming):

**Drivers Sheet:**

- ID/Driver ID
- Name/Driver Name
- License/License Type
- Status
- Max Hours, Cost Per Hour

**Vehicles Sheet:**

- ID/Vehicle ID
- Type/Vehicle Type
- Capacity
- Status
- Location

**Routes Sheet:**

- ID/Route ID
- Name/Route Name
- Start Location, End Location
- Distance KM, Estimated Duration
- Required License
- Priority

### Optional Columns:

- Current assignments (will be optimized)
- Shift times, overtime rates
- Fuel costs, maintenance costs
- Time windows, passenger capacity needs

## Architecture

### Frontend Components

```
src/components/RealExcelOptimizer.tsx
├── File Upload Interface
├── Data Summary Dashboard
├── Optimization Progress
├── Results Visualization
└── Export Functionality
```

### Backend Services

```
src/services/realExcelProcessor.ts
├── Excel Parsing (XLSX.js)
├── Data Normalization
├── Optimization Algorithms
├── Metrics Calculation
└── Excel Export
```

## Future Enhancements

### Excel Add-in Version

- Direct integration with Excel
- Real-time optimization within spreadsheets
- One-click "Optimize with SAMARA" button

### Advanced Features

- Break time scheduling
- Overtime minimization
- Multi-day roster planning
- Driver preference consideration
- Vehicle routing optimization
- Regulatory compliance checking

## Usage Examples

### Transportation Companies

- School bus routing optimization
- Public transit scheduling
- Corporate shuttle management
- Medical transport coordination

### Logistics Operations

- Delivery driver assignments
- Vehicle fleet optimization
- Route planning and scheduling
- Cost reduction initiatives

---

## Development Notes

### Technologies Used

- **Frontend**: React, TypeScript, Fluent UI, Framer Motion
- **Excel Processing**: XLSX.js for browser-based parsing
- **Optimization**: Custom algorithms with constraint solving
- **Export**: Excel workbook generation with formatting

### Performance Considerations

- Client-side processing for data privacy
- Progressive optimization with real-time updates
- Efficient memory usage for large datasets
- Responsive UI during heavy calculations

### Testing & Validation

- Sample dataset with realistic transportation scenarios
- Edge case handling (missing data, conflicts)
- Performance testing with large rosters
- Cross-browser compatibility testing

The SAMARA Excel Optimizer represents a significant step toward making AI-powered roster optimization accessible to transportation companies of all sizes, providing immediate value while maintaining compatibility with existing Excel-based workflows.
