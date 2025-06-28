export interface ComplianceLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  sessionId: string;

  // Request Details
  prompt: string;
  intentAnalysis: {
    primaryGoal: string;
    executionType: "simple" | "complex";
    specificApp?: string;
    dataRequirements: string[];
    outputRequirements: string[];
    stakeholders: string[];
  };

  // Files and Data Access
  filesAccessed: {
    fileId: string;
    fileName: string;
    fileType: string;
    accessType: "read" | "write" | "create" | "delete";
    location: string; // OneDrive, SharePoint, etc.
    size: number;
    lastModified: string;
  }[];

  // Actions Performed
  actionsTaken: {
    action: string;
    app: string;
    description: string;
    status: "completed" | "failed" | "skipped";
    duration: number;
    apiEndpoint?: string;
    parameters?: Record<string, any>;
    result?: string;
    errorMessage?: string;
  }[];

  // Results and Outputs
  outputsCreated: {
    fileName: string;
    fileType: string;
    location: string;
    size: number;
    purpose: string;
  }[];

  // Communication and Sharing
  communicationActions: {
    type: "email" | "meeting" | "teams_message" | "share";
    recipients: string[];
    subject?: string;
    content?: string;
    attachments?: string[];
  }[];

  // Performance and Metrics
  performance: {
    totalDuration: number;
    timeSaved: number;
    actionsCompleted: number;
    actionsFailed: number;
    dataProcessed: number; // bytes
    apiCallsCount: number;
  };

  // Security and Privacy
  security: {
    authenticationMethod: string;
    permissionsUsed: string[];
    dataClassification: "public" | "internal" | "confidential" | "restricted";
    encryptionUsed: boolean;
    auditTrailComplete: boolean;
  };

  // Compliance Metadata
  compliance: {
    regulatoryFrameworks: string[]; // GDPR, HIPAA, SOX, etc.
    dataRetentionPeriod: number; // days
    geographicLocation: string;
    businessJustification: string;
    approvalRequired: boolean;
    approvedBy?: string;
  };

  // AI Processing Details
  aiProcessing: {
    model: string; // Groq Llama-3.1-70B
    promptTokens: number;
    responseTokens: number;
    processingTime: number;
    confidenceScore?: number;
    fallbackUsed: boolean;
  };
}

export interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  reportType: "daily" | "weekly" | "monthly" | "custom";
  period: {
    startDate: Date;
    endDate: Date;
  };

  summary: {
    totalWorkflows: number;
    totalUsers: number;
    totalFilesAccessed: number;
    totalDataProcessed: number;
    averageTimeSaved: number;
    successRate: number;
  };

  userActivity: {
    userId: string;
    userEmail: string;
    workflowCount: number;
    filesAccessed: number;
    dataProcessed: number;
    timeSaved: number;
  }[];

  fileAccess: {
    fileName: string;
    accessCount: number;
    lastAccessed: Date;
    accessedBy: string[];
    dataClassification: string;
  }[];

  securityEvents: {
    eventType: string;
    timestamp: Date;
    userId: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
  }[];

  complianceStatus: {
    framework: string;
    status: "compliant" | "non-compliant" | "review-required";
    issues: string[];
    recommendations: string[];
  }[];
}

export class ComplianceLogger {
  private logs: ComplianceLogEntry[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    console.log(
      "🔒 Compliance Logger initialized with session:",
      this.sessionId
    );
  }

  async startWorkflowLogging(
    userId: string,
    userEmail: string,
    prompt: string,
    intent: any
  ): Promise<string> {
    const logId = this.generateLogId();

    // Ensure intent has the expected structure
    const safeIntent = {
      primaryGoal: intent?.primaryGoal || "Unknown",
      executionType: intent?.executionType || "simple",
      specificApp: intent?.specificApp || null,
      dataRequirements: intent?.dataRequirements || [],
      outputRequirements: intent?.outputRequirements || [],
      stakeholders: intent?.stakeholders || [],
      ...intent, // Keep any other properties
    };

    const logEntry: ComplianceLogEntry = {
      id: logId,
      timestamp: new Date(),
      userId,
      userEmail,
      sessionId: this.sessionId,
      prompt,
      intentAnalysis: {
        primaryGoal: safeIntent.primaryGoal,
        executionType: safeIntent.executionType,
        specificApp: safeIntent.specificApp,
        dataRequirements: safeIntent.dataRequirements,
        outputRequirements: safeIntent.outputRequirements,
        stakeholders: safeIntent.stakeholders,
      },
      filesAccessed: [],
      actionsTaken: [],
      outputsCreated: [],
      communicationActions: [],
      performance: {
        totalDuration: 0,
        timeSaved: 0,
        actionsCompleted: 0,
        actionsFailed: 0,
        dataProcessed: 0,
        apiCallsCount: 0,
      },
      security: {
        authenticationMethod: "Microsoft OAuth 2.0",
        permissionsUsed: [],
        dataClassification: this.classifyDataSensitivity(prompt, safeIntent),
        encryptionUsed: true,
        auditTrailComplete: false,
      },
      compliance: {
        regulatoryFrameworks: this.identifyRegulatoryFrameworks(safeIntent),
        dataRetentionPeriod: this.calculateRetentionPeriod(safeIntent),
        geographicLocation: "Global", // Could be determined from user location
        businessJustification: `AI workflow automation: ${safeIntent.primaryGoal}`,
        approvalRequired: this.requiresApproval(safeIntent),
      },
      aiProcessing: {
        model: "Groq Llama-3.1-70B",
        promptTokens: prompt.length / 4, // Rough estimate
        responseTokens: 0,
        processingTime: 0,
        fallbackUsed: false,
      },
    };

    this.logs.push(logEntry);

    console.log("📋 Compliance log started:", {
      logId,
      userId,
      prompt: prompt.substring(0, 50) + "...",
      dataClassification: logEntry.security.dataClassification,
      regulatoryFrameworks: logEntry.compliance.regulatoryFrameworks,
    });

    return logId;
  }

  async logFileAccess(
    logId: string,
    fileId: string,
    fileName: string,
    fileType: string,
    accessType: "read" | "write" | "create" | "delete",
    location: string,
    size: number,
    lastModified: string
  ): Promise<void> {
    const log = this.findLog(logId);
    if (!log) return;

    const fileAccess = {
      fileId,
      fileName,
      fileType,
      accessType,
      location,
      size,
      lastModified,
    };

    log.filesAccessed.push(fileAccess);
    log.performance.dataProcessed += size;

    console.log("📁 File access logged:", {
      fileName,
      accessType,
      size: this.formatFileSize(size),
      location,
    });

    // Check for sensitive file patterns
    if (this.isSensitiveFile(fileName)) {
      await this.logSecurityEvent(
        logId,
        "sensitive_file_access",
        `Accessed sensitive file: ${fileName}`
      );
    }
  }

  async logAction(
    logId: string,
    action: string,
    app: string,
    description: string,
    status: "completed" | "failed" | "skipped",
    duration: number,
    apiEndpoint?: string,
    parameters?: Record<string, any>,
    result?: string,
    errorMessage?: string
  ): Promise<void> {
    const log = this.findLog(logId);
    if (!log) return;

    const actionLog = {
      action,
      app,
      description,
      status,
      duration,
      apiEndpoint,
      parameters,
      result,
      errorMessage,
    };

    log.actionsTaken.push(actionLog);
    log.performance.apiCallsCount++;

    if (status === "completed") {
      log.performance.actionsCompleted++;
    } else if (status === "failed") {
      log.performance.actionsFailed++;
      await this.logSecurityEvent(
        logId,
        "action_failed",
        `Action failed: ${action} in ${app} - ${errorMessage}`
      );
    }

    console.log("⚡ Action logged:", {
      action,
      app,
      status,
      duration: `${duration}ms`,
      apiEndpoint,
    });
  }

  async logOutputCreation(
    logId: string,
    fileName: string,
    fileType: string,
    location: string,
    size: number,
    purpose: string
  ): Promise<void> {
    const log = this.findLog(logId);
    if (!log) return;

    const output = {
      fileName,
      fileType,
      location,
      size,
      purpose,
    };

    log.outputsCreated.push(output);

    console.log("📄 Output creation logged:", {
      fileName,
      fileType,
      size: this.formatFileSize(size),
      purpose,
    });
  }

  async logCommunication(
    logId: string,
    type: "email" | "meeting" | "teams_message" | "share",
    recipients: string[],
    subject?: string,
    content?: string,
    attachments?: string[]
  ): Promise<void> {
    const log = this.findLog(logId);
    if (!log) return;

    const communication = {
      type,
      recipients,
      subject,
      content,
      attachments,
    };

    log.communicationActions.push(communication);

    console.log("📧 Communication logged:", {
      type,
      recipients: recipients.length,
      subject,
      attachments: attachments?.length || 0,
    });

    // Check for external recipients
    const externalRecipients = recipients.filter(
      (email) => !this.isInternalEmail(email)
    );
    if (externalRecipients.length > 0) {
      await this.logSecurityEvent(
        logId,
        "external_communication",
        `External recipients: ${externalRecipients.join(", ")}`
      );
    }
  }

  async logAIProcessing(
    logId: string,
    responseTokens: number,
    processingTime: number,
    confidenceScore?: number,
    fallbackUsed?: boolean
  ): Promise<void> {
    const log = this.findLog(logId);
    if (!log) return;

    log.aiProcessing.responseTokens = responseTokens;
    log.aiProcessing.processingTime = processingTime;
    log.aiProcessing.confidenceScore = confidenceScore;
    log.aiProcessing.fallbackUsed = fallbackUsed || false;

    console.log("🤖 AI processing logged:", {
      model: log.aiProcessing.model,
      promptTokens: log.aiProcessing.promptTokens,
      responseTokens,
      processingTime: `${processingTime}ms`,
      fallbackUsed,
    });
  }

  async completeWorkflowLogging(
    logId: string,
    totalDuration: number,
    timeSaved: number,
    permissionsUsed: string[]
  ): Promise<void> {
    const log = this.findLog(logId);
    if (!log) return;

    log.performance.totalDuration = totalDuration;
    log.performance.timeSaved = timeSaved;
    log.security.permissionsUsed = permissionsUsed;
    log.security.auditTrailComplete = true;

    console.log("✅ Workflow logging completed:", {
      logId,
      totalDuration: `${totalDuration}ms`,
      timeSaved: `${Math.round(timeSaved / 1000)}s`,
      actionsCompleted: log.performance.actionsCompleted,
      actionsFailed: log.performance.actionsFailed,
      filesAccessed: log.filesAccessed.length,
      dataProcessed: this.formatFileSize(log.performance.dataProcessed),
    });

    // Store log persistently (in production, this would go to a secure database)
    await this.persistLog(log);
  }

  private async logSecurityEvent(
    logId: string,
    eventType: string,
    description: string,
    severity: "low" | "medium" | "high" | "critical" = "medium"
  ): Promise<void> {
    console.log(`🔒 Security event [${severity.toUpperCase()}]:`, {
      logId,
      eventType,
      description,
    });

    // In production, this would trigger security monitoring systems
    if (severity === "high" || severity === "critical") {
      console.warn(
        "🚨 High-severity security event detected - alerting security team"
      );
    }
  }

  async generateComplianceReport(
    reportType: "daily" | "weekly" | "monthly" | "custom",
    startDate?: Date,
    endDate?: Date
  ): Promise<ComplianceReport> {
    const period = this.calculateReportPeriod(reportType, startDate, endDate);
    const relevantLogs = this.logs.filter(
      (log) =>
        log.timestamp >= period.startDate && log.timestamp <= period.endDate
    );

    const report: ComplianceReport = {
      reportId: this.generateReportId(),
      generatedAt: new Date(),
      reportType,
      period,
      summary: this.generateSummary(relevantLogs),
      userActivity: this.generateUserActivity(relevantLogs),
      fileAccess: this.generateFileAccessReport(relevantLogs),
      securityEvents: this.generateSecurityEvents(relevantLogs),
      complianceStatus: this.generateComplianceStatus(relevantLogs),
    };

    console.log("📊 Compliance report generated:", {
      reportId: report.reportId,
      period: `${period.startDate.toISOString().split("T")[0]} to ${
        period.endDate.toISOString().split("T")[0]
      }`,
      totalWorkflows: report.summary.totalWorkflows,
      totalUsers: report.summary.totalUsers,
    });

    return report;
  }

  async exportComplianceData(format: "json" | "csv" | "pdf"): Promise<string> {
    const report = await this.generateComplianceReport("monthly");

    switch (format) {
      case "json":
        return JSON.stringify(report, null, 2);
      case "csv":
        return this.convertToCSV(report);
      case "pdf":
        return this.generatePDFReport(report);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Helper Methods
  private findLog(logId: string): ComplianceLogEntry | undefined {
    return this.logs.find((log) => log.id === logId);
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private classifyDataSensitivity(
    prompt: string,
    intent: any
  ): "public" | "internal" | "confidential" | "restricted" {
    const sensitiveKeywords = [
      "budget",
      "financial",
      "salary",
      "confidential",
      "private",
      "personal",
      "medical",
      "legal",
    ];
    const lowerPrompt = prompt.toLowerCase();

    if (sensitiveKeywords.some((keyword) => lowerPrompt.includes(keyword))) {
      return "confidential";
    }

    const stakeholders = intent.stakeholders || [];
    if (stakeholders.length > 0) {
      return "internal";
    }

    return "internal"; // Default for business workflows
  }

  private identifyRegulatoryFrameworks(intent: any): string[] {
    const frameworks: string[] = ["Microsoft 365 Compliance"];
    const dataRequirements = intent.dataRequirements || [];

    // Add specific frameworks based on content
    if (
      dataRequirements.some((req: string) =>
        req.toLowerCase().includes("personal")
      )
    ) {
      frameworks.push("GDPR");
    }

    if (
      dataRequirements.some((req: string) =>
        req.toLowerCase().includes("financial")
      )
    ) {
      frameworks.push("SOX", "PCI-DSS");
    }

    if (
      dataRequirements.some((req: string) =>
        req.toLowerCase().includes("health")
      )
    ) {
      frameworks.push("HIPAA");
    }

    return frameworks;
  }

  private calculateRetentionPeriod(intent: any): number {
    const dataRequirements = intent.dataRequirements || [];

    // Default retention periods based on data type
    if (
      dataRequirements.some((req: string) =>
        req.toLowerCase().includes("financial")
      )
    ) {
      return 2555; // 7 years for financial data
    }

    if (
      dataRequirements.some((req: string) =>
        req.toLowerCase().includes("personal")
      )
    ) {
      return 1095; // 3 years for personal data
    }

    return 365; // 1 year default
  }

  private requiresApproval(intent: any): boolean {
    // Require approval for sensitive operations
    const stakeholders = intent.stakeholders || [];
    const dataRequirements = intent.dataRequirements || [];

    return (
      stakeholders.length > 5 ||
      dataRequirements.some((req: string) =>
        req.toLowerCase().includes("confidential")
      )
    );
  }

  private isSensitiveFile(fileName: string): boolean {
    const sensitivePatterns = [
      "budget",
      "salary",
      "confidential",
      "private",
      "personal",
      "financial",
    ];
    const lowerFileName = fileName.toLowerCase();
    return sensitivePatterns.some((pattern) => lowerFileName.includes(pattern));
  }

  private isInternalEmail(email: string): boolean {
    // In production, this would check against your organization's domain(s)
    return (
      email.includes("@company.com") || email.includes("@organization.org")
    );
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  private calculateReportPeriod(
    reportType: "daily" | "weekly" | "monthly" | "custom",
    startDate?: Date,
    endDate?: Date
  ): { startDate: Date; endDate: Date } {
    const now = new Date();

    if (reportType === "custom" && startDate && endDate) {
      return { startDate, endDate };
    }

    switch (reportType) {
      case "daily":
        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(now);
        dayEnd.setHours(23, 59, 59, 999);
        return { startDate: dayStart, endDate: dayEnd };

      case "weekly":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return { startDate: weekStart, endDate: now };

      case "monthly":
        const monthStart = new Date(now);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        return { startDate: monthStart, endDate: now };

      default:
        return {
          startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          endDate: now,
        };
    }
  }

  private generateSummary(
    logs: ComplianceLogEntry[]
  ): ComplianceReport["summary"] {
    const uniqueUsers = new Set(logs.map((log) => log.userId));
    const totalDataProcessed = logs.reduce(
      (sum, log) => sum + log.performance.dataProcessed,
      0
    );
    const totalTimeSaved = logs.reduce(
      (sum, log) => sum + log.performance.timeSaved,
      0
    );
    const totalFiles = logs.reduce(
      (sum, log) => sum + log.filesAccessed.length,
      0
    );
    const successfulWorkflows = logs.filter(
      (log) => log.security.auditTrailComplete
    ).length;

    return {
      totalWorkflows: logs.length,
      totalUsers: uniqueUsers.size,
      totalFilesAccessed: totalFiles,
      totalDataProcessed: totalDataProcessed,
      averageTimeSaved: logs.length > 0 ? totalTimeSaved / logs.length : 0,
      successRate:
        logs.length > 0 ? (successfulWorkflows / logs.length) * 100 : 0,
    };
  }

  private generateUserActivity(
    logs: ComplianceLogEntry[]
  ): ComplianceReport["userActivity"] {
    const userMap = new Map<string, any>();

    logs.forEach((log) => {
      if (!userMap.has(log.userId)) {
        userMap.set(log.userId, {
          userId: log.userId,
          userEmail: log.userEmail,
          workflowCount: 0,
          filesAccessed: 0,
          dataProcessed: 0,
          timeSaved: 0,
        });
      }

      const user = userMap.get(log.userId);
      user.workflowCount++;
      user.filesAccessed += log.filesAccessed.length;
      user.dataProcessed += log.performance.dataProcessed;
      user.timeSaved += log.performance.timeSaved;
    });

    return Array.from(userMap.values());
  }

  private generateFileAccessReport(
    logs: ComplianceLogEntry[]
  ): ComplianceReport["fileAccess"] {
    const fileMap = new Map<string, any>();

    logs.forEach((log) => {
      log.filesAccessed.forEach((file) => {
        if (!fileMap.has(file.fileName)) {
          fileMap.set(file.fileName, {
            fileName: file.fileName,
            accessCount: 0,
            lastAccessed: new Date(file.lastModified),
            accessedBy: new Set<string>(),
            dataClassification: log.security.dataClassification,
          });
        }

        const fileInfo = fileMap.get(file.fileName);
        fileInfo.accessCount++;
        fileInfo.accessedBy.add(log.userEmail);

        const accessDate = new Date(file.lastModified);
        if (accessDate > fileInfo.lastAccessed) {
          fileInfo.lastAccessed = accessDate;
        }
      });
    });

    return Array.from(fileMap.values()).map((file) => ({
      ...file,
      accessedBy: Array.from(file.accessedBy),
    }));
  }

  private generateSecurityEvents(
    logs: ComplianceLogEntry[]
  ): ComplianceReport["securityEvents"] {
    // In production, this would come from actual security event logs
    const events: ComplianceReport["securityEvents"] = [];

    logs.forEach((log) => {
      if (log.performance.actionsFailed > 0) {
        events.push({
          eventType: "workflow_failure",
          timestamp: log.timestamp,
          userId: log.userId,
          description: `Workflow failed with ${log.performance.actionsFailed} failed actions`,
          severity: "medium",
        });
      }

      if (log.security.dataClassification === "confidential") {
        events.push({
          eventType: "confidential_data_access",
          timestamp: log.timestamp,
          userId: log.userId,
          description: "Accessed confidential data during workflow",
          severity: "low",
        });
      }
    });

    return events;
  }

  private generateComplianceStatus(
    logs: ComplianceLogEntry[]
  ): ComplianceReport["complianceStatus"] {
    const frameworks = new Set<string>();
    logs.forEach((log) => {
      log.compliance.regulatoryFrameworks.forEach((framework) =>
        frameworks.add(framework)
      );
    });

    return Array.from(frameworks).map((framework) => ({
      framework,
      status: "compliant" as const,
      issues: [],
      recommendations: [
        "Continue regular compliance monitoring",
        "Maintain audit trail completeness",
        "Review data retention policies quarterly",
      ],
    }));
  }

  private convertToCSV(report: ComplianceReport): string {
    // Simplified CSV export - in production, this would be more comprehensive
    const headers = [
      "Timestamp",
      "User",
      "Workflow",
      "Files Accessed",
      "Data Processed",
      "Time Saved",
    ];
    const rows = [headers.join(",")];

    // Add data rows here based on report content

    return rows.join("\n");
  }

  private generatePDFReport(report: ComplianceReport): string {
    // In production, this would generate an actual PDF
    return `PDF Report Generated: ${report.reportId}`;
  }

  private async persistLog(log: ComplianceLogEntry): Promise<void> {
    // In production, this would store to a secure, immutable database
    console.log("💾 Persisting compliance log:", {
      logId: log.id,
      userId: log.userId,
      timestamp: log.timestamp.toISOString(),
      auditTrailComplete: log.security.auditTrailComplete,
    });

    // Store in localStorage for demo purposes
    try {
      const existingLogs = JSON.parse(
        localStorage.getItem("samara_compliance_logs") || "[]"
      );
      existingLogs.push(log);
      localStorage.setItem(
        "samara_compliance_logs",
        JSON.stringify(existingLogs)
      );
    } catch (error) {
      console.warn("Could not persist log to localStorage:", error);
    }
  }

  async getStoredLogs(): Promise<ComplianceLogEntry[]> {
    try {
      const stored = localStorage.getItem("samara_compliance_logs");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Could not retrieve stored logs:", error);
      return [];
    }
  }

  async clearLogs(): Promise<void> {
    this.logs = [];
    localStorage.removeItem("samara_compliance_logs");
    console.log("🗑️ Compliance logs cleared");
  }
}

// Export singleton instance
export const complianceLogger = new ComplianceLogger();
