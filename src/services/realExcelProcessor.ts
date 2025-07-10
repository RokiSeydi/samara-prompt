import * as XLSX from 'xlsx';

interface DriverRecord {
  id: string;
  name: string;
  licenseType: string;
  shiftStart?: string;
  shiftEnd?: string;
  vehicle?: string;
  route?: string;
  location?: string;
  status: 'available' | 'assigned' | 'sick' | 'vacation';
  maxHours: number;
  currentHours: number;
  overtimeRate: number;
  costPerHour: number;
}

interface VehicleRecord {
  id: string;
  type: string;
  capacity: number;
  location: string;
  status: 'available' | 'assigned' | 'maintenance' | 'unavailable';
  fuel_cost_per_km: number;
  maintenance_cost: number;
}

interface RouteRecord {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  distance_km: number;
  estimated_duration: number;
  required_license: string;
  passenger_capacity_needed: number;
  priority: 'high' | 'medium' | 'low';
  time_window_start: string;
  time_window_end: string;
}

export class RealExcelProcessor {
  private static instance: RealExcelProcessor;

  static getInstance(): RealExcelProcessor {
    if (!RealExcelProcessor.instance) {
      RealExcelProcessor.instance = new RealExcelProcessor();
    }
    return RealExcelProcessor.instance;
  }

  async parseExcelFile(file: File): Promise<{
    drivers: DriverRecord[];
    vehicles: VehicleRecord[];
    routes: RouteRecord[];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const drivers = this.extractDriverData(workbook);
          const vehicles = this.extractVehicleData(workbook);
          const routes = this.extractRouteData(workbook);
          
          resolve({ drivers, vehicles, routes });
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private extractDriverData(workbook: XLSX.WorkBook): DriverRecord[] {
    const sheetNames = ['Drivers', 'drivers', 'Driver_List', 'Staff'];
    let sheet: XLSX.WorkSheet | null = null;
    
    for (const name of sheetNames) {
      if (workbook.Sheets[name]) {
        sheet = workbook.Sheets[name];
        break;
      }
    }
    
    if (!sheet) {
      throw new Error('No drivers sheet found');
    }
    
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    
    return jsonData.map((row: any, index: number) => ({
      id: row.ID || row.id || row['Driver ID'] || `D${index + 1}`,
      name: row.Name || row.name || row['Driver Name'] || `Driver ${index + 1}`,
      licenseType: row.License || row.license || row['License Type'] || 'Standard',
      shiftStart: row['Shift Start'] || row.shift_start,
      shiftEnd: row['Shift End'] || row.shift_end,
      vehicle: row.Vehicle || row.vehicle,
      route: row.Route || row.route,
      location: row.Location || row.location || 'Main Depot',
      status: this.normalizeStatus(row.Status || row.status) as DriverRecord['status'],
      maxHours: Number(row['Max Hours'] || row.max_hours || 8),
      currentHours: Number(row['Current Hours'] || row.current_hours || 0),
      overtimeRate: Number(row['Overtime Rate'] || row.overtime_rate || 1.5),
      costPerHour: Number(row['Cost Per Hour'] || row.cost_per_hour || 25),
    }));
  }

  private extractVehicleData(workbook: XLSX.WorkBook): VehicleRecord[] {
    const sheetNames = ['Vehicles', 'vehicles', 'Fleet', 'Buses'];
    let sheet: XLSX.WorkSheet | null = null;
    
    for (const name of sheetNames) {
      if (workbook.Sheets[name]) {
        sheet = workbook.Sheets[name];
        break;
      }
    }
    
    if (!sheet) {
      return this.createDefaultVehicles();
    }
    
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    
    return jsonData.map((row: any, index: number) => ({
      id: row.ID || row.id || row['Vehicle ID'] || `V${index + 1}`,
      type: row.Type || row.type || row['Vehicle Type'] || 'Bus',
      capacity: Number(row.Capacity || row.capacity || 50),
      location: row.Location || row.location || 'Main Depot',
      status: this.normalizeStatus(row.Status || row.status) as VehicleRecord['status'],
      fuel_cost_per_km: Number(row['Fuel Cost Per KM'] || row.fuel_cost || 0.8),
      maintenance_cost: Number(row['Maintenance Cost'] || row.maintenance_cost || 0.15),
    }));
  }

  private extractRouteData(workbook: XLSX.WorkBook): RouteRecord[] {
    const sheetNames = ['Routes', 'routes', 'Services', 'Lines'];
    let sheet: XLSX.WorkSheet | null = null;
    
    for (const name of sheetNames) {
      if (workbook.Sheets[name]) {
        sheet = workbook.Sheets[name];
        break;
      }
    }
    
    if (!sheet) {
      return this.createDefaultRoutes();
    }
    
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    
    return jsonData.map((row: any, index: number) => ({
      id: row.ID || row.id || row['Route ID'] || `R${index + 1}`,
      name: row.Name || row.name || row['Route Name'] || `Route ${index + 1}`,
      start_location: row['Start Location'] || row.start_location || 'Main Depot',
      end_location: row['End Location'] || row.end_location || 'Destination',
      distance_km: Number(row['Distance KM'] || row.distance || 10),
      estimated_duration: Number(row['Estimated Duration'] || row.duration || 30),
      required_license: row['Required License'] || row.license || 'Standard',
      passenger_capacity_needed: Number(row['Passenger Capacity Needed'] || row.capacity || 30),
      priority: this.normalizePriority(row.Priority || row.priority),
      time_window_start: row['Time Window Start'] || row.start_time || '07:00',
      time_window_end: row['Time Window End'] || row.end_time || '17:00',
    }));
  }

  async optimizeRoster(drivers: DriverRecord[], vehicles: VehicleRecord[], routes: RouteRecord[], constraints?: any) {
    const originalData = { drivers: [...drivers], vehicles: [...vehicles], routes: [...routes] };
    
    // COMPLIANCE-FIRST OPTIMIZATION
    const optimizedDrivers = await this.optimizeWithCompliance(drivers, routes, constraints);
    const optimizedVehicles = this.assignVehicles(optimizedDrivers, vehicles, routes);
    
    return {
      originalData,
      optimizedData: {
        drivers: optimizedDrivers,
        vehicles: optimizedVehicles,
        routes: routes
      },
      changes: this.calculateChanges(drivers, optimizedDrivers),
      metrics: this.calculateMetrics(drivers, optimizedDrivers),
      warnings: this.generateWarnings(optimizedDrivers),
      recommendations: this.generateRecommendations(optimizedDrivers, routes)
    };
  }

  // NEW: Method to apply command-based changes
  async applyCommandChanges(command: string, currentData: any): Promise<any> {
    const { drivers, vehicles, routes } = currentData.optimizedData;
    const updatedDrivers = [...drivers];
    const updatedVehicles = [...vehicles];
    
    // Parse and apply command
    const parsedCommand = this.parseCommand(command);
    
    switch (parsedCommand.action) {
      case 'mark_sick':
        this.markDriverSick(updatedDrivers, parsedCommand.target);
        break;
      case 'vehicle_maintenance':
        this.markVehicleMaintenance(updatedVehicles, parsedCommand.target);
        break;
      case 'reduce_hours':
        this.reduceDriverHours(updatedDrivers, parsedCommand.target, parsedCommand.hours);
        break;
      case 'add_overtime':
        this.addRouteOvertime(updatedDrivers, routes, parsedCommand.target);
        break;
      case 'prioritize_routes':
        this.prioritizeRoutes(routes, parsedCommand.target);
        break;
    }
    
    // Re-optimize with the changes
    const reoptimizedDrivers = await this.optimizeWithCompliance(updatedDrivers, routes);
    const reoptimizedVehicles = this.assignVehicles(reoptimizedDrivers, updatedVehicles, routes);
    
    return {
      originalData: currentData.originalData,
      optimizedData: {
        drivers: reoptimizedDrivers,
        vehicles: reoptimizedVehicles,
        routes: routes
      },
      changes: [...currentData.changes, ...this.calculateChanges(drivers, reoptimizedDrivers)],
      metrics: this.calculateMetrics(drivers, reoptimizedDrivers),
      warnings: this.generateWarnings(reoptimizedDrivers),
      recommendations: this.generateRecommendations(reoptimizedDrivers, routes)
    };
  }

  private async optimizeWithCompliance(drivers: DriverRecord[], routes: RouteRecord[], constraints?: any): Promise<DriverRecord[]> {
    const maxHours = constraints?.maxDailyHours || 8;
    const minBreakBetween = constraints?.minBreakBetweenShifts || 1;
    
    // Start with clean slate - reset all assignments
    const optimized = drivers.map(d => ({
      ...d,
      route: undefined,
      vehicle: undefined,
      shiftStart: undefined,
      shiftEnd: undefined,
      currentHours: 0,
      // Keep original status unless already marked as sick/unavailable
      status: ['sick', 'vacation'].includes(d.status) ? d.status : 'available'
    }));

    // Sort routes by priority and time requirements
    const sortedRoutes = routes.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priority[b.priority] - priority[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Secondary sort by time window start
      return this.parseTime(a.time_window_start) - this.parseTime(b.time_window_start);
    });

    // Track assignments for better compliance
    const assignmentLog: { route: string; driver: string; hours: number; startTime: number; endTime: number }[] = [];

    for (const route of sortedRoutes) {
      // Calculate route duration in hours with realistic minimum
      const baseDuration = Math.max(route.estimated_duration / 60, 0.5); // Minimum 30 minutes
      const routeHours = Math.min(baseDuration, maxHours); // Never exceed max hours for single route
      
      const routeStartTime = this.parseTime(route.time_window_start);
      const routeEndTime = routeStartTime + routeHours;
      
      // Find best available driver
      const availableDriver = this.findBestDriver(
        optimized, 
        route, 
        routeHours, 
        routeStartTime, 
        routeEndTime, 
        maxHours,
        assignmentLog,
        minBreakBetween
      );

      if (availableDriver) {
        // Assign the route
        availableDriver.route = route.id;
        availableDriver.shiftStart = route.time_window_start;
        availableDriver.shiftEnd = this.formatTime(routeEndTime);
        availableDriver.currentHours += routeHours;
        availableDriver.status = 'assigned';
        
        // Log this assignment
        assignmentLog.push({
          route: route.id,
          driver: availableDriver.id,
          hours: routeHours,
          startTime: routeStartTime,
          endTime: routeEndTime
        });
        
        console.log(`✅ Assigned ${route.name} to ${availableDriver.name} (${routeHours.toFixed(1)}h) - Total: ${availableDriver.currentHours.toFixed(1)}h`);
      } else {
        console.warn(`⚠️ Could not assign route ${route.name} - no compliant driver available`);
      }
    }

    // Final compliance check
    const violations = optimized.filter(d => d.currentHours > maxHours);
    if (violations.length > 0) {
      console.error(`🚨 COMPLIANCE VIOLATION: ${violations.length} drivers exceed ${maxHours}h limit:`, 
        violations.map(d => `${d.name}: ${d.currentHours.toFixed(1)}h`));
    }

    return optimized;
  }

  private findBestDriver(
    drivers: DriverRecord[], 
    route: RouteRecord, 
    routeHours: number, 
    routeStartTime: number, 
    routeEndTime: number, 
    maxHours: number,
    assignmentLog: any[],
    minBreakBetween: number
  ): DriverRecord | undefined {
    
    const candidates = drivers.filter(driver => {
      // Must be available
      if (driver.status !== 'available') return false;
      
      // Must not already have a route
      if (driver.route) return false;
      
      // Must have required license
      if (!this.hasRequiredLicense(driver, route)) return false;
      
      // STRICT: Hours check - absolutely cannot exceed max hours
      if ((driver.currentHours + routeHours) > maxHours) return false;
      
      // Check for schedule conflicts with existing assignments
      const driverAssignments = assignmentLog.filter(a => a.driver === driver.id);
      for (const assignment of driverAssignments) {
        // Check for time overlap with adequate break time
        const breakNeeded = minBreakBetween;
        if ((routeStartTime < assignment.endTime + breakNeeded && routeEndTime > assignment.startTime - breakNeeded)) {
          return false; // Time conflict
        }
      }
      
      return true;
    });

    if (candidates.length === 0) return undefined;

    // Select best candidate based on multiple criteria
    return candidates.sort((a, b) => {
      // Prefer drivers with fewer current hours (better load balancing)
      const hoursDiff = a.currentHours - b.currentHours;
      if (Math.abs(hoursDiff) > 0.5) return hoursDiff;
      
      // Prefer drivers with exactly matching license (not overqualified)
      const aExact = a.licenseType === route.required_license ? 1 : 0;
      const bExact = b.licenseType === route.required_license ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      
      // Prefer lower cost drivers
      return a.costPerHour - b.costPerHour;
    })[0];
  }

  private hasRequiredLicense(driver: DriverRecord, route: RouteRecord): boolean {
    if (!route.required_license) return true;
    
    const licenseHierarchy = {
      'Standard': 1,
      'Passenger': 2,
      'CDL Class B': 3,
      'CDL Class A': 4
    };
    
    const driverLevel = licenseHierarchy[driver.licenseType as keyof typeof licenseHierarchy] || 1;
    const requiredLevel = licenseHierarchy[route.required_license as keyof typeof licenseHierarchy] || 1;
    
    return driverLevel >= requiredLevel;
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + (minutes || 0) / 60;
  }

  private formatTime(decimalHours: number): string {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private calculateChanges(original: DriverRecord[], optimized: DriverRecord[]) {
    const changes = [];
    let reassignments = 0;

    optimized.forEach((driver, index) => {
      if (driver.route !== original[index].route) {
        reassignments++;
      }
    });

    if (reassignments > 0) {
      changes.push({
        type: 'driver_reassigned',
        description: `${reassignments} drivers reassigned with 8-hour compliance`,
        impact: 'Improved work-life balance and regulatory compliance',
        cost_change: 0
      });
    }

    return changes;
  }

  private calculateMetrics(original: DriverRecord[], optimized: DriverRecord[]) {
    const assignedCount = optimized.filter(d => d.status === 'assigned').length;
    const totalCount = optimized.length;
    const complianceViolations = optimized.filter(d => d.currentHours > 8).length;

    return {
      total_cost_before: totalCount * 200,
      total_cost_after: assignedCount * 200,
      cost_savings: Math.max(0, (totalCount - assignedCount) * 50),
      efficiency_improvement: (assignedCount / totalCount) * 100,
      conflicts_resolved: Math.max(0, original.filter(d => d.currentHours > 8).length - complianceViolations),
      overtime_hours_saved: Math.max(0, original.reduce((sum, d) => sum + Math.max(0, d.currentHours - 8), 0))
    };
  }

  exportToExcel(optimizationResult: any): Blob {
    const wb = XLSX.utils.book_new();
    
    const driversWS = XLSX.utils.json_to_sheet(optimizationResult.optimizedData.drivers);
    const vehiclesWS = XLSX.utils.json_to_sheet(optimizationResult.optimizedData.vehicles);
    const routesWS = XLSX.utils.json_to_sheet(optimizationResult.optimizedData.routes);
    
    XLSX.utils.book_append_sheet(wb, driversWS, 'Optimized_Drivers');
    XLSX.utils.book_append_sheet(wb, vehiclesWS, 'Optimized_Vehicles');
    XLSX.utils.book_append_sheet(wb, routesWS, 'Optimized_Routes');
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  private normalizeStatus(status: string): string {
    if (!status) return 'available';
    const normalized = status.toLowerCase().trim();
    if (['sick', 'vacation', 'maintenance', 'unavailable'].includes(normalized)) {
      return normalized;
    }
    return 'available';
  }

  private normalizePriority(priority: string): 'high' | 'medium' | 'low' {
    if (!priority) return 'medium';
    const normalized = priority.toLowerCase().trim();
    if (['high', 'medium', 'low'].includes(normalized)) {
      return normalized as 'high' | 'medium' | 'low';
    }
    return 'medium';
  }

  private createDefaultVehicles(): VehicleRecord[] {
    return [
      { id: 'V001', type: 'Bus', capacity: 50, location: 'Main Depot', status: 'available', fuel_cost_per_km: 0.8, maintenance_cost: 0.15 }
    ];
  }

  private createDefaultRoutes(): RouteRecord[] {
    return [
      {
        id: 'R001', name: 'Default Route', start_location: 'Main Depot', end_location: 'Downtown',
        distance_km: 15, estimated_duration: 45, required_license: 'Standard', passenger_capacity_needed: 30,
        priority: 'high', time_window_start: '07:00', time_window_end: '09:00'
      }
    ];
  }

  // NEW: Command parsing and processing methods
  private parseCommand(command: string): { action: string; target: string; hours?: number } {
    const cmd = command.toLowerCase();
    
    // Mark driver as sick
    if (cmd.includes('sick') && (cmd.includes('mark') || cmd.includes('driver'))) {
      const nameMatch = command.match(/mark\s+([^,]+)\s+as\s+sick/i) || command.match(/([^,]+)\s+is\s+sick/i);
      const target = nameMatch ? nameMatch[1].trim() : '';
      return { action: 'mark_sick', target };
    }
    
    // Vehicle maintenance
    if (cmd.includes('maintenance') && (cmd.includes('bus') || cmd.includes('vehicle'))) {
      const vehicleMatch = command.match(/(bus|vehicle)\s+([^\s]+)/i);
      const target = vehicleMatch ? vehicleMatch[2] : '';
      return { action: 'vehicle_maintenance', target };
    }
    
    // Reduce hours
    if (cmd.includes('reduce') && cmd.includes('hours')) {
      const nameMatch = command.match(/reduce\s+([^,]+)\s+hours/i);
      const target = nameMatch ? nameMatch[1].trim() : '';
      return { action: 'reduce_hours', target, hours: 4 };
    }
    
    // Add overtime
    if (cmd.includes('overtime') && cmd.includes('route')) {
      const routeMatch = command.match(/route\s+([^\s]+)/i);
      const target = routeMatch ? routeMatch[1] : '';
      return { action: 'add_overtime', target };
    }
    
    // Prioritize routes
    if (cmd.includes('prioritize')) {
      const typeMatch = command.match(/prioritize\s+([^,]+)/i);
      const target = typeMatch ? typeMatch[1].trim() : '';
      return { action: 'prioritize_routes', target };
    }
    
    return { action: 'unknown', target: '' };
  }

  private markDriverSick(drivers: DriverRecord[], driverName: string) {
    const driver = drivers.find(d => 
      d.name.toLowerCase().includes(driverName.toLowerCase()) ||
      d.id.toLowerCase() === driverName.toLowerCase()
    );
    if (driver) {
      driver.status = 'sick';
      driver.route = undefined;
      driver.shiftStart = undefined;
      driver.shiftEnd = undefined;
      driver.currentHours = 0;
    }
  }

  private markVehicleMaintenance(vehicles: VehicleRecord[], vehicleId: string) {
    const vehicle = vehicles.find(v => 
      v.id.toLowerCase() === vehicleId.toLowerCase() ||
      v.id.toLowerCase().includes(vehicleId.toLowerCase())
    );
    if (vehicle) {
      vehicle.status = 'maintenance';
    }
  }

  private reduceDriverHours(drivers: DriverRecord[], driverName: string, maxHours: number) {
    const driver = drivers.find(d => 
      d.name.toLowerCase().includes(driverName.toLowerCase()) ||
      d.id.toLowerCase() === driverName.toLowerCase()
    );
    if (driver) {
      driver.maxHours = Math.min(driver.maxHours, maxHours);
      if (driver.currentHours > maxHours) {
        driver.currentHours = maxHours;
        // May need re-optimization
      }
    }
  }

  private addRouteOvertime(drivers: DriverRecord[], routes: RouteRecord[], routeId: string) {
    const route = routes.find(r => 
      r.id.toLowerCase() === routeId.toLowerCase() ||
      r.name.toLowerCase().includes(routeId.toLowerCase())
    );
    if (route) {
      route.priority = 'high';
      route.estimated_duration = Math.min(route.estimated_duration * 1.2, 480); // Max 8 hours
    }
  }

  private prioritizeRoutes(routes: RouteRecord[], routeType: string) {
    routes.forEach(route => {
      if (route.name.toLowerCase().includes(routeType.toLowerCase()) || 
          route.id.toLowerCase().includes(routeType.toLowerCase())) {
        route.priority = 'high';
      }
    });
  }

  private assignVehicles(drivers: DriverRecord[], vehicles: VehicleRecord[], routes: RouteRecord[]): VehicleRecord[] {
    const updatedVehicles = vehicles.map(v => ({ ...v, status: 'available' as VehicleRecord['status'] }));
    
    drivers.forEach(driver => {
      if (driver.route && driver.status === 'assigned') {
        const route = routes.find(r => r.id === driver.route);
        if (route) {
          // Find suitable available vehicle
          const suitableVehicle = updatedVehicles.find(v => 
            v.status === 'available' && 
            v.capacity >= route.passenger_capacity_needed
          );
          if (suitableVehicle) {
            suitableVehicle.status = 'assigned';
            driver.vehicle = suitableVehicle.id;
          }
        }
      }
    });
    
    return updatedVehicles;
  }

  private generateWarnings(drivers: DriverRecord[]): string[] {
    const warnings = [];
    
    const overworkedDrivers = drivers.filter(d => d.currentHours > 8);
    if (overworkedDrivers.length > 0) {
      warnings.push(`${overworkedDrivers.length} drivers exceed 8-hour limit`);
    }
    
    const unassignedDrivers = drivers.filter(d => d.status === 'available' && !d.route);
    if (unassignedDrivers.length > 0) {
      warnings.push(`${unassignedDrivers.length} drivers remain unassigned`);
    }
    
    return warnings;
  }

  private generateRecommendations(drivers: DriverRecord[], routes: RouteRecord[]): string[] {
    const recommendations = [];
    
    const unassignedRoutes = routes.filter(route => 
      !drivers.some(d => d.route === route.id)
    );
    
    if (unassignedRoutes.length > 0) {
      recommendations.push(`Consider hiring additional drivers for ${unassignedRoutes.length} unassigned routes`);
    }
    
    const avgHours = drivers.reduce((sum, d) => sum + d.currentHours, 0) / drivers.length;
    if (avgHours < 6) {
      recommendations.push('Driver utilization is low - consider route consolidation');
    }
    
    const complianceRate = (drivers.filter(d => d.currentHours <= 8).length / drivers.length) * 100;
    if (complianceRate === 100) {
      recommendations.push('All drivers comply with 8-hour daily limits - excellent compliance!');
    }
    
    return recommendations;
  }
}

export const realExcelProcessor = RealExcelProcessor.getInstance();
