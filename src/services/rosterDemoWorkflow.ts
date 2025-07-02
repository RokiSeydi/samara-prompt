interface WorkflowStep {
  step: string;
  status: "pending" | "processing" | "completed" | "error";
  description: string;
  result?: string;
  timeElapsed?: number;
}

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

interface RosterDemoResult {
  id: string;
  prompt: string;
  status: "processing" | "completed" | "error";
  steps: WorkflowStep[];
  results: WorkflowResultItem[];
  totalTimeElapsed: number;
  timeSaved: number;
  summary: string;
  timestamp: Date;
  complianceLogId?: string;
}

// Multiple demo scenarios for different roster situations
const DEMO_SCENARIOS = {
  "sick_coverage": {
    name: "Sick Leave Coverage",
    description: "Handle last-minute sick calls and find coverage",
    fileName: "sample_driver_roster.xlsx",
    totalDrivers: 45,
    scheduledShifts: 156,
    unstaffedShifts: 7,
    complianceIssues: 3,
    riskLevel: "Medium",
    detectedIssues: [
      {
        driver: "Driver C112",
        shift: "06:00-14:00",
        location: "Southend Depot",
        issue: "Called in sick - no coverage",
        severity: "High",
        replacement: "Driver B089",
        complianceNote: "Fatigue limits: OK (48h rest period)",
      },
      {
        driver: "Multiple",
        shift: "14:00-22:00",
        location: "Wickford Station",
        issue: "2 drivers short for peak service",
        severity: "High",
        replacement: "Drivers D045, F123 (overtime)",
        complianceNote: "Working Time Directive: Within limits",
      },
      {
        driver: "Driver A067",
        shift: "22:00-06:00",
        location: "Pitsea Junction",
        issue: "Night shift understaffed",
        severity: "Medium",
        replacement: "Extend current shift (with approval)",
        complianceNote: "11-hour daily rest required after shift",
      },
    ],
    suggestedActions: [
      "Assign Driver B089 to cover morning shift at Southend Depot",
      "Approve overtime for Drivers D045 and F123 for evening peak",
      "Request shift extension approval for Driver A067 night coverage",
      "Update fatigue monitoring records for all affected drivers",
      "Notify depot managers of revised assignments via Teams",
    ],
    complianceSummary: {
      workingTimeDirective: "Compliant",
      fatigueRegulations: "Compliant with monitoring",
      restPeriods: "All requirements met",
      weeklyHourLimits: "3 drivers approaching limits",
      riskMitigation: "Medium risk - additional monitoring required",
    },
    estimatedSavings: {
      timeHours: 4.5,
      costSaving: "£2,340",
      complianceRisk: "Reduced by 75%",
      operationalEfficiency: "Improved by 12%",
    },
    messages: [
      {
        recipient: "All Depot Managers",
        subject: "Urgent: Roster Updates - Multiple Shift Changes",
        content: "Critical staffing updates for today's operations. 3 shifts require immediate attention. All compliance requirements verified.",
        type: "manager",
      },
      {
        recipient: "Driver C112",
        subject: "Shift Update - Sick Leave Approved",
        content: "Your sick leave has been approved. Driver B089 will cover your shift. Rest well.",
        type: "driver",
      },
      {
        recipient: "Southend Depot Manager",
        subject: "Urgent: Driver Coverage Update - Morning Shift",
        content: "Driver C112 called in sick. Driver B089 assigned to cover 06:00-14:00 shift. Fatigue compliance verified.",
        type: "manager",
      },
      {
        recipient: "Drivers D045 & F123",
        subject: "Overtime Opportunity - Evening Peak Service",
        content: "Overtime approved for 14:00-22:00 shift at Wickford Station. Working Time Directive compliance confirmed.",
        type: "driver",
      },
    ],
  },
  "holiday_planning": {
    name: "Holiday Period Optimization",
    description: "Optimize staffing for bank holidays and peak travel periods",
    fileName: "sample_driver_roster.xlsx",
    totalDrivers: 45,
    scheduledShifts: 198,
    unstaffedShifts: 12,
    complianceIssues: 1,
    riskLevel: "Low",
    detectedIssues: [
      {
        driver: "Multiple",
        shift: "All Shifts",
        location: "All Depots",
        issue: "Bank Holiday Monday - 27% increase in passenger demand",
        severity: "Medium",
        replacement: "15 additional drivers on standby",
        complianceNote: "Holiday pay rates applied, rest periods maintained",
      },
      {
        driver: "Driver Pool",
        shift: "Peak Hours 07:00-09:00, 17:00-19:00",
        location: "Central London Routes",
        issue: "Anticipated 40% service increase needed",
        severity: "Medium",
        replacement: "8 spare drivers allocated to peak routes",
        complianceNote: "All within weekly hour limits",
      },
    ],
    suggestedActions: [
      "Deploy 15 standby drivers across all major routes",
      "Increase service frequency on routes 12, 45, and 67 by 25%",
      "Activate holiday pay rates for all extra shifts",
      "Pre-position spare vehicles at Stratford and King's Cross",
      "Set up command center for real-time adjustments",
    ],
    complianceSummary: {
      workingTimeDirective: "Compliant",
      fatigueRegulations: "All green - extra rest scheduled",
      restPeriods: "Enhanced monitoring active",
      weeklyHourLimits: "Well within limits",
      riskMitigation: "Low risk - proactive staffing",
    },
    estimatedSavings: {
      timeHours: 12.0,
      costSaving: "£8,750",
      complianceRisk: "Reduced by 90%",
      operationalEfficiency: "Improved by 35%",
    },
    messages: [
      {
        recipient: "All Depot Managers",
        subject: "Bank Holiday Operations - Enhanced Service Plan Active",
        content: "Holiday service plan activated. 15 additional drivers deployed. Command center operational from 05:00.",
        type: "manager",
      },
      {
        recipient: "All Standby Drivers",
        subject: "Bank Holiday Activation - Report for Duty",
        content: "You've been selected for bank holiday service. Holiday pay rates apply. Report to assigned depot 30 mins early.",
        type: "driver",
      },
      {
        recipient: "Route Controllers",
        subject: "Service Frequency Increase - Routes 12, 45, 67",
        content: "Increase service frequency by 25% on designated routes. Extra vehicles positioned and crews assigned.",
        type: "manager",
      },
    ],
  },
  "compliance_audit": {
    name: "Compliance Review",
    description: "Comprehensive audit of working time regulations and fatigue management",
    fileName: "sample_driver_roster.xlsx",
    totalDrivers: 45,
    scheduledShifts: 156,
    unstaffedShifts: 0,
    complianceIssues: 8,
    riskLevel: "High",
    detectedIssues: [
      {
        driver: "Driver F034",
        shift: "Various",
        location: "Multiple",
        issue: "Approaching 48-hour weekly limit (46.5h scheduled)",
        severity: "High",
        replacement: "Redistribute 8 hours to other qualified drivers",
        complianceNote: "Must not exceed Working Time Directive limits",
      },
      {
        driver: "Driver L198",
        shift: "Night Shifts",
        location: "East London",
        issue: "Insufficient rest between shifts (9h gap, 11h required)",
        severity: "Critical",
        replacement: "Remove from Thursday shift, assign replacement",
        complianceNote: "EU Regulation 561/2006 violation risk",
      },
      {
        driver: "Maintenance Team",
        shift: "Weekend",
        location: "Depot",
        issue: "Overtime exceeding safe limits (3 consecutive weeks)",
        severity: "Medium",
        replacement: "Hire temporary maintenance staff",
        complianceNote: "Health & Safety Executive guidelines",
      },
    ],
    suggestedActions: [
      "Immediately remove Driver L198 from Thursday night shift",
      "Redistribute Driver F034's excess hours to 3 other qualified drivers",
      "Engage temporary maintenance contractor for weekend work",
      "Implement automated compliance monitoring system",
      "Schedule mandatory rest period for over-worked drivers",
      "Update fatigue risk management procedures",
    ],
    complianceSummary: {
      workingTimeDirective: "2 Critical Violations Detected",
      fatigueRegulations: "Action Required - 3 Drivers",
      restPeriods: "1 Violation, 2 At-Risk",
      weeklyHourLimits: "5 Drivers Approaching Limits",
      riskMitigation: "High risk - immediate action required",
    },
    estimatedSavings: {
      timeHours: 8.0,
      costSaving: "£15,200",
      complianceRisk: "Reduced by 95%",
      operationalEfficiency: "Maintained during corrections",
    },
    messages: [
      {
        recipient: "Safety Officer",
        subject: "URGENT: Compliance Violations Detected - Immediate Action Required",
        content: "Critical compliance issues identified. 2 drivers must be removed from shifts immediately. Full report attached.",
        type: "manager",
      },
      {
        recipient: "Driver L198",
        subject: "Mandatory Rest Period - Thursday Shift Cancelled",
        content: "For your safety and compliance, Thursday night shift has been cancelled. You must take 24h rest before next duty.",
        type: "driver",
      },
      {
        recipient: "HR Department",
        subject: "Temporary Staff Request - Maintenance Team Support",
        content: "Require temporary maintenance contractor for weekend work. Current team exceeding safe working limits.",
        type: "manager",
      },
    ],
  },
};

export class RosterDemoWorkflow {
  private static instance: RosterDemoWorkflow;
  private processingCallbacks: Set<(progress: number) => void> = new Set();
  private currentScenario: string = "sick_coverage";

  static getInstance(): RosterDemoWorkflow {
    if (!RosterDemoWorkflow.instance) {
      RosterDemoWorkflow.instance = new RosterDemoWorkflow();
    }
    return RosterDemoWorkflow.instance;
  }

  setScenario(scenario: string) {
    if (scenario in DEMO_SCENARIOS) {
      this.currentScenario = scenario;
    }
  }

  getScenarios() {
    return Object.keys(DEMO_SCENARIOS).map(key => ({
      id: key,
      name: DEMO_SCENARIOS[key as keyof typeof DEMO_SCENARIOS].name,
      description: DEMO_SCENARIOS[key as keyof typeof DEMO_SCENARIOS].description,
    }));
  }

  getCurrentData() {
    return DEMO_SCENARIOS[this.currentScenario as keyof typeof DEMO_SCENARIOS];
  }

  subscribeToProgress(callback: (progress: number) => void) {
    this.processingCallbacks.add(callback);
  }

  unsubscribeFromProgress(callback: (progress: number) => void) {
    this.processingCallbacks.delete(callback);
  }

  private notifyProgress(progress: number) {
    this.processingCallbacks.forEach((callback) => callback(progress));
  }

  async processRosterWorkflow(prompt: string): Promise<RosterDemoResult> {
    const data = this.getCurrentData();
    
    const result: RosterDemoResult = {
      id: `roster_demo_${Date.now()}`,
      prompt,
      status: "processing",
      steps: [],
      results: [],
      totalTimeElapsed: 0,
      timeSaved: 0,
      summary: "",
      timestamp: new Date(),
    };

    // Define workflow steps based on the scenario
    const steps: Omit<WorkflowStep, "status" | "timeElapsed">[] = [
      {
        step: "authenticate",
        description: "Authenticating with Microsoft 365 and Graph API",
      },
      {
        step: "search_files",
        description: "Searching for roster Excel files in OneDrive",
      },
      {
        step: "read_excel",
        description: `Reading driver data from ${data.fileName}`,
      },
      {
        step: "analyze_data",
        description: "Analyzing roster patterns and identifying gaps",
      },
      {
        step: "compliance_check",
        description: "Checking Working Time Directive and fatigue regulations",
      },
      {
        step: "generate_solutions",
        description: "Generating optimized staffing solutions",
      },
      {
        step: "create_outputs",
        description: "Creating updated roster files and reports",
      },
      {
        step: "send_notifications",
        description: "Preparing Teams notifications for affected staff",
      },
    ];

    // Simulate processing each step
    for (let i = 0; i < steps.length; i++) {
      const step: WorkflowStep = {
        ...steps[i],
        status: "processing",
        timeElapsed: 0,
      };

      result.steps.push(step);

      // Simulate processing time (reduced for demo)
      const processingTime = Math.random() * 1000 + 500; // 0.5-1.5 seconds
      await new Promise((resolve) => setTimeout(resolve, processingTime));

      step.status = "completed";
      step.timeElapsed = processingTime;

      // Add specific results for each step
      switch (step.step) {
        case "authenticate":
          step.result = "Successfully connected to Microsoft 365";
          break;
        case "search_files":
          step.result = `Found ${data.fileName} in OneDrive/Transportation folder`;
          break;
        case "read_excel":
          step.result = `Loaded ${data.totalDrivers} drivers, ${data.scheduledShifts} scheduled shifts`;
          break;
        case "analyze_data":
          step.result = `Identified ${data.unstaffedShifts} unstaffed shifts, ${data.complianceIssues} compliance issues`;
          break;
        case "compliance_check":
          step.result = `Working Time Directive: ${data.complianceSummary.workingTimeDirective}, Risk Level: ${data.riskLevel}`;
          break;
        case "generate_solutions":
          step.result = `Generated ${data.suggestedActions.length} optimized assignments`;
          break;
        case "create_outputs":
          step.result = "Created updated roster Excel file and compliance report";
          break;
        case "send_notifications":
          step.result = `Prepared Teams messages for ${data.messages.filter((m: any) => m.type === 'manager').length} managers and ${data.messages.filter((m: any) => m.type === 'driver').length} drivers`;
          break;
      }

      const progress = ((i + 1) / steps.length) * 100;
      this.notifyProgress(progress);
    }

    // Generate final results
    result.results = this.generateDemoResults();
    result.status = "completed";
    result.totalTimeElapsed = result.steps.reduce(
      (total, step) => total + (step.timeElapsed || 0),
      0
    );
    result.timeSaved = data.estimatedSavings.timeHours * 60 * 60 * 1000; // Convert to ms
    result.summary = this.generateSummary();

    return result;
  }

  private generateDemoResults(): WorkflowResultItem[] {
    const data = this.getCurrentData();
    
    return [
      {
        type: "file",
        app: "Excel",
        title: `Updated ${data.fileName}`,
        description: `Optimized roster with ${data.suggestedActions.length} changes applied. All compliance requirements verified.`,
        webUrl: "#",
        fileId: "demo_roster_file",
        data: {
          changes: data.detectedIssues.map((issue: any) => ({
            driver: issue.driver,
            shift: issue.shift,
            location: issue.location,
            change: issue.replacement,
            status: "Applied",
            compliance: issue.complianceNote,
          })),
          summary: {
            totalDrivers: data.totalDrivers,
            totalShifts: data.scheduledShifts,
            coverage: `${((data.scheduledShifts - data.unstaffedShifts) / data.scheduledShifts * 100).toFixed(1)}%`,
            riskLevel: data.riskLevel,
          }
        },
        quickActions: [
          {
            label: "View Full Roster",
            iconName: "TableRegular",
            action: () => console.log("View complete roster table"),
            primary: true,
          },
          {
            label: "Download Excel",
            iconName: "DocumentRegular",
            action: () => console.log("Download updated Excel file"),
          },
          {
            label: "Export CSV",
            iconName: "DataTreemapRegular",
            action: () => console.log("Export roster as CSV"),
          },
        ],
      },
      {
        type: "data",
        app: "Analysis",
        title: "Compliance & Safety Report",
        description: `Comprehensive analysis of Working Time Directive compliance and fatigue risk management`,
        data: {
          issues: data.detectedIssues,
          compliance: data.complianceSummary,
          actions: data.suggestedActions,
          riskAssessment: {
            level: data.riskLevel,
            factors: [
              "Driver fatigue monitoring",
              "Rest period compliance", 
              "Weekly hour limits",
              "Emergency coverage capacity"
            ],
            mitigationStatus: data.complianceSummary.riskMitigation,
          }
        },
        quickActions: [
          {
            label: "View Detailed Report",
            iconName: "DocumentPdfRegular",
            action: () => console.log("View comprehensive compliance report"),
            primary: true,
          },
          {
            label: "Export Audit Trail",
            iconName: "ShieldCheckmarkRegular",
            action: () => console.log("Export audit documentation"),
          },
        ],
      },
      {
        type: "action",
        app: "Teams",
        title: "Staff Notifications",
        description: `${data.messages.length} automatic alerts prepared for drivers and managers`,
        data: {
          messages: data.messages,
        },
        quickActions: [
          {
            label: "Preview All Messages",
            iconName: "EyeRegular",
            action: () => console.log("Preview notification messages"),
            primary: true,
          },
          {
            label: "Send All Alerts",
            iconName: "MailRegular",
            action: () => console.log("Send automatic driver and manager alerts"),
          },
          {
            label: "Customize Messages",
            iconName: "EditRegular",
            action: () => console.log("Edit notification templates"),
          },
        ],
      },
      {
        type: "insight",
        app: "Analytics",
        title: "Performance Insights",
        description: "Key metrics and recommendations for roster optimization",
        data: {
          metrics: {
            timeSaved: data.estimatedSavings.timeHours + " hours",
            costSaving: data.estimatedSavings.costSaving,
            complianceRisk: data.estimatedSavings.complianceRisk,
            efficiency: data.estimatedSavings.operationalEfficiency,
          },
          recommendations: this.getRecommendations(),
        },
        quickActions: [
          {
            label: "View Analytics Dashboard",
            iconName: "SparkleRegular",
            action: () => console.log("View detailed analytics"),
            primary: true,
          },
          {
            label: "Schedule Review",
            iconName: "CalendarRegular", 
            action: () => console.log("Schedule performance review"),
          },
        ],
      },
    ];
  }

  private getRecommendations(): string[] {
    const scenario = this.currentScenario;
    
    switch (scenario) {
      case "sick_coverage":
        return [
          "Consider implementing predictive staffing models",
          "Increase rest day pool by 2 drivers for better coverage",
          "Review peak hour patterns for optimization opportunities",
          "Implement automated compliance monitoring",
        ];
      case "holiday_planning":
        return [
          "Establish permanent holiday staffing protocol",
          "Create driver volunteer incentive program",
          "Implement demand forecasting for special events",
          "Pre-book temporary drivers during peak seasons",
        ];
      case "compliance_audit":
        return [
          "Install automated fatigue monitoring system",
          "Mandate minimum 48-hour rest periods for at-risk drivers",
          "Implement real-time compliance dashboard",
          "Establish early warning system for regulation breaches",
        ];
      default:
        return [
          "Optimize roster planning with AI-powered insights",
          "Enhance driver well-being programs",
          "Improve communication channels",
          "Implement proactive risk management",
        ];
    }
  }

  private generateSummary(): string {
    const data = this.getCurrentData();
    const issues = data.detectedIssues.length;
    const actions = data.suggestedActions.length;
    const timeSaved = data.estimatedSavings.timeHours;

    return `Successfully processed ${data.fileName} and resolved ${issues} roster issues through ${actions} optimized assignments. Maintained full compliance with fatigue regulations and Working Time Directive. Estimated time savings: ${timeSaved} hours of manual roster management. All affected staff have been notified via Teams with updated schedules.`;
  }
}

export const rosterDemoWorkflow = RosterDemoWorkflow.getInstance();
