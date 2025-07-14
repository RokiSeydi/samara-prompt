import React, { useState } from "react";
import {
  Card,
  Text,
  Button,
  Badge,
  Spinner,
  Textarea,
  ProgressBar,
} from "@fluentui/react-components";
import {
  VehicleSubwayRegular,
  CheckmarkCircleRegular,
  WarningRegular,
  AlertRegular,
  ClockRegular,
  FlashRegular,
  PersonRegular,
  CalendarRegular,
  ShieldCheckmarkRegular,
} from "@fluentui/react-icons";
import { motion } from "framer-motion";
import { rosterDemoWorkflow } from "../services/rosterDemoWorkflow";

// Helper functions
const getAppColor = (app: string): string => {
  const colors: { [key: string]: string } = {
    Excel: "#217346",
    Word: "#2B579A",
    Teams: "#6264A7",
    Analysis: "#0078D4",
    Analytics: "#5C2D91",
    PowerBI: "#F2C811",
  };
  return colors[app] || "#0078D4";
};

const renderResultData = (result: any) => {
  if (!result.data) return null;

  if (result.app === "Analysis" && result.data.issues) {
    return (
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px",
        }}
      >
        <Text
          style={{
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "10px",
            display: "block",
            color: "#d13438",
          }}
        >
          ⚠️ Issues Found: {result.data.issues.length}
        </Text>
        {result.data.issues.slice(0, 2).map((issue: any, i: number) => (
          <div
            key={i}
            style={{
              marginBottom: "8px",
              padding: "8px",
              backgroundColor: "white",
              borderRadius: "4px",
              borderLeft: "3px solid #d13438",
            }}
          >
            <Text
              style={{ fontSize: "13px", fontWeight: 600, color: "#323130" }}
            >
              {issue.location} - {issue.shift}
            </Text>
            <Text style={{ fontSize: "12px", color: "#666", display: "block" }}>
              {issue.issue}
            </Text>
          </div>
        ))}
      </div>
    );
  }

  if (result.app === "Excel" && result.data.changes) {
    return (
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px",
        }}
      >
        <Text
          style={{
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "15px",
            display: "block",
            color: "#217346",
          }}
        >
          📊 Updated Roster Changes
        </Text>
        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          {result.data.changes.map((change: any, i: number) => (
            <div
              key={i}
              style={{
                marginBottom: "10px",
                padding: "12px",
                backgroundColor: "white",
                borderRadius: "6px",
                borderLeft: "4px solid #217346",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <Text
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#323130",
                    display: "block",
                  }}
                >
                  {change.location} • {change.shift}
                </Text>
                <Text
                  style={{ fontSize: "12px", color: "#666", display: "block" }}
                >
                  {change.change}
                </Text>
              </div>
              <Badge
                appearance="tint"
                color="success"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Updated
              </Badge>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            backgroundColor: "#dff6dd",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckmarkCircleRegular
            style={{ fontSize: "16px", color: "#107C10" }}
          />
          <Text style={{ fontSize: "12px", color: "#107C10", fontWeight: 500 }}>
            {result.data.resolvedShifts} shifts resolved •{" "}
            {result.data.totalDrivers} drivers optimized
          </Text>
        </div>
      </div>
    );
  }

  if (result.app === "Teams" && result.data.messages) {
    return (
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px",
        }}
      >
        <Text
          style={{
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "12px",
            display: "block",
            color: "#6264A7",
          }}
        >
          📨 Automatic Driver & Manager Alerts
        </Text>
        <div
          style={{
            marginBottom: "12px",
            padding: "10px",
            backgroundColor: "#fff4ce",
            borderRadius: "6px",
            borderLeft: "4px solid #f7b900",
          }}
        >
          <Text
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#8a6914",
              display: "block",
              marginBottom: "4px",
            }}
          >
            🚨 Instant Notifications Sent
          </Text>
          <Text style={{ fontSize: "11px", color: "#8a6914" }}>
            All affected drivers and managers automatically receive SMS and
            Teams alerts about roster changes
          </Text>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              padding: "8px",
              backgroundColor: "#e6f7ff",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#0078D4",
                display: "block",
              }}
            >
              {
                result.data.messages.filter((msg: any) => msg.type === "driver")
                  .length
              }
            </Text>
            <Text style={{ fontSize: "11px", color: "#666" }}>
              Drivers Notified
            </Text>
          </div>
          <div
            style={{
              padding: "8px",
              backgroundColor: "#f0f9ff",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#0078D4",
                display: "block",
              }}
            >
              {
                result.data.messages.filter(
                  (msg: any) => msg.type === "manager"
                ).length
              }
            </Text>
            <Text style={{ fontSize: "11px", color: "#666" }}>
              Managers Notified
            </Text>
          </div>
        </div>
        {result.data.messages.slice(0, 2).map((message: any, i: number) => (
          <div
            key={i}
            style={{
              marginBottom: "8px",
              padding: "8px",
              backgroundColor: "white",
              borderRadius: "4px",
              borderLeft: `3px solid ${
                message.type === "driver" ? "#107C10" : "#6264A7"
              }`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "2px",
              }}
            >
              <Text
                style={{ fontSize: "13px", fontWeight: 600, color: "#323130" }}
              >
                {message.recipient}
              </Text>
              <Badge
                appearance="tint"
                color={message.type === "driver" ? "success" : "brand"}
                style={{ fontSize: "10px" }}
              >
                {message.type}
              </Badge>
            </div>
            <Text style={{ fontSize: "12px", color: "#666", display: "block" }}>
              {message.subject}
            </Text>
          </div>
        ))}
      </div>
    );
  }

  if (result.app === "Analytics" && result.data.metrics) {
    return (
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "8px",
              backgroundColor: "white",
              borderRadius: "4px",
            }}
          >
            <Text
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#107C10",
                display: "block",
              }}
            >
              4.5hrs
            </Text>
            <Text style={{ fontSize: "12px", color: "#666" }}>Time Saved</Text>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "8px",
              backgroundColor: "white",
              borderRadius: "4px",
            }}
          >
            <Text
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#107C10",
                display: "block",
              }}
            >
              £2,340
            </Text>
            <Text style={{ fontSize: "12px", color: "#666" }}>
              Cost Savings
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const getCurrentProcessingStep = (progress: number): string => {
  if (progress < 15) return "Connecting to Microsoft 365";
  if (progress < 30) return "Searching for roster Excel files";
  if (progress < 45) return "Reading driver roster data";
  if (progress < 60) return "Analyzing shifts and coverage gaps";
  if (progress < 75) return "Checking compliance and regulations";
  if (progress < 90) return "Generating optimized assignments";
  return "Creating outputs and notifications";
};

const getCurrentProcessingDescription = (progress: number): string => {
  if (progress < 15) return "Authenticating with Azure AD and SharePoint";
  if (progress < 30) return "Found sample_driver_roster.xlsx in OneDrive";
  if (progress < 45) return "Loading 45 drivers and 156 scheduled shifts";
  if (progress < 60) return "Identified 7 unstaffed shifts and coverage issues";
  if (progress < 75) return "Verifying Working Time Directive compliance";
  if (progress < 90) return "Optimizing roster assignments and replacements";
  return "Preparing Teams notifications and updated files";
};

export const RosterManagementDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<
    "overview" | "processing" | "results" | "roster_view" | "message_preview"
  >("overview");
  const [customPrompt, setCustomPrompt] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  const [selectedScenario, setSelectedScenario] = useState("sick_coverage");
  const [showFullRoster, setShowFullRoster] = useState(false);
  const [showMessagePreview, setShowMessagePreview] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<any[]>([]);

  // Get available scenarios
  const scenarios = rosterDemoWorkflow.getScenarios();

  // Set the current scenario in the workflow
  React.useEffect(() => {
    rosterDemoWorkflow.setScenario(selectedScenario);
  }, [selectedScenario]);

  const handleStartDemo = async (prompt: string) => {
    setCurrentStep("processing");
    setProcessingProgress(0);

    const progressCallback = (progress: number) =>
      setProcessingProgress(progress);
    rosterDemoWorkflow.subscribeToProgress(progressCallback);

    try {
      const result = await rosterDemoWorkflow.processRosterWorkflow(prompt);
      setWorkflowResult(result);
      setCurrentStep("results");
    } catch (error) {
      console.error("Demo failed:", error);
    } finally {
      rosterDemoWorkflow.unsubscribeFromProgress(progressCallback);
    }
  };

  const handleScenarioSelect = async (scenario: string) => {
    setSelectedScenario(scenario);
    // Generate scenario-specific prompt
    const scenarioPrompts = {
      sick_coverage: "Handle urgent sick leave coverage for today's shifts",
      holiday_planning: "Optimize roster for upcoming bank holiday period",
      compliance_audit:
        "Perform comprehensive compliance audit and fix violations",
    };
    const prompt =
      scenarioPrompts[scenario as keyof typeof scenarioPrompts] ||
      `Handle ${scenario} for the upcoming week`;
    setCustomPrompt(prompt);

    // Automatically start the demo for this scenario
    await handleStartDemo(prompt);
  };

  // Render full roster table
  const renderFullRosterTable = () => {
    const data = rosterDemoWorkflow.getCurrentData();

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)",
          padding: "20px",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", color: "white" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Text
              style={{
                fontSize: "28px",
                fontWeight: 300,
                display: "block",
                marginBottom: "10px",
              }}
            >
              Complete Roster View - {data.fileName}
            </Text>
            <Text
              style={{
                fontSize: "16px",
                opacity: 0.9,
                display: "block",
                marginBottom: "20px",
              }}
            >
              Showing all roster changes and compliance status
            </Text>
          </div>

          <Card
            style={{
              padding: "30px",
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              marginBottom: "30px",
            }}
          >
            {/* Summary Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#0078D4",
                    display: "block",
                  }}
                >
                  {data.totalDrivers}
                </Text>
                <Text style={{ fontSize: "14px", color: "#666" }}>
                  Total Drivers
                </Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#0078D4",
                    display: "block",
                  }}
                >
                  {data.scheduledShifts}
                </Text>
                <Text style={{ fontSize: "14px", color: "#666" }}>
                  Scheduled Shifts
                </Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color:
                      data.riskLevel === "High"
                        ? "#d13438"
                        : data.riskLevel === "Medium"
                        ? "#f7b900"
                        : "#107C10",
                    display: "block",
                  }}
                >
                  {data.riskLevel}
                </Text>
                <Text style={{ fontSize: "14px", color: "#666" }}>
                  Risk Level
                </Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#107C10",
                    display: "block",
                  }}
                >
                  {(
                    ((data.scheduledShifts - data.unstaffedShifts) /
                      data.scheduledShifts) *
                    100
                  ).toFixed(1)}
                  %
                </Text>
                <Text style={{ fontSize: "14px", color: "#666" }}>
                  Coverage
                </Text>
              </div>
            </div>

            {/* Changes Table */}
            <Text
              style={{
                fontSize: "18px",
                fontWeight: 600,
                display: "block",
                marginBottom: "15px",
                color: "#323130",
              }}
            >
              📊 Roster Changes Applied
            </Text>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#323130",
                      }}
                    >
                      Driver
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#323130",
                      }}
                    >
                      Shift Time
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#323130",
                      }}
                    >
                      Location
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#323130",
                      }}
                    >
                      Issue
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#323130",
                      }}
                    >
                      Resolution
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#323130",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.detectedIssues.map((issue: any, index: number) => (
                    <tr
                      key={index}
                      style={{ borderBottom: "1px solid #dee2e6" }}
                    >
                      <td style={{ padding: "12px", color: "#323130" }}>
                        {issue.driver}
                      </td>
                      <td style={{ padding: "12px", color: "#323130" }}>
                        {issue.shift}
                      </td>
                      <td style={{ padding: "12px", color: "#323130" }}>
                        {issue.location}
                      </td>
                      <td style={{ padding: "12px", color: "#666" }}>
                        {issue.issue}
                      </td>
                      <td style={{ padding: "12px", color: "#323130" }}>
                        {issue.replacement}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Badge appearance="tint" color="success">
                          Applied
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Compliance Summary */}
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "15px",
                  color: "#323130",
                }}
              >
                🛡️ Compliance Status
              </Text>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                }}
              >
                <div>
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#323130",
                      display: "block",
                    }}
                  >
                    Working Time Directive
                  </Text>
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    {data.complianceSummary.workingTimeDirective}
                  </Text>
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#323130",
                      display: "block",
                    }}
                  >
                    Fatigue Regulations
                  </Text>
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    {data.complianceSummary.fatigueRegulations}
                  </Text>
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#323130",
                      display: "block",
                    }}
                  >
                    Rest Periods
                  </Text>
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    {data.complianceSummary.restPeriods}
                  </Text>
                </div>
              </div>
            </div>
          </Card>

          <div style={{ textAlign: "center" }}>
            <Button
              appearance="primary"
              size="large"
              onClick={() => setShowFullRoster(false)}
              style={{ marginRight: "15px" }}
            >
              ← Back to Results
            </Button>
            <Button
              size="large"
              onClick={() => {
                const csvContent = data.detectedIssues
                  .map(
                    (issue: any) =>
                      `"${issue.driver}","${issue.shift}","${issue.location}","${issue.issue}","${issue.replacement}","Applied"`
                  )
                  .join("\n");
                const blob = new Blob(
                  [
                    `Driver,Shift,Location,Issue,Resolution,Status\n${csvContent}`,
                  ],
                  { type: "text/csv" }
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `roster_changes_${data.fileName.replace(
                  ".xlsx",
                  ".csv"
                )}`;
                a.click();
              }}
            >
              📊 Export CSV
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render message preview
  const renderMessagePreview = () => {
    const data = rosterDemoWorkflow.getCurrentData();

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)",
          padding: "20px",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto", color: "white" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Text
              style={{
                fontSize: "28px",
                fontWeight: 300,
                display: "block",
                marginBottom: "10px",
              }}
            >
              📨 Notification Preview
            </Text>
            <Text
              style={{
                fontSize: "16px",
                opacity: 0.9,
                display: "block",
                marginBottom: "20px",
              }}
            >
              Review all automatic alerts before sending to drivers and managers
            </Text>
          </div>

          <Card
            style={{
              padding: "30px",
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              marginBottom: "30px",
            }}
          >
            <div style={{ marginBottom: "25px" }}>
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "10px",
                  color: "#323130",
                }}
              >
                📊 Notification Summary
              </Text>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    padding: "15px",
                    backgroundColor: "#f0f6ff",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "#0078D4",
                      display: "block",
                    }}
                  >
                    {
                      data.messages.filter((m: any) => m.type === "manager")
                        .length
                    }
                  </Text>
                  <Text style={{ fontSize: "14px", color: "#666" }}>
                    Manager Alerts
                  </Text>
                </div>
                <div
                  style={{
                    padding: "15px",
                    backgroundColor: "#f0f9ff",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "#6264A7",
                      display: "block",
                    }}
                  >
                    {
                      data.messages.filter((m: any) => m.type === "driver")
                        .length
                    }
                  </Text>
                  <Text style={{ fontSize: "14px", color: "#666" }}>
                    Driver Alerts
                  </Text>
                </div>
              </div>
            </div>

            {/* Message List */}
            <div style={{ marginBottom: "25px" }}>
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "15px",
                  color: "#323130",
                }}
              >
                📋 All Messages
              </Text>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                {data.messages.map((message: any, index: number) => (
                  <Card
                    key={index}
                    style={{
                      padding: "20px",
                      backgroundColor: "white",
                      border: `2px solid ${
                        message.type === "driver" ? "#6264A7" : "#0078D4"
                      }`,
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        <Text
                          style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            display: "block",
                            color: "#323130",
                          }}
                        >
                          📧 {message.recipient}
                        </Text>
                        <Badge
                          appearance="tint"
                          color={
                            message.type === "driver" ? "brand" : "success"
                          }
                          style={{ marginTop: "5px" }}
                        >
                          {message.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button size="small" appearance="outline">
                          ✏️ Edit
                        </Button>
                        <Button size="small" appearance="outline">
                          👁️ Preview
                        </Button>
                      </div>
                    </div>

                    <Text
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "8px",
                        color: "#323130",
                      }}
                    >
                      Subject: {message.subject}
                    </Text>

                    <Text
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: "1.4",
                        backgroundColor: "#f8f9fa",
                        padding: "10px",
                        borderRadius: "4px",
                      }}
                    >
                      {message.content}
                    </Text>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          <div style={{ textAlign: "center" }}>
            <Button
              appearance="primary"
              size="large"
              onClick={() => {
                console.log("Sending all notifications...");
                alert("All notifications sent successfully! 📨");
                setShowMessagePreview(false);
              }}
              style={{ marginRight: "15px" }}
            >
              📨 Send All Notifications
            </Button>
            <Button size="large" onClick={() => setShowMessagePreview(false)}>
              ← Back to Results
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Check if we should show alternative views
  if (showFullRoster) {
    return renderFullRosterTable();
  }

  if (showMessagePreview) {
    return renderMessagePreview();
  }

  if (currentStep === "processing") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
            color: "white",
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <VehicleSubwayRegular
              style={{
                fontSize: "50px",
                marginBottom: "20px",
                backgroundColor: "rgba(255,255,255,0.1)",
                padding: "20px",
                borderRadius: "50%",
              }}
            />
            <Text
              style={{
                fontSize: "24px",
                fontWeight: 300,
                display: "block",
                marginBottom: "10px",
              }}
            >
              Processing Your Roster Request
            </Text>
            <Text
              style={{
                fontSize: "16px",
                opacity: 0.8,
                display: "block",
                marginBottom: "30px",
              }}
            >
              Analyzing sample_driver_roster.xlsx and optimizing assignments...
            </Text>
          </motion.div>

          <div style={{ marginBottom: "30px" }}>
            <ProgressBar
              value={processingProgress}
              max={100}
              style={{ width: "100%", height: "8px", marginBottom: "15px" }}
            />
            <Text style={{ fontSize: "18px", fontWeight: 500 }}>
              {Math.round(processingProgress)}% Complete
            </Text>
          </div>

          <Card
            style={{
              padding: "30px",
              backgroundColor: "rgba(255,255,255,0.95)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <Spinner size="large" style={{ marginRight: "15px" }} />
              <div>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    display: "block",
                    color: "#323130",
                  }}
                >
                  {getCurrentProcessingStep(processingProgress)}
                </Text>
                <Text style={{ fontSize: "14px", color: "#666" }}>
                  {getCurrentProcessingDescription(processingProgress)}
                </Text>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <PersonRegular
                  style={{
                    fontSize: "24px",
                    color: "#0078D4",
                    marginBottom: "5px",
                  }}
                />
                <Text
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#323130",
                    display: "block",
                  }}
                >
                  45
                </Text>
                <Text style={{ fontSize: "12px", color: "#666" }}>Drivers</Text>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <CalendarRegular
                  style={{
                    fontSize: "24px",
                    color: "#0078D4",
                    marginBottom: "5px",
                  }}
                />
                <Text
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#323130",
                    display: "block",
                  }}
                >
                  156
                </Text>
                <Text style={{ fontSize: "12px", color: "#666" }}>
                  Scheduled Shifts
                </Text>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <WarningRegular
                  style={{
                    fontSize: "24px",
                    color: "#d13438",
                    marginBottom: "5px",
                  }}
                />
                <Text
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#323130",
                    display: "block",
                  }}
                >
                  7
                </Text>
                <Text style={{ fontSize: "12px", color: "#666" }}>
                  Issues Found
                </Text>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <ShieldCheckmarkRegular
                  style={{
                    fontSize: "24px",
                    color: "#107C10",
                    marginBottom: "5px",
                  }}
                />
                <Text
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#323130",
                    display: "block",
                  }}
                >
                  98%
                </Text>
                <Text style={{ fontSize: "12px", color: "#666" }}>
                  Compliance
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === "results" && workflowResult) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #007D4 0%, #106EBE 100%)",
          padding: "20px",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", color: "white" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <CheckmarkCircleRegular
              style={{
                fontSize: "60px",
                marginBottom: "20px",
                color: "#107C10",
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: "50%",
                padding: "15px",
              }}
            />
            <Text
              style={{
                fontSize: "28px",
                fontWeight: 300,
                display: "block",
                marginBottom: "10px",
              }}
            >
              Roster Analysis Complete!
            </Text>
            <Text
              style={{
                fontSize: "16px",
                opacity: 0.9,
                display: "block",
                marginBottom: "20px",
              }}
            >
              {workflowResult.summary}
            </Text>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "30px",
                marginTop: "20px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    display: "block",
                    color: "#fde300",
                  }}
                >
                  {workflowResult.totalTimeElapsed
                    ? Math.round(workflowResult.totalTimeElapsed / 1000) + "s"
                    : "22s"}
                </Text>
                <Text style={{ fontSize: "14px", opacity: 0.8 }}>
                  Processing Time
                </Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    display: "block",
                    color: "#fde300",
                  }}
                >
                  4.5hrs
                </Text>
                <Text style={{ fontSize: "14px", opacity: 0.8 }}>
                  Time Saved
                </Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    display: "block",
                    color: "#fde300",
                  }}
                >
                  £2,340
                </Text>
                <Text style={{ fontSize: "14px", opacity: 0.8 }}>
                  Cost Savings
                </Text>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            {workflowResult.results?.map((result: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card
                  style={{
                    padding: "25px",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <Badge
                      appearance="filled"
                      style={{
                        backgroundColor: getAppColor(result.app),
                        color: "white",
                        marginRight: "10px",
                      }}
                    >
                      {result.app}
                    </Badge>
                    {result.type === "file" && (
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          backgroundColor: "#f3f2f1",
                          padding: "2px 6px",
                          borderRadius: "3px",
                        }}
                      >
                        FILE
                      </Text>
                    )}
                    {result.type === "action" && (
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          backgroundColor: "#fff4ce",
                          padding: "2px 6px",
                          borderRadius: "3px",
                        }}
                      >
                        ACTION
                      </Text>
                    )}
                    {result.type === "insight" && (
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          backgroundColor: "#dff6dd",
                          padding: "2px 6px",
                          borderRadius: "3px",
                        }}
                      >
                        INSIGHT
                      </Text>
                    )}
                  </div>
                  <Text
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "10px",
                      color: "#323130",
                    }}
                  >
                    {result.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginBottom: "15px",
                      flex: 1,
                    }}
                  >
                    {result.description}
                  </Text>
                  {result.data && renderResultData(result)}
                  {result.quickActions && (
                    <div
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      {result.quickActions.map((action: any, i: number) => (
                        <Button
                          key={i}
                          size="medium"
                          appearance={action.primary ? "primary" : "outline"}
                          onClick={action.action}
                          style={{
                            flex: action.primary ? "1" : "auto",
                            minHeight: "36px",
                            fontWeight: 500,
                            borderRadius: "6px",
                            padding: "8px 16px",
                            boxShadow: action.primary
                              ? "0 2px 4px rgba(0,120,212,0.2)"
                              : "0 1px 2px rgba(0,0,0,0.1)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )) || []}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Button
              appearance="primary"
              size="large"
              onClick={() => setCurrentStep("overview")}
              style={{ marginRight: "15px" }}
            >
              <FlashRegular style={{ marginRight: "8px" }} />
              New Request
            </Button>
            <Button size="large" onClick={() => (window.location.href = "/")}>
              Back to Main App
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)",
        padding: "20px",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .roster-main-container {
            padding: 15px !important;
          }
          .roster-demo-grid {
            grid-template-columns: 1fr !important;
          }
          .roster-feature-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .roster-main-container {
            padding: 10px !important;
          }
          .roster-header {
            margin-bottom: 30px !important;
          }
          .roster-header h1 {
            font-size: 28px !important;
          }
          .roster-header p {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div
        className="roster-header"
        style={{ textAlign: "center", marginBottom: "40px", color: "white" }}
      >
        <VehicleSubwayRegular
          style={{
            fontSize: "60px",
            marginBottom: "20px",
            backgroundColor: "rgba(255,255,255,0.1)",
            padding: "20px",
            borderRadius: "50%",
          }}
        />
        <Text
          style={{
            fontSize: "36px",
            fontWeight: 300,
            display: "block",
            marginBottom: "15px",
          }}
        >
          Intelligent Roster Management
        </Text>
        <Text
          style={{
            fontSize: "18px",
            opacity: 0.9,
            display: "block",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          AI-powered roster optimization with real-time compliance monitoring
          and automated staff notifications
        </Text>
      </div>

      {/* Scenario Selection */}
      <div
        style={{
          marginBottom: "40px",
          maxWidth: "1200px",
          margin: "0 auto 40px auto",
        }}
      >
        <Card
          style={{
            padding: "25px",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "12px",
          }}
        >
          <Text
            style={{
              fontSize: "20px",
              fontWeight: 600,
              display: "block",
              marginBottom: "15px",
              color: "#323130",
            }}
          >
            🎯 Choose Demo Scenario
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#666",
              display: "block",
              marginBottom: "20px",
            }}
          >
            Click any scenario below to automatically start the demo, or use the
            custom request section for your own prompt:
          </Text>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            {scenarios.map((scenario) => (
              <Card
                key={scenario.id}
                style={{
                  padding: "20px",
                  cursor: "pointer",
                  border:
                    selectedScenario === scenario.id
                      ? "2px solid #0078D4"
                      : "2px solid #e1dfdd",
                  backgroundColor:
                    selectedScenario === scenario.id ? "#f0f6ff" : "white",
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onClick={() => handleScenarioSelect(scenario.id)}
                onMouseEnter={(e) => {
                  if (selectedScenario !== scenario.id) {
                    e.currentTarget.style.borderColor = "#0078D4";
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedScenario !== scenario.id) {
                    e.currentTarget.style.borderColor = "#e1dfdd";
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "8px",
                        color: "#323130",
                      }}
                    >
                      {scenario.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: "1.4",
                      }}
                    >
                      {scenario.description}
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      backgroundColor:
                        selectedScenario === scenario.id
                          ? "#0078D4"
                          : "#f3f2f1",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 500,
                      color:
                        selectedScenario === scenario.id ? "white" : "#666",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <FlashRegular style={{ fontSize: "14px" }} />
                    {selectedScenario === scenario.id
                      ? "Selected"
                      : "Click to Start"}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      <div
        className="roster-main-container"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <div
          className="roster-feature-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <Card
            style={{
              padding: "20px",
              backgroundColor: "rgba(255,255,255,0.95)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#fde300",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "15px",
                }}
              >
                <CheckmarkCircleRegular
                  style={{ fontSize: "20px", color: "white" }}
                />
              </div>
              <div>
                <Text
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#323130",
                    display: "block",
                  }}
                >
                  Real-time Processing
                </Text>
                <Text style={{ fontSize: "14px", color: "#666" }}>
                  Live Excel file analysis
                </Text>
              </div>
            </div>
            <Text
              style={{ fontSize: "13px", color: "#666", lineHeight: "1.4" }}
            >
              Connects to your OneDrive, finds roster files, and processes them
              in real-time with full compliance monitoring.
            </Text>
          </Card>

          <Card
            style={{
              padding: "20px",
              backgroundColor: "rgba(255,255,255,0.95)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#d13438",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "15px",
                }}
              >
                <ShieldCheckmarkRegular
                  style={{ fontSize: "20px", color: "white" }}
                />
              </div>
              <div>
                <Text
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#323130",
                    display: "block",
                  }}
                >
                  Compliance First
                </Text>
                <Text style={{ fontSize: "14px", color: "#666" }}>
                  Working Time Directive
                </Text>
              </div>
            </div>
            <Text
              style={{ fontSize: "13px", color: "#666", lineHeight: "1.4" }}
            >
              Automatically checks fatigue regulations, rest periods, and weekly
              hour limits to ensure full compliance.
            </Text>
          </Card>

          <Card
            style={{
              padding: "20px",
              backgroundColor: "rgba(255,255,255,0.95)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#6264A7",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "15px",
                }}
              >
                <FlashRegular style={{ fontSize: "20px", color: "white" }} />
              </div>
              <div>
                <Text
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#323130",
                    display: "block",
                  }}
                >
                  Instant Actions
                </Text>
                <Text style={{ fontSize: "14px", color: "#666" }}>
                  Teams + Excel + Word
                </Text>
              </div>
            </div>
            <Text
              style={{ fontSize: "13px", color: "#666", lineHeight: "1.4" }}
            >
              Generates updated rosters, compliance reports, and sends Teams
              notifications automatically.
            </Text>
          </Card>
        </div>

        <Card
          style={{
            padding: "30px",
            marginBottom: "30px",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <Text
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#0078D4",
                marginBottom: "10px",
                display: "block",
              }}
            >
              Custom Roster Request
            </Text>
            <Text
              style={{ fontSize: "16px", color: "#666", lineHeight: "1.5" }}
            >
              Describe your specific roster management challenge and watch
              SAMARA provide instant solutions
            </Text>
          </div>

          <div className="roster-custom-section">
            <div className="roster-custom-input">
              <div style={{ marginBottom: "20px" }}>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#323130",
                    marginBottom: "12px",
                    display: "block",
                  }}
                >
                  📝 Your Request
                </Text>
                <Textarea
                  placeholder="e.g., 'Driver shortage for weekend shifts at City Center depot' or 'Compliance check for overtime patterns in November'"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  style={{
                    minHeight: "80px",
                    maxHeight: "200px",
                    resize: "vertical",
                    border: "1px solid #d1d1d1",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    fontFamily: "inherit",
                    backgroundColor: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0078D4";
                    e.target.style.boxShadow = "0 0 0 2px rgba(0,120,212,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d1d1";
                    e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <Text
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666",
                    marginBottom: "12px",
                    display: "block",
                  }}
                >
                  � Quick Demos
                </Text>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "15px",
                  }}
                >
                  {scenarios.map((scenario) => (
                    <Button
                      key={scenario.id}
                      size="small"
                      appearance="primary"
                      onClick={() => handleScenarioSelect(scenario.id)}
                      style={{
                        backgroundColor: "#0078D4",
                        border: "none",
                        borderRadius: "20px",
                        padding: "8px 16px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "white",
                        transition: "all 0.2s ease",
                        minHeight: "32px",
                      }}
                    >
                      <FlashRegular
                        style={{ marginRight: "4px", fontSize: "12px" }}
                      />
                      {scenario.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <Text
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#666",
                    marginBottom: "12px",
                    display: "block",
                  }}
                >
                  �💡 Quick Examples
                </Text>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    appearance="subtle"
                    onClick={() =>
                      setCustomPrompt(
                        "Driver shortage for weekend shifts at City Center depot"
                      )
                    }
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e1dfdd",
                      borderRadius: "20px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#323130",
                      transition: "all 0.2s ease",
                      minHeight: "32px",
                    }}
                  >
                    Driver shortage
                  </Button>
                  <Button
                    size="small"
                    appearance="subtle"
                    onClick={() =>
                      setCustomPrompt(
                        "Compliance check for overtime patterns this month"
                      )
                    }
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e1dfdd",
                      borderRadius: "20px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#323130",
                      transition: "all 0.2s ease",
                      minHeight: "32px",
                    }}
                  >
                    Compliance check
                  </Button>
                  <Button
                    size="small"
                    appearance="subtle"
                    onClick={() =>
                      setCustomPrompt(
                        "Holiday coverage planning for Christmas week"
                      )
                    }
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e1dfdd",
                      borderRadius: "20px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#323130",
                      transition: "all 0.2s ease",
                      minHeight: "32px",
                    }}
                  >
                    Holiday planning
                  </Button>
                </div>
              </div>
            </div>

            <div className="roster-custom-button-section">
              <Button
                appearance="primary"
                size="large"
                disabled={!customPrompt.trim()}
                onClick={() => handleStartDemo(customPrompt)}
                style={{
                  width: "100%",
                  height: "56px",
                  fontSize: "16px",
                  fontWeight: 600,
                  borderRadius: "12px",
                  background: customPrompt.trim()
                    ? "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)"
                    : undefined,
                  border: "none",
                  boxShadow: customPrompt.trim()
                    ? "0 4px 16px rgba(0,120,212,0.3)"
                    : undefined,
                  transition: "all 0.3s ease",
                  cursor: customPrompt.trim() ? "pointer" : "not-allowed",
                }}
              >
                <FlashRegular
                  style={{ marginRight: "8px", fontSize: "18px" }}
                />
                Process Request
              </Button>

              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  border: "1px solid #e1dfdd",
                  textAlign: "center",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  📁 Data Source
                </Text>
                <Text
                  style={{
                    fontSize: "13px",
                    color: "#0078D4",
                    fontWeight: 600,
                  }}
                >
                  sample_driver_roster.xlsx
                </Text>
              </div>

              <div style={{ textAlign: "center", width: "100%" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    fontStyle: "italic",
                    lineHeight: "1.4",
                  }}
                >
                  Demo uses realistic transportation data for consistent results
                </Text>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
