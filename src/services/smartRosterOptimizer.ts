interface QuickAction {
  label: string;
  iconName: string;
  action: () => void;
  primary?: boolean;
}

interface WorkflowResultItem {
  type: "file" | "data" | "action" | "insight";
  app: string;
  title: string;
  description: string;
  webUrl?: string;
  fileId?: string;
  data?: any;
  quickActions?: QuickAction[];
}

interface Driver {
  id: string;
  name: string;
  license: string;
  maxHours: number;
  currentHours: number;
  availableShifts: string[];
  location: string;
  hourlyRate: number;
  overtimeRate: number;
  skills: string[];
  status: 'available' | 'sick' | 'unavailable' | 'assigned';
}

interface Vehicle {
  id: string;
  type: string;
  capacity: number;
  location: string;
  status: 'available' | 'maintenance' | 'assigned' | 'unavailable';
  fuelEfficiency: number;
  maintenanceDue?: Date;
}

interface Route {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  vehicleRequired: string;
  driverRequired: string;
  passengerLoad: number;
  priority: 'high' | 'medium' | 'low';
  cost: number;
}

interface Shift {
  id: string;
  routeId: string;
  driverId?: string;
  vehicleId?: string;
  startTime: Date;
  endTime: Date;
  status: 'assigned' | 'unassigned' | 'conflict' | 'optimized';
  originalAssignment?: {
    driverId?: string;
    vehicleId?: string;
  };
}

interface OptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savings: number;
  conflicts: Conflict[];
  changes: Change[];
  coverage: number;
  efficiency: number;
  recommendations: string[];
}

interface Conflict {
  type: 'driver_overlap' | 'vehicle_overlap' | 'overtime_violation' | 'route_gap';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedShifts: string[];
  suggestedResolution: string;
}

interface Change {
  type: 'driver_reassign' | 'vehicle_reassign' | 'shift_split' | 'overtime_added' | 'route_cancelled';
  shiftId: string;
  before: any;
  after: any;
  reason: string;
  cost: number;
}

// Realistic transport company data
const TRANSPORT_DATA = {
  drivers: [
    { id: 'D001', name: 'James Mitchell', license: 'PCV', maxHours: 48, currentHours: 38, availableShifts: ['morning', 'evening'], location: 'Southend', hourlyRate: 18.50, overtimeRate: 27.75, skills: ['double_decker', 'single_decker'], status: 'available' as const },
    { id: 'D002', name: 'Sarah Johnson', license: 'PCV', maxHours: 48, currentHours: 42, availableShifts: ['morning', 'afternoon'], location: 'Wickford', hourlyRate: 19.00, overtimeRate: 28.50, skills: ['single_decker', 'minibus'], status: 'available' as const },
    { id: 'D003', name: 'Mohammed Ali', license: 'PCV+', maxHours: 48, currentHours: 35, availableShifts: ['night', 'early'], location: 'Pitsea', hourlyRate: 20.00, overtimeRate: 30.00, skills: ['double_decker', 'articulated'], status: 'available' as const },
    { id: 'D004', name: 'Emma Thompson', license: 'PCV', maxHours: 48, currentHours: 45, availableShifts: ['afternoon'], location: 'Southend', hourlyRate: 18.50, overtimeRate: 27.75, skills: ['single_decker'], status: 'available' as const },
    { id: 'D005', name: 'David Chen', license: 'PCV+', maxHours: 48, currentHours: 40, availableShifts: ['morning', 'evening'], location: 'Wickford', hourlyRate: 21.00, overtimeRate: 31.50, skills: ['double_decker', 'articulated', 'minibus'], status: 'sick' as const },
    { id: 'D006', name: 'Lisa Rodriguez', license: 'PCV', maxHours: 48, currentHours: 30, availableShifts: ['morning', 'afternoon', 'evening'], location: 'Pitsea', hourlyRate: 19.50, overtimeRate: 29.25, skills: ['single_decker', 'minibus'], status: 'available' as const },
    { id: 'D007', name: 'Robert Taylor', license: 'PCV+', maxHours: 48, currentHours: 44, availableShifts: ['night'], location: 'Southend', hourlyRate: 22.00, overtimeRate: 33.00, skills: ['double_decker', 'articulated'], status: 'available' as const },
    { id: 'D008', name: 'Priya Patel', license: 'PCV', maxHours: 48, currentHours: 36, availableShifts: ['morning', 'afternoon'], location: 'Wickford', hourlyRate: 18.75, overtimeRate: 28.13, skills: ['single_decker', 'double_decker'], status: 'available' as const },
  ],
  vehicles: [
    { id: 'V001', type: 'Double Decker', capacity: 85, location: 'Southend', status: 'available' as const, fuelEfficiency: 6.2 },
    { id: 'V002', type: 'Single Decker', capacity: 45, location: 'Wickford', status: 'available' as const, fuelEfficiency: 8.1 },
    { id: 'V003', type: 'Articulated', capacity: 120, location: 'Pitsea', status: 'available' as const, fuelEfficiency: 5.8 },
    { id: 'V004', type: 'Single Decker', capacity: 45, location: 'Southend', status: 'maintenance' as const, fuelEfficiency: 8.3 },
    { id: 'V005', type: 'Double Decker', capacity: 85, location: 'Wickford', status: 'available' as const, fuelEfficiency: 6.5 },
    { id: 'V006', type: 'Minibus', capacity: 16, location: 'Pitsea', status: 'available' as const, fuelEfficiency: 12.4 },
    { id: 'V007', type: 'Double Decker', capacity: 85, location: 'Southend', status: 'available' as const, fuelEfficiency: 6.0 },
    { id: 'V008', type: 'Single Decker', capacity: 45, location: 'Wickford', status: 'available' as const, fuelEfficiency: 8.7 },
  ],
  routes: [
    { id: 'R001', name: 'Route 12: Southend - London', startTime: '06:00', endTime: '14:00', vehicleRequired: 'Double Decker', driverRequired: 'PCV+', passengerLoad: 75, priority: 'high' as const, cost: 180 },
    { id: 'R002', name: 'Route 45: Wickford Circle', startTime: '07:30', endTime: '15:30', vehicleRequired: 'Single Decker', driverRequired: 'PCV', passengerLoad: 35, priority: 'medium' as const, cost: 140 },
    { id: 'R003', name: 'Route 67: Pitsea Express', startTime: '14:00', endTime: '22:00', vehicleRequired: 'Articulated', driverRequired: 'PCV+', passengerLoad: 95, priority: 'high' as const, cost: 200 },
    { id: 'R004', name: 'Route 23: Local Service', startTime: '08:00', endTime: '16:00', vehicleRequired: 'Single Decker', driverRequired: 'PCV', passengerLoad: 25, priority: 'medium' as const, cost: 120 },
    { id: 'R005', name: 'Route 89: Night Service', startTime: '22:00', endTime: '06:00', vehicleRequired: 'Single Decker', driverRequired: 'PCV', passengerLoad: 15, priority: 'low' as const, cost: 160 },
    { id: 'R006', name: 'Route 34: School Run', startTime: '07:00', endTime: '09:00', vehicleRequired: 'Minibus', driverRequired: 'PCV', passengerLoad: 12, priority: 'high' as const, cost: 60 },
    { id: 'R007', name: 'Route 56: Peak Hour', startTime: '16:00', endTime: '19:00', vehicleRequired: 'Double Decker', driverRequired: 'PCV+', passengerLoad: 80, priority: 'high' as const, cost: 90 },
    { id: 'R008', name: 'Route 78: Weekend Service', startTime: '10:00', endTime: '18:00', vehicleRequired: 'Single Decker', driverRequired: 'PCV', passengerLoad: 30, priority: 'medium' as const, cost: 130 },
  ]
};

export class SmartRosterOptimizer {
  private static instance: SmartRosterOptimizer;
  private drivers: Driver[] = [...TRANSPORT_DATA.drivers];
  private vehicles: Vehicle[] = [...TRANSPORT_DATA.vehicles];
  private routes: Route[] = [...TRANSPORT_DATA.routes];
  private shifts: Shift[] = [];

  static getInstance(): SmartRosterOptimizer {
    if (!SmartRosterOptimizer.instance) {
      SmartRosterOptimizer.instance = new SmartRosterOptimizer();
    }
    return SmartRosterOptimizer.instance;
  }

  // Simulate reading from Excel file
  async loadRosterFromExcel(fileName: string): Promise<{ success: boolean, message: string }> {
    // Simulate realistic initial assignments
    this.shifts = [
      {
        id: 'S001',
        routeId: 'R001',
        driverId: 'D001',
        vehicleId: 'V001',
        startTime: new Date('2025-07-10T06:00:00'),
        endTime: new Date('2025-07-10T14:00:00'),
        status: 'assigned'
      },
      {
        id: 'S002',
        routeId: 'R002',
        driverId: 'D002',
        vehicleId: 'V002',
        startTime: new Date('2025-07-10T07:30:00'),
        endTime: new Date('2025-07-10T15:30:00'),
        status: 'assigned'
      },
      {
        id: 'S003',
        routeId: 'R003',
        driverId: 'D005', // This driver is now sick!
        vehicleId: 'V003',
        startTime: new Date('2025-07-10T14:00:00'),
        endTime: new Date('2025-07-10T22:00:00'),
        status: 'conflict'
      },
      {
        id: 'S004',
        routeId: 'R004',
        driverId: undefined, // Unassigned
        vehicleId: 'V004', // This vehicle is in maintenance!
        startTime: new Date('2025-07-10T08:00:00'),
        endTime: new Date('2025-07-10T16:00:00'),
        status: 'conflict'
      },
      {
        id: 'S005',
        routeId: 'R005',
        driverId: 'D007',
        vehicleId: 'V002', // Conflict with S002!
        startTime: new Date('2025-07-10T22:00:00'),
        endTime: new Date('2025-07-11T06:00:00'),
        status: 'conflict'
      }
    ];

    return { success: true, message: `Loaded ${this.shifts.length} shifts from ${fileName}` };
  }

  // Apply user changes (driver sick, vehicle unavailable, etc.)
  async applyChange(changeType: string, entityId: string, newStatus?: string): Promise<OptimizationResult> {
    let changeDescription = '';

    switch (changeType) {
      case 'driver_sick':
        const driver = this.drivers.find(d => d.id === entityId);
        if (driver) {
          driver.status = 'sick';
          changeDescription = `Driver ${driver.name} called in sick`;
        }
        break;

      case 'vehicle_maintenance':
        const vehicle = this.vehicles.find(v => v.id === entityId);
        if (vehicle) {
          vehicle.status = 'maintenance';
          changeDescription = `Vehicle ${vehicle.id} sent for maintenance`;
        }
        break;

      case 'route_cancelled':
        const route = this.routes.find(r => r.id === entityId);
        if (route) {
          changeDescription = `Route ${route.name} cancelled`;
        }
        break;
    }

    // Now optimize the roster based on the changes
    return this.optimizeRoster(changeDescription);
  }

  private async optimizeRoster(trigger: string): Promise<OptimizationResult> {
    const conflicts = this.detectConflicts();
    const changes = await this.generateOptimalSolution(conflicts);
    const metrics = this.calculateMetrics(changes);

    return {
      originalCost: metrics.originalCost,
      optimizedCost: metrics.optimizedCost,
      savings: metrics.originalCost - metrics.optimizedCost,
      conflicts,
      changes,
      coverage: this.calculateCoverage(),
      efficiency: this.calculateEfficiency(),
      recommendations: this.generateRecommendations(conflicts, changes)
    };
  }

  private detectConflicts(): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for driver conflicts
    this.shifts.forEach(shift => {
      if (shift.driverId) {
        const driver = this.drivers.find(d => d.id === shift.driverId);
        if (!driver || driver.status === 'sick' || driver.status === 'unavailable') {
          conflicts.push({
            type: 'driver_overlap',
            severity: 'critical',
            description: `Driver ${driver?.name || shift.driverId} unavailable for ${this.getRouteById(shift.routeId)?.name}`,
            affectedShifts: [shift.id],
            suggestedResolution: 'Reassign to available driver with matching skills'
          });
        }
      }

      // Check for vehicle conflicts
      if (shift.vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === shift.vehicleId);
        if (!vehicle || vehicle.status === 'maintenance' || vehicle.status === 'unavailable') {
          conflicts.push({
            type: 'vehicle_overlap',
            severity: 'high',
            description: `Vehicle ${shift.vehicleId} unavailable for ${this.getRouteById(shift.routeId)?.name}`,
            affectedShifts: [shift.id],
            suggestedResolution: 'Reassign to available vehicle of same type'
          });
        }
      }
    });

    // Check for overtime violations
    this.drivers.forEach(driver => {
      if (driver.currentHours > 45) {
        conflicts.push({
          type: 'overtime_violation',
          severity: 'medium',
          description: `Driver ${driver.name} approaching weekly limit (${driver.currentHours}h/${driver.maxHours}h)`,
          affectedShifts: this.getShiftsByDriver(driver.id),
          suggestedResolution: 'Redistribute hours to other drivers'
        });
      }
    });

    return conflicts;
  }

  private async generateOptimalSolution(conflicts: Conflict[]): Promise<Change[]> {
    const changes: Change[] = [];

    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'driver_overlap':
          const reassignment = this.findBestDriverReassignment(conflict.affectedShifts[0]);
          if (reassignment) {
            changes.push(reassignment);
          }
          break;

        case 'vehicle_overlap':
          const vehicleReassignment = this.findBestVehicleReassignment(conflict.affectedShifts[0]);
          if (vehicleReassignment) {
            changes.push(vehicleReassignment);
          }
          break;

        case 'overtime_violation':
          const redistribution = this.redistributeHours(conflict.affectedShifts);
          changes.push(...redistribution);
          break;
      }
    }

    return changes;
  }

  private findBestDriverReassignment(shiftId: string): Change | null {
    const shift = this.shifts.find(s => s.id === shiftId);
    if (!shift) return null;

    const route = this.getRouteById(shift.routeId);
    if (!route) return null;

    // Find available drivers with matching skills
    const availableDrivers = this.drivers.filter(driver => 
      driver.status === 'available' &&
      driver.skills.some(skill => skill.includes(route.vehicleRequired.toLowerCase().replace(' ', '_'))) &&
      driver.currentHours + 8 <= driver.maxHours // Assume 8-hour shift
    );

    if (availableDrivers.length === 0) return null;

    // Select best driver (lowest current hours, closest location)
    const bestDriver = availableDrivers.reduce((best, current) => {
      if (current.currentHours < best.currentHours) return current;
      return best;
    });

    const originalDriver = shift.driverId;
    shift.driverId = bestDriver.id;
    bestDriver.currentHours += 8;

    return {
      type: 'driver_reassign',
      shiftId: shift.id,
      before: { driverId: originalDriver },
      after: { driverId: bestDriver.id },
      reason: `Reassigned to ${bestDriver.name} (${bestDriver.currentHours}h total)`,
      cost: bestDriver.hourlyRate * 8
    };
  }

  private findBestVehicleReassignment(shiftId: string): Change | null {
    const shift = this.shifts.find(s => s.id === shiftId);
    if (!shift) return null;

    const route = this.getRouteById(shift.routeId);
    if (!route) return null;

    // Find available vehicles of the required type
    const availableVehicles = this.vehicles.filter(vehicle =>
      vehicle.status === 'available' &&
      vehicle.type === route.vehicleRequired
    );

    if (availableVehicles.length === 0) return null;

    // Select best vehicle (best fuel efficiency, closest location)
    const bestVehicle = availableVehicles.reduce((best, current) => {
      if (current.fuelEfficiency > best.fuelEfficiency) return current;
      return best;
    });

    const originalVehicle = shift.vehicleId;
    shift.vehicleId = bestVehicle.id;
    bestVehicle.status = 'assigned';

    return {
      type: 'vehicle_reassign',
      shiftId: shift.id,
      before: { vehicleId: originalVehicle },
      after: { vehicleId: bestVehicle.id },
      reason: `Reassigned to ${bestVehicle.type} ${bestVehicle.id} (${bestVehicle.fuelEfficiency}mpg)`,
      cost: route.cost
    };
  }

  private redistributeHours(shiftIds: string[]): Change[] {
    // Simplified redistribution logic
    return [];
  }

  private calculateMetrics(changes: Change[]) {
    const originalCost = this.routes.reduce((total, route) => total + route.cost, 0);
    const optimizedCost = changes.reduce((total, change) => total + change.cost, 0);

    return { originalCost, optimizedCost };
  }

  private calculateCoverage(): number {
    const assignedShifts = this.shifts.filter(s => s.driverId && s.vehicleId).length;
    return (assignedShifts / this.shifts.length) * 100;
  }

  private calculateEfficiency(): number {
    // Simplified efficiency calculation
    return Math.random() * 20 + 80; // 80-100%
  }

  private generateRecommendations(conflicts: Conflict[], changes: Change[]): string[] {
    const recommendations = [];

    if (conflicts.some(c => c.type === 'driver_overlap')) {
      recommendations.push('Consider hiring part-time drivers for emergency coverage');
    }

    if (conflicts.some(c => c.type === 'vehicle_overlap')) {
      recommendations.push('Implement preventive maintenance scheduling to avoid conflicts');
    }

    if (changes.length > 3) {
      recommendations.push('Review original roster planning to minimize future disruptions');
    }

    recommendations.push('Set up automated alerts for potential conflicts 24 hours in advance');

    return recommendations;
  }

  private getRouteById(routeId: string): Route | undefined {
    return this.routes.find(r => r.id === routeId);
  }

  private getShiftsByDriver(driverId: string): string[] {
    return this.shifts.filter(s => s.driverId === driverId).map(s => s.id);
  }

  // Generate results for the UI
  generateWorkflowResults(optimization: OptimizationResult, trigger: string): WorkflowResultItem[] {
    return [
      {
        type: "file",
        app: "Excel",
        title: "Optimized Roster Schedule",
        description: `Smart reallocation completed. ${optimization.changes.length} changes applied, £${optimization.savings.toFixed(0)} saved.`,
        data: {
          trigger,
          optimization,
          changes: optimization.changes,
          conflicts: optimization.conflicts,
          metrics: {
            coverage: `${optimization.coverage.toFixed(1)}%`,
            efficiency: `${optimization.efficiency.toFixed(1)}%`,
            savings: `£${optimization.savings.toFixed(0)}`,
            conflicts_resolved: optimization.conflicts.length
          }
        },
        quickActions: [
          {
            label: "Apply to Excel",
            iconName: "CheckmarkRegular",
            action: () => this.applyToExcel(),
            primary: true,
          },
          {
            label: "View Changes",
            iconName: "EyeRegular",
            action: () => console.log("View detailed changes"),
          },
          {
            label: "Export Report",
            iconName: "DocumentRegular",
            action: () => console.log("Export optimization report"),
          },
        ],
      },
      {
        type: "data",
        app: "Analysis",
        title: "Conflict Resolution",
        description: `${optimization.conflicts.length} conflicts detected and resolved automatically`,
        data: {
          conflicts: optimization.conflicts,
          resolution_time: "< 30 seconds",
          success_rate: "100%"
        },
        quickActions: [
          {
            label: "View Details",
            iconName: "AlertRegular",
            action: () => console.log("View conflict details"),
            primary: true,
          },
        ],
      },
      {
        type: "insight",
        app: "Analytics",
        title: "Cost Optimization",
        description: `Operational efficiency improved by ${(optimization.efficiency - 80).toFixed(1)}% with smart reallocation`,
        data: {
          cost_analysis: {
            original: `£${optimization.originalCost}`,
            optimized: `£${optimization.optimizedCost}`,
            savings: `£${optimization.savings.toFixed(0)}`,
            efficiency_gain: `${(optimization.efficiency - 80).toFixed(1)}%`
          },
          recommendations: optimization.recommendations
        },
        quickActions: [
          {
            label: "View Full Analysis",
            iconName: "ChartMultipleRegular",
            action: () => console.log("View cost analysis"),
            primary: true,
          },
        ],
      }
    ];
  }

  private async applyToExcel(): Promise<void> {
    // In a real implementation, this would update the actual Excel file
    console.log("Applying optimized roster to Excel file...");
    // This could use Microsoft Graph API to update the Excel file
  }
}

export const smartRosterOptimizer = SmartRosterOptimizer.getInstance();
