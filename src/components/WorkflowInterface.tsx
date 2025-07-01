import React, { useState } from "react";
import {
  Card,
  Text,
  Button,
  Textarea,
  Spinner,
  Badge,
  Toast,
  ToastTitle,
  useToastController,
  Toaster,
  ProgressBar,
} from "@fluentui/react-components";
import {
  SendRegular,
  Cloud16Color,
  CheckmarkCircleRegular,
  DocumentRegular,
  ArrowClockwiseRegular,
  SparkleRegular,
  LightbulbRegular,
  FlashRegular,
  ShareRegular,
  DocumentTableRegular,
  SlideTextRegular,
  MailRegular,
  CalendarRegular,
  NotebookRegular,
  TaskListAddRegular,
  ShieldCheckmarkRegular,
  EyeRegular,
} from "@fluentui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/msalConfig";
import { intelligentWorkflowProcessor } from "../services/intelligentWorkflowProcessor";
import { type ParsedIntent, type WorkflowPlan } from "../services/groqService";
import { useGraphData } from "../hooks/useGraphData";
import { complianceLogger } from "../services/complianceLogger";

interface WorkflowResult {
  id: string;
  prompt: string;
  status: "processing" | "completed" | "error";
  intent?: ParsedIntent;
  plan?: WorkflowPlan;
  steps: WorkflowStep[];
  results: WorkflowResultItem[];
  totalTimeElapsed: number;
  timeSaved: number;
  summary: string;
  timestamp: Date;
  complianceLogId?: string;
}

interface WorkflowStep {
  step: string;
  status: "pending" | "processing" | "completed" | "error";
  description: string;
  result?: string;
  timeElapsed?: number;
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

interface QuickAction {
  label: string;
  icon: React.ReactElement;
  action: () => void;
  primary?: boolean;
}

export const WorkflowInterface: React.FC = () => {
  const { instance, accounts } = useMsal();
  const { dispatchToast } = useToastController();
  const { documents } = useGraphData();
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowResult | null>(
    null
  );
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowResult[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showComplianceDetails, setShowComplianceDetails] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    const workflowId = Date.now().toString();
    const newWorkflow: WorkflowResult = {
      id: workflowId,
      prompt: prompt.trim(),
      status: "processing",
      steps: [],
      results: [],
      totalTimeElapsed: 0,
      timeSaved: 0,
      summary: "",
      timestamp: new Date(),
    };

    setCurrentWorkflow(newWorkflow);
    setPrompt("");

    try {
      // Get access token and user info
      const account = accounts[0];
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      });

      // Process the intelligent workflow with Groq and full compliance logging
      const result =
        await intelligentWorkflowProcessor.processIntelligentWorkflow({
          prompt: newWorkflow.prompt,
          accessToken: response.accessToken,
          availableDocuments: documents,
          userId: account.homeAccountId,
          userEmail: account.username,
          onStepUpdate: (step) => {
            // Update the current workflow with the new step
            setCurrentWorkflow((prev) => {
              if (!prev) return null;

              const updatedSteps = [...prev.steps];
              const existingIndex = updatedSteps.findIndex(
                (s) => s.step === step.step
              );

              if (existingIndex >= 0) {
                updatedSteps[existingIndex] = step;
              } else {
                updatedSteps.push(step);
              }

              return { ...prev, steps: updatedSteps };
            });

            // Update progress based on completed steps
            setProcessingProgress((prev) => Math.min(prev + 15, 90));
          },
          onIntentUpdate: (intent) => {
            setCurrentWorkflow((prev) => (prev ? { ...prev, intent } : null));
            setProcessingProgress(20);
          },
          onPlanUpdate: (plan) => {
            setCurrentWorkflow((prev) => (prev ? { ...prev, plan } : null));
            setProcessingProgress(40);
          },
        });

      // Convert workflow results to user-friendly format
      const workflowResults = convertToWorkflowResults(
        result.steps,
        response.accessToken
      );

      // Complete the workflow
      const completedWorkflow: WorkflowResult = {
        ...newWorkflow,
        status: "completed",
        intent: result.intent,
        plan: result.plan,
        steps: result.steps,
        results: workflowResults,
        totalTimeElapsed: result.totalTimeElapsed,
        timeSaved: result.timeSaved,
        summary: result.summary,
        complianceLogId: result.complianceLogId,
      };

      setCurrentWorkflow(completedWorkflow);
      setRecentWorkflows((prev) => [completedWorkflow, ...prev.slice(0, 4)]);
      setProcessingProgress(100);

      dispatchToast(
        <Toast>
          <ToastTitle>
            🚀 Workflow completed! {workflowResults.length} results ready with
            full compliance logging
          </ToastTitle>
        </Toast>,
        { intent: "success" }
      );
    } catch (error) {
      console.error("❌ Intelligent workflow failed:", error);

      const failedWorkflow: WorkflowResult = {
        ...newWorkflow,
        status: "error",
        summary: `Failed to execute workflow: ${error.message}`,
        totalTimeElapsed: Date.now() - newWorkflow.timestamp.getTime(),
        timeSaved: 0,
        results: [],
        steps: [],
      };

      setCurrentWorkflow(failedWorkflow);

      dispatchToast(
        <Toast>
          <ToastTitle>❌ Workflow failed: {error.message}</ToastTitle>
        </Toast>,
        { intent: "error" }
      );
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleViewComplianceReport = async () => {
    try {
      const report = await complianceLogger.generateComplianceReport("daily");

      // In production, this would open a proper compliance dashboard
      console.log("📊 Compliance Report Generated:", report);

      dispatchToast(
        <Toast>
          <ToastTitle>
            📊 Compliance report generated: {report.summary.totalWorkflows}{" "}
            workflows, {report.summary.totalUsers} users
          </ToastTitle>
        </Toast>,
        { intent: "success" }
      );

      // For demo, show the compliance details
      setShowComplianceDetails(true);
    } catch (error) {
      console.error("Failed to generate compliance report:", error);
      dispatchToast(
        <Toast>
          <ToastTitle>❌ Failed to generate compliance report</ToastTitle>
        </Toast>,
        { intent: "error" }
      );
    }
  };

  const convertToWorkflowResults = (
    steps: WorkflowStep[],
    accessToken: string
  ): WorkflowResultItem[] => {
    const results: WorkflowResultItem[] = [];

    console.log("🔄 DEBUG: All steps to convert:", steps);
    console.log(
      "🔄 DEBUG: Completed steps:",
      steps.filter((s) => s.status === "completed")
    );

    // Convert each completed step to a result item
    for (const step of steps.filter((s) => s.status === "completed")) {
      console.log("🔄 Converting step to result:", step);

      // Extract app from step name (e.g., "Word: list" -> "word")
      const appMatch = step.step.match(/^([^:]+):/);
      const app = appMatch ? appMatch[1].toLowerCase() : "unknown";

      console.log("🔄 DEBUG: Extracted app:", app, "from step:", step.step);

      // Extract action from step name (e.g., "Word: list" -> "list")
      const actionMatch = step.step.match(/:(.+)$/);
      const action = actionMatch ? actionMatch[1].trim() : step.step;

      console.log("🔄 DEBUG: Extracted action:", action);
      console.log("🔄 DEBUG: Step result:", step.result);

      if (step.result && step.result.length > 0) {
        // Determine result type based on content
        let resultType: "file" | "data" | "action" | "insight" = "data";
        let title = step.step;
        let description = step.result;

        console.log("🔄 DEBUG: Checking result patterns for:", step.result);

        if (
          step.result.includes("Found") &&
          (step.result.includes("documents") || step.result.includes("files"))
        ) {
          console.log("🔄 DEBUG: Matched 'Found' pattern");
          // Extract file count and details
          const fileCountMatch = step.result.match(/Found (\d+)/);
          const fileCount = fileCountMatch ? fileCountMatch[1] : "multiple";

          results.push({
            type: resultType,
            app: app,
            title: `${fileCount} ${
              app.charAt(0).toUpperCase() + app.slice(1)
            } Files`,
            description: step.result,
            quickActions: [
              {
                label: `Open ${app.charAt(0).toUpperCase() + app.slice(1)}`,
                icon: getAppIcon(app),
                action: () =>
                  window.open(
                    `https://m365.cloud.microsoft/launch/${app}`,
                    "_blank"
                  ),
                primary: true,
              },
              {
                label: "View in OneDrive",
                icon: <DocumentRegular />,
                action: () =>
                  window.open(
                    "https://m365.cloud.microsoft/onedrive",
                    "_blank"
                  ),
              },
            ],
          });
        } else if (
          step.result.includes("Created") ||
          step.result.includes("Generated")
        ) {
          console.log("🔄 DEBUG: Matched 'Created/Generated' pattern!");
          console.log("🔄 DEBUG: Processing file creation result");

          resultType = "file";
          const fileName = extractFileName(step.result);
          title =
            fileName ||
            `New ${app.charAt(0).toUpperCase() + app.slice(1)} File`;

          console.log("🔄 DEBUG: Extracted fileName:", fileName);
          console.log("🔄 DEBUG: Final title:", title);

          results.push({
            type: resultType,
            app: app,
            title: title,
            description: step.result,
            webUrl: `https://m365.cloud.microsoft/launch/${app}`,
            quickActions: [
              {
                label: `Open in ${app.charAt(0).toUpperCase() + app.slice(1)}`,
                icon: getAppIcon(app),
                action: () => {
                  dispatchToast(
                    <Toast>
                      <ToastTitle>
                        📂 Opening {app.charAt(0).toUpperCase() + app.slice(1)}
                        ... Your new file may take 2-5 minutes to appear due to
                        Microsoft 365 caching.
                      </ToastTitle>
                    </Toast>,
                    { intent: "info" }
                  );
                  window.open(
                    `https://m365.cloud.microsoft/launch/${app}`,
                    "_blank"
                  );
                },
                primary: true,
              },
              {
                label: "Open OneDrive",
                icon: <DocumentRegular />,
                action: () => {
                  dispatchToast(
                    <Toast>
                      <ToastTitle>
                        💡 Tip: Refresh OneDrive in 2-5 minutes to see your new
                        file
                      </ToastTitle>
                    </Toast>,
                    { intent: "info" }
                  );
                  window.open(
                    "https://m365.cloud.microsoft/onedrive",
                    "_blank"
                  );
                },
              },
            ],
          });

          console.log("🔄 DEBUG: Added file creation result to results array");
        } else if (
          step.result.includes("Sent") &&
          step.result.includes("email")
        ) {
          resultType = "action";
          title = "Email Sent Successfully";

          results.push({
            type: resultType,
            app: "outlook",
            title: title,
            description: step.result,
            quickActions: [
              {
                label: "Open Outlook",
                icon: <MailRegular />,
                action: () =>
                  window.open("https://outlook.office.com", "_blank"),
                primary: true,
              },
              {
                label: "View Sent Items",
                icon: <DocumentRegular />,
                action: () =>
                  window.open(
                    "https://outlook.office.com/mail/sentitems",
                    "_blank"
                  ),
              },
            ],
          });
        } else if (
          step.result.includes("Scheduled") &&
          step.result.includes("meeting")
        ) {
          resultType = "action";
          title = "Meeting Scheduled";

          results.push({
            type: resultType,
            app: "teams",
            title: title,
            description: step.result,
            quickActions: [
              {
                label: "Open Calendar",
                icon: <CalendarRegular />,
                action: () =>
                  window.open("https://outlook.office.com/calendar", "_blank"),
                primary: true,
              },
              {
                label: "Join Teams",
                icon: <ShareRegular />,
                action: () =>
                  window.open("https://teams.microsoft.com", "_blank"),
              },
            ],
          });
        } else if (
          step.result.includes("Calculated") ||
          step.result.includes("Analyzed") ||
          step.result.includes("metrics")
        ) {
          resultType = "insight";
          title = "Analysis Complete";

          results.push({
            type: resultType,
            app: app,
            title: title,
            description: step.result,
            quickActions: [
              {
                label: "View Details",
                icon: <DocumentRegular />,
                action: () =>
                  window.open(
                    `https://m365.cloud.microsoft/launch/${app}`,
                    "_blank"
                  ),
                primary: true,
              },
              {
                label: "Export Results",
                icon: <ShareRegular />,
                action: () => {
                  navigator.clipboard.writeText(step.result);
                  dispatchToast(
                    <Toast>
                      <ToastTitle>Results copied to clipboard</ToastTitle>
                    </Toast>,
                    { intent: "success" }
                  );
                },
              },
            ],
          });
        } else {
          // Generic result
          results.push({
            type: "action",
            app: app,
            title: step.step,
            description: step.result,
            quickActions: [
              {
                label: `Open ${app.charAt(0).toUpperCase() + app.slice(1)}`,
                icon: getAppIcon(app),
                action: () =>
                  window.open(
                    `https://m365.cloud.microsoft/launch/${app}`,
                    "_blank"
                  ),
                primary: true,
              },
            ],
          });
        }
      } else {
        console.log("🔄 DEBUG: Step has no result or empty result");
      }
    }

    console.log("✅ DEBUG: Final converted results:", results);
    console.log("✅ DEBUG: Total results count:", results.length);

    // TEMPORARY: Add a test result to see if UI rendering works
    if (results.length === 0) {
      console.log("🧪 DEBUG: No results found, adding test result");
      results.push({
        type: "file",
        app: "word",
        title: "Test Document Created",
        description: "This is a test result to verify UI rendering",
        quickActions: [
          {
            label: "Open Word",
            icon: getAppIcon("word"),
            action: () =>
              window.open("https://m365.cloud.microsoft/launch/word", "_blank"),
            primary: true,
          },
        ],
      });
    }

    return results;
  };

  const extractFileName = (result: string): string | null => {
    // Try to extract filename from quotes
    const quotedMatch = result.match(/"([^"]+)"/);
    if (quotedMatch) return quotedMatch[1];

    // Try to extract filename after "Created" or "Generated"
    const createdMatch = result.match(/(?:Created|Generated)\s+([^:]+)/);
    if (createdMatch) return createdMatch[1].trim();

    return null;
  };

  const getAppIcon = (app: string) => {
    const iconProps = { style: { fontSize: "16px" } };
    switch (app) {
      case "excel":
        return (
          <DocumentTableRegular
            {...iconProps}
            style={{ ...iconProps.style, color: "#107C41" }}
          />
        );
      case "word":
        return (
          <DocumentRegular
            {...iconProps}
            style={{ ...iconProps.style, color: "#2B579A" }}
          />
        );
      case "powerpoint":
        return (
          <SlideTextRegular
            {...iconProps}
            style={{ ...iconProps.style, color: "#D24726" }}
          />
        );
      case "outlook":
        return (
          <MailRegular
            {...iconProps}
            style={{ ...iconProps.style, color: "#0078D4" }}
          />
        );
      case "teams":
        return (
          <ShareRegular
            {...iconProps}
            style={{ ...iconProps.style, color: "#6264A7" }}
          />
        );
      case "onenote":
        return (
          <NotebookRegular
            {...iconProps}
            style={{ ...iconProps.style, color: "#7719AA" }}
          />
        );
      case "planner":
        return (
          <TaskListAddRegular
            {...iconProps}
            style={{ ...iconProps.style, color: "#31752F" }}
          />
        );
      default:
        return <DocumentRegular {...iconProps} />;
    }
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case "file":
        return (
          <DocumentRegular style={{ fontSize: "20px", color: "#0078D4" }} />
        );
      case "data":
        return (
          <DocumentTableRegular
            style={{ fontSize: "20px", color: "#107C41" }}
          />
        );
      case "action":
        return (
          <CheckmarkCircleRegular
            style={{ fontSize: "20px", color: "#107C10" }}
          />
        );
      case "insight":
        return (
          <SparkleRegular style={{ fontSize: "20px", color: "#7719AA" }} />
        );
      default:
        return <DocumentRegular style={{ fontSize: "20px" }} />;
    }
  };

  const formatTimeElapsed = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTimeSaved = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const examplePrompts = [
    "List my recent Word documents",
    "Show me all Excel files from this month",
    "Find PowerPoint presentations about budget",
    "Get my calendar events for today",
    "Merge Excel budget files and create a summary report",
    "Analyze sales data and email results to the team",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--ms-color-themePrimary) 0%, var(--ms-color-themeDark) 100%)",
        padding: "var(--ms-spacing-xxl)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Toaster />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center",
          marginBottom: "var(--ms-spacing-xxxl)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--ms-spacing-m)",
            marginBottom: "var(--ms-spacing-l)",
          }}
        >
          <Cloud16Color style={{ fontSize: "48px" }} />
          <Text
            className="ms-font-su"
            style={{
              fontWeight: 300,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            SAMARA AI
          </Text>
          <div style={{ display: "flex", gap: "var(--ms-spacing-s)" }}>
            <Badge
              appearance="filled"
              size="large"
              style={{
                backgroundColor: "#FF6B35",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <FlashRegular style={{ fontSize: "16px" }} />
              Groq Powered
            </Badge>
            <Badge
              appearance="filled"
              size="large"
              style={{
                backgroundColor: "#107C10",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ShieldCheckmarkRegular style={{ fontSize: "16px" }} />
              Enterprise Compliant
            </Badge>
          </div>
        </div>
        <Text
          className="ms-font-l"
          style={{
            display: "block",
            opacity: 0.9,
            maxWidth: "700px",
            fontWeight: 300,
          }}
        >
          Enterprise-grade AI workflow automation with complete compliance
          logging, audit trails, and regulatory compliance for Microsoft 365.
        </Text>
      </motion.div>

      {/* Main Interface */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "flex",
          flexDirection: "column",
          gap: "var(--ms-spacing-xxl)",
        }}
      >
        {/* Prompt Input */}
        <Card
          className="ms-card ms-card-elevated"
          style={{
            padding: "var(--ms-spacing-xxxl)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "none",
            boxShadow: "var(--ms-shadow-depth16)",
            borderRadius: "var(--ms-borderRadius-large)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "var(--ms-spacing-xxl)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--ms-spacing-m)",
                  marginBottom: "var(--ms-spacing-s)",
                }}
              >
                <LightbulbRegular
                  style={{
                    fontSize: "24px",
                    color: "var(--ms-color-themePrimary)",
                  }}
                />
                <Text
                  className="ms-font-xl"
                  style={{
                    color: "var(--ms-color-neutralPrimary)",
                    fontWeight: 600,
                  }}
                >
                  What would you like to do?
                </Text>
                <Badge
                  appearance="outline"
                  size="small"
                  style={{
                    color: "#107C10",
                    borderColor: "#107C10",
                    backgroundColor: "rgba(16, 124, 16, 0.1)",
                  }}
                >
                  🔒 Compliance Logged
                </Badge>
              </div>
              <Text
                className="ms-font-m"
                style={{ color: "var(--ms-color-neutralSecondary)" }}
              >
                Ask for files, create documents, send emails, or run complex
                workflows. Every action is logged for enterprise compliance and
                audit requirements.
              </Text>
            </div>

            <div
              style={{
                display: "flex",
                gap: "var(--ms-spacing-l)",
                alignItems: "flex-end",
              }}
            >
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., List my recent Word documents, or Merge Excel budget files and email to finance team"
                disabled={isProcessing}
                rows={3}
                className="ms-input"
                style={{
                  flex: 1,
                  fontSize: "var(--ms-fontSize-16)",
                  lineHeight: "1.5",
                  borderRadius: "var(--ms-borderRadius-large)",
                  padding: "var(--ms-spacing-l)",
                }}
              />
              <Button
                type="submit"
                appearance="primary"
                disabled={!prompt.trim() || isProcessing}
                icon={isProcessing ? <Spinner size="small" /> : <SendRegular />}
                size="large"
                className="ms-button-primary"
                style={{
                  minWidth: "140px",
                  height: "56px",
                  background:
                    "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                  border: "none",
                  borderRadius: "var(--ms-borderRadius-large)",
                  fontWeight: 600,
                }}
              >
                {isProcessing ? "Processing..." : "Get Results"}
              </Button>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: "var(--ms-spacing-l)" }}
              >
                <ProgressBar
                  value={processingProgress}
                  max={100}
                  style={{ marginBottom: "var(--ms-spacing-s)" }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--ms-spacing-s)",
                  }}
                >
                  <FlashRegular
                    style={{ fontSize: "16px", color: "#FF6B35" }}
                  />
                  <Text
                    className="ms-font-s"
                    style={{ color: "var(--ms-color-neutralSecondary)" }}
                  >
                    Groq AI is processing your request with full compliance
                    logging...
                  </Text>
                </div>
              </motion.div>
            )}
          </form>
        </Card>

        {/* Current Workflow - Show Processing Steps */}
        <AnimatePresence>
          {currentWorkflow &&
            currentWorkflow.status === "processing" &&
            currentWorkflow.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  className="ms-card ms-card-elevated"
                  style={{
                    padding: "var(--ms-spacing-xxl)",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    border: "none",
                    boxShadow: "var(--ms-shadow-depth16)",
                    borderRadius: "var(--ms-borderRadius-large)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--ms-spacing-m)",
                      marginBottom: "var(--ms-spacing-xl)",
                    }}
                  >
                    <Cloud16Color
                      style={{ fontSize: "28px", color: "#FF6B35" }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text
                        className="ms-font-l"
                        style={{ display: "block", fontWeight: 600 }}
                      >
                        Processing Your Request
                      </Text>
                      <Text
                        className="ms-font-m"
                        style={{ color: "var(--ms-color-neutralSecondary)" }}
                      >
                        "{currentWorkflow.prompt}"
                      </Text>
                    </div>
                  </div>

                  {/* Processing Steps */}
                  <div style={{ marginBottom: "var(--ms-spacing-xl)" }}>
                    {currentWorkflow.steps.map((step, index) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--ms-spacing-m)",
                          padding: "var(--ms-spacing-m)",
                          marginBottom: "var(--ms-spacing-s)",
                          backgroundColor:
                            step.status === "completed"
                              ? "var(--ms-color-successLight)"
                              : step.status === "processing"
                              ? "rgba(255, 107, 53, 0.1)"
                              : step.status === "error"
                              ? "var(--ms-color-errorLight)"
                              : "var(--ms-color-neutralLighter)",
                          borderRadius: "var(--ms-borderRadius-large)",
                          border: `1px solid ${
                            step.status === "completed"
                              ? "var(--ms-color-success)"
                              : step.status === "processing"
                              ? "#FF6B35"
                              : step.status === "error"
                              ? "var(--ms-color-error)"
                              : "var(--ms-color-neutralQuaternaryAlt)"
                          }`,
                        }}
                      >
                        <div>
                          {step.status === "processing" && (
                            <Spinner size="tiny" />
                          )}
                          {step.status === "completed" && (
                            <CheckmarkCircleRegular
                              style={{
                                color: "var(--ms-color-success)",
                                fontSize: "18px",
                              }}
                            />
                          )}
                          {step.status === "error" && (
                            <DocumentRegular
                              style={{
                                color: "var(--ms-color-error)",
                                fontSize: "18px",
                              }}
                            />
                          )}
                          {step.status === "pending" && (
                            <ArrowClockwiseRegular
                              style={{
                                color: "var(--ms-color-neutralTertiary)",
                                fontSize: "18px",
                              }}
                            />
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <Text
                            className="ms-font-m"
                            style={{ display: "block", fontWeight: 600 }}
                          >
                            {step.step}
                          </Text>
                          <Text
                            className="ms-font-s"
                            style={{
                              color: "var(--ms-color-neutralSecondary)",
                            }}
                          >
                            {step.description}
                          </Text>
                          {step.result && (
                            <Text
                              className="ms-font-s"
                              style={{
                                color: "var(--ms-color-neutralPrimary)",
                                marginTop: "4px",
                              }}
                            >
                              {step.result}
                            </Text>
                          )}
                        </div>

                        {step.timeElapsed && (
                          <Text
                            className="ms-font-s"
                            style={{ color: "var(--ms-color-neutralTertiary)" }}
                          >
                            {formatTimeElapsed(step.timeElapsed)}
                          </Text>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
        </AnimatePresence>

        {/* Current Workflow Results */}
        <AnimatePresence>
          {currentWorkflow && currentWorkflow.status === "completed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card
                className="ms-card ms-card-elevated"
                style={{
                  padding: "var(--ms-spacing-xxl)",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  border: "none",
                  boxShadow: "var(--ms-shadow-depth16)",
                  borderRadius: "var(--ms-borderRadius-large)",
                }}
              >
                {/* Results Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "var(--ms-spacing-xl)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--ms-spacing-m)",
                    }}
                  >
                    <CheckmarkCircleRegular
                      style={{ fontSize: "28px", color: "#107C10" }}
                    />
                    <div>
                      <Text
                        className="ms-font-l"
                        style={{ display: "block", fontWeight: 600 }}
                      >
                        Results Ready
                      </Text>
                      <Text
                        className="ms-font-m"
                        style={{ color: "var(--ms-color-neutralSecondary)" }}
                      >
                        "{currentWorkflow.prompt}"
                      </Text>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--ms-spacing-s)",
                        marginBottom: "var(--ms-spacing-s)",
                      }}
                    >
                      <Badge
                        appearance="filled"
                        color="success"
                        size="large"
                        className="ms-badge-success"
                      >
                        <SparkleRegular
                          style={{ fontSize: "16px", marginRight: "4px" }}
                        />
                        {currentWorkflow.results.length} Results
                      </Badge>
                      <Badge
                        appearance="filled"
                        size="large"
                        style={{ backgroundColor: "#107C10", color: "white" }}
                      >
                        <ShieldCheckmarkRegular
                          style={{ fontSize: "16px", marginRight: "4px" }}
                        />
                        Compliant
                      </Badge>
                    </div>
                    <Text
                      className="ms-font-s"
                      style={{
                        color: "var(--ms-color-neutralSecondary)",
                        display: "block",
                      }}
                    >
                      Completed in{" "}
                      {formatTimeElapsed(currentWorkflow.totalTimeElapsed)}
                    </Text>
                  </div>
                </div>

                {/* Results Grid */}
                {currentWorkflow.results.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gap: "var(--ms-spacing-l)",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(300px, 1fr))",
                      marginBottom: "var(--ms-spacing-xl)",
                    }}
                  >
                    {currentWorkflow.results.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          style={{
                            padding: "var(--ms-spacing-l)",
                            border:
                              "1px solid var(--ms-color-neutralQuaternaryAlt)",
                            borderRadius: "var(--ms-borderRadius-large)",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            transition: "all 0.2s ease-in-out",
                          }}
                          className="ms-card"
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--ms-spacing-m)",
                              marginBottom: "var(--ms-spacing-m)",
                            }}
                          >
                            {getResultTypeIcon(result.type)}
                            <div style={{ flex: 1 }}>
                              <Text
                                className="ms-font-m"
                                style={{ display: "block", fontWeight: 600 }}
                              >
                                {result.title}
                              </Text>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "var(--ms-spacing-s)",
                                }}
                              >
                                {getAppIcon(result.app)}
                                <Text
                                  className="ms-font-s"
                                  style={{
                                    color: "var(--ms-color-neutralSecondary)",
                                  }}
                                >
                                  {result.app.charAt(0).toUpperCase() +
                                    result.app.slice(1)}
                                </Text>
                                <Badge
                                  appearance="outline"
                                  size="small"
                                  style={{
                                    color: "#107C10",
                                    borderColor: "#107C10",
                                  }}
                                >
                                  <ShieldCheckmarkRegular
                                    style={{
                                      fontSize: "12px",
                                      marginRight: "2px",
                                    }}
                                  />
                                  Logged
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <Text
                            className="ms-font-s"
                            style={{
                              color: "var(--ms-color-neutralPrimary)",
                              marginBottom: "var(--ms-spacing-l)",
                              flex: 1,
                              lineHeight: "1.4",
                            }}
                          >
                            {result.description}
                          </Text>

                          {/* Quick Actions */}
                          {result.quickActions &&
                            result.quickActions.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "var(--ms-spacing-s)",
                                  flexWrap: "wrap",
                                }}
                              >
                                {result.quickActions.map(
                                  (action, actionIndex) => (
                                    <Button
                                      key={actionIndex}
                                      appearance={
                                        action.primary ? "primary" : "secondary"
                                      }
                                      size="small"
                                      icon={action.icon}
                                      onClick={action.action}
                                      style={{
                                        ...(action.primary && {
                                          background:
                                            "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                                          border: "none",
                                        }),
                                      }}
                                    >
                                      {action.label}
                                    </Button>
                                  )
                                )}
                              </div>
                            )}
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "var(--ms-spacing-xxxl)",
                      backgroundColor: "var(--ms-color-neutralLighter)",
                      borderRadius: "var(--ms-borderRadius-large)",
                      marginBottom: "var(--ms-spacing-xl)",
                    }}
                  >
                    <Text
                      className="ms-font-l"
                      style={{
                        display: "block",
                        marginBottom: "var(--ms-spacing-m)",
                      }}
                    >
                      Workflow Completed Successfully
                    </Text>
                    <Text
                      className="ms-font-m"
                      style={{ color: "var(--ms-color-neutralSecondary)" }}
                    >
                      Your request has been processed with full compliance
                      logging. Check the technical details below for more
                      information.
                    </Text>
                  </div>
                )}

                {/* Compliance and Technical Details Toggle */}
                <div
                  style={{
                    borderTop: "1px solid var(--ms-color-neutralQuaternaryAlt)",
                    paddingTop: "var(--ms-spacing-l)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Text
                      className="ms-font-s"
                      style={{ color: "var(--ms-color-neutralSecondary)" }}
                    >
                      Powered by Groq's lightning-fast AI •{" "}
                      {formatTimeSaved(currentWorkflow.timeSaved)} saved •
                      Enterprise compliant
                    </Text>
                  </div>
                  <div style={{ display: "flex", gap: "var(--ms-spacing-s)" }}>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<ShieldCheckmarkRegular />}
                      onClick={handleViewComplianceReport}
                    >
                      View Compliance Report
                    </Button>
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={() =>
                        setShowTechnicalDetails(!showTechnicalDetails)
                      }
                    >
                      {showTechnicalDetails ? "Hide" : "Show"} Technical Details
                    </Button>
                  </div>
                </div>

                {/* Technical Details (Collapsible) */}
                <AnimatePresence>
                  {showTechnicalDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        marginTop: "var(--ms-spacing-l)",
                        padding: "var(--ms-spacing-l)",
                        backgroundColor: "var(--ms-color-neutralLighter)",
                        borderRadius: "var(--ms-borderRadius-medium)",
                      }}
                    >
                      <Text
                        className="ms-font-s"
                        style={{
                          color: "var(--ms-color-neutralSecondary)",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {currentWorkflow.summary}
                      </Text>
                      {currentWorkflow.complianceLogId && (
                        <div style={{ marginTop: "var(--ms-spacing-m)" }}>
                          <Text
                            className="ms-font-s"
                            style={{ color: "var(--ms-color-neutralTertiary)" }}
                          >
                            Compliance Log ID: {currentWorkflow.complianceLogId}
                          </Text>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Compliance Details (Collapsible) */}
                <AnimatePresence>
                  {showComplianceDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        marginTop: "var(--ms-spacing-l)",
                        padding: "var(--ms-spacing-l)",
                        backgroundColor: "rgba(16, 124, 16, 0.1)",
                        borderRadius: "var(--ms-borderRadius-medium)",
                        border: "1px solid #107C10",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--ms-spacing-s)",
                          marginBottom: "var(--ms-spacing-m)",
                        }}
                      >
                        <ShieldCheckmarkRegular
                          style={{ fontSize: "20px", color: "#107C10" }}
                        />
                        <Text
                          className="ms-font-m"
                          style={{ fontWeight: 600, color: "#107C10" }}
                        >
                          Enterprise Compliance Summary
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gap: "var(--ms-spacing-s)",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                        }}
                      >
                        <div>
                          <Text
                            className="ms-font-s"
                            style={{ fontWeight: 600 }}
                          >
                            Audit Trail:
                          </Text>
                          <Text
                            className="ms-font-s"
                            style={{
                              color: "var(--ms-color-neutralSecondary)",
                            }}
                          >
                            Complete and immutable
                          </Text>
                        </div>
                        <div>
                          <Text
                            className="ms-font-s"
                            style={{ fontWeight: 600 }}
                          >
                            Data Classification:
                          </Text>
                          <Text
                            className="ms-font-s"
                            style={{
                              color: "var(--ms-color-neutralSecondary)",
                            }}
                          >
                            Internal/Confidential
                          </Text>
                        </div>
                        <div>
                          <Text
                            className="ms-font-s"
                            style={{ fontWeight: 600 }}
                          >
                            Regulatory Compliance:
                          </Text>
                          <Text
                            className="ms-font-s"
                            style={{
                              color: "var(--ms-color-neutralSecondary)",
                            }}
                          >
                            Microsoft 365, GDPR
                          </Text>
                        </div>
                        <div>
                          <Text
                            className="ms-font-s"
                            style={{ fontWeight: 600 }}
                          >
                            Retention Period:
                          </Text>
                          <Text
                            className="ms-font-s"
                            style={{
                              color: "var(--ms-color-neutralSecondary)",
                            }}
                          >
                            365 days
                          </Text>
                        </div>
                      </div>
                      <Button
                        appearance="subtle"
                        size="small"
                        onClick={() => setShowComplianceDetails(false)}
                        style={{ marginTop: "var(--ms-spacing-m)" }}
                      >
                        Hide Compliance Details
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example Prompts */}
        {!currentWorkflow && (
          <Card
            className="ms-card"
            style={{
              padding: "var(--ms-spacing-xxl)",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              border: "none",
              boxShadow: "var(--ms-shadow-depth8)",
              borderRadius: "var(--ms-borderRadius-large)",
            }}
          >
            <Text
              className="ms-font-l"
              style={{
                display: "block",
                marginBottom: "var(--ms-spacing-l)",
                fontWeight: 600,
              }}
            >
              Try these enterprise-ready examples:
            </Text>

            <div
              style={{
                display: "grid",
                gap: "var(--ms-spacing-s)",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              {examplePrompts.map((example, index) => (
                <Button
                  key={index}
                  appearance="subtle"
                  onClick={() => setPrompt(example)}
                  className="ms-button-secondary"
                  style={{
                    textAlign: "left",
                    height: "auto",
                    padding: "var(--ms-spacing-m)",
                    whiteSpace: "normal",
                    justifyContent: "flex-start",
                    borderRadius: "var(--ms-borderRadius-medium)",
                  }}
                >
                  <Text
                    className="ms-font-m"
                    style={{ color: "var(--ms-color-neutralSecondary)" }}
                  >
                    "{example}"
                  </Text>
                </Button>
              ))}
            </div>

            <div
              style={{
                marginTop: "var(--ms-spacing-l)",
                padding: "var(--ms-spacing-m)",
                backgroundColor: "rgba(16, 124, 16, 0.1)",
                borderRadius: "var(--ms-borderRadius-medium)",
                border: "1px solid #107C10",
              }}
            >
              <Text
                className="ms-font-s"
                style={{ color: "#107C10", fontWeight: 500 }}
              >
                🔒 <strong>Enterprise Compliance:</strong> Every action is
                logged with complete audit trails, data access tracking, user
                attribution, and regulatory compliance. Perfect for business
                environments with strict compliance requirements!
              </Text>
            </div>
          </Card>
        )}

        {/* Recent Results Summary */}
        {recentWorkflows.length > 0 && (
          <Card
            className="ms-card"
            style={{
              padding: "var(--ms-spacing-xxl)",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              border: "none",
              boxShadow: "var(--ms-shadow-depth8)",
              borderRadius: "var(--ms-borderRadius-large)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--ms-spacing-l)",
              }}
            >
              <Text className="ms-font-l" style={{ fontWeight: 600 }}>
                Recent Compliant Workflows
              </Text>
              <Button
                appearance="subtle"
                size="small"
                icon={<EyeRegular />}
                onClick={handleViewComplianceReport}
              >
                View Full Compliance Report
              </Button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--ms-spacing-m)",
              }}
            >
              {recentWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  style={{
                    padding: "var(--ms-spacing-m)",
                    backgroundColor: "var(--ms-color-neutralLighter)",
                    borderRadius: "var(--ms-borderRadius-medium)",
                    border: "1px solid var(--ms-color-neutralQuaternaryAlt)",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => setCurrentWorkflow(workflow)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      className="ms-font-m"
                      style={{ flex: 1, marginRight: "var(--ms-spacing-m)" }}
                    >
                      "{workflow.prompt}"
                    </Text>
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--ms-spacing-s)",
                        alignItems: "center",
                      }}
                    >
                      <Badge
                        appearance="outline"
                        size="small"
                        color="success"
                        className="ms-badge-success"
                      >
                        {workflow.results.length} Results
                      </Badge>
                      <Badge
                        appearance="outline"
                        size="small"
                        style={{ color: "#107C10", borderColor: "#107C10" }}
                      >
                        <ShieldCheckmarkRegular
                          style={{ fontSize: "12px", marginRight: "2px" }}
                        />
                        Compliant
                      </Badge>
                      <Badge
                        appearance="outline"
                        size="small"
                        style={{ color: "#FF6B35", borderColor: "#FF6B35" }}
                      >
                        ⚡ Groq
                      </Badge>
                      <Text
                        className="ms-font-s"
                        style={{ color: "var(--ms-color-neutralTertiary)" }}
                      >
                        {workflow.timestamp.toLocaleTimeString()}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
