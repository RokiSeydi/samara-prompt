import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardPreview,
  Text,
  Badge,
  Spinner,
  Toast,
  ToastTitle,
  useToastController,
  Toaster,
} from "@fluentui/react-components";
import {
  SendRegular,
  Cloud16Regular,
  CheckmarkCircleRegular,
  ErrorCircleRegular,
  DocumentRegular,
  DocumentTableRegular,
  SlideTextRegular,
  NotebookRegular,
  Cloud16Color,
} from "@fluentui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useMsal } from "@azure/msal-react";
import { RealAICommandProcessor } from "../services/realAICommands";
import { loginRequest } from "../config/msalConfig";
import { useGraphData } from "../hooks/useGraphData";

interface AICommand {
  id: string;
  command: string;
  status: "processing" | "completed" | "error";
  result?: string;
  timestamp: Date;
  apps: string[];
  documentsUsed?: Array<{
    name: string;
    type: string;
    action: string;
  }>;
  outputFiles?: Array<{
    name: string;
    type: string;
    size: string;
  }>;
}

interface AICommandInterfaceProps {
  onCommandExecute?: (command: string, apps: string[]) => void;
  onCommandUpdate?: (commands: AICommand[]) => void;
}

export const AICommandInterface: React.FC<AICommandInterfaceProps> = ({
  onCommandExecute,
  onCommandUpdate,
}) => {
  const [command, setCommand] = useState("");
  const [commands, setCommands] = useState<AICommand[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { dispatchToast } = useToastController();
  const { instance, accounts } = useMsal();
  const { documents, error: documentsError, accountType } = useGraphData();

  // Check if user is ready for API usage
  const isReady = accounts.length > 0 && accountType === "business";

  console.log("🤖 AI Command Status:", {
    isAuthenticated: accounts.length > 0,
    accountType,
    isReady,
    documentsError,
    documentsCount: documents?.length || 0,
  });

  // Update parent component when commands change
  useEffect(() => {
    onCommandUpdate?.(commands);
  }, [commands, onCommandUpdate]);

  const detectApps = (command: string): string[] => {
    const apps: string[] = [];
    const lowerCommand = command.toLowerCase();

    if (
      lowerCommand.includes("excel") ||
      lowerCommand.includes("spreadsheet") ||
      lowerCommand.includes("sheet") ||
      lowerCommand.includes("budget") ||
      lowerCommand.includes("data") ||
      lowerCommand.includes("sales")
    ) {
      apps.push("excel");
    }
    if (
      lowerCommand.includes("word") ||
      lowerCommand.includes("document") ||
      lowerCommand.includes("doc") ||
      lowerCommand.includes("report") ||
      lowerCommand.includes("proposal") ||
      lowerCommand.includes("notes")
    ) {
      apps.push("word");
    }
    if (
      lowerCommand.includes("powerpoint") ||
      lowerCommand.includes("presentation") ||
      lowerCommand.includes("slide") ||
      lowerCommand.includes("ppt")
    ) {
      apps.push("powerpoint");
    }
    if (
      lowerCommand.includes("teams") ||
      lowerCommand.includes("meeting") ||
      lowerCommand.includes("chat") ||
      lowerCommand.includes("schedule")
    ) {
      apps.push("teams");
    }
    if (lowerCommand.includes("onenote") || lowerCommand.includes("note")) {
      apps.push("onenote");
    }
    if (
      lowerCommand.includes("outlook") ||
      lowerCommand.includes("email") ||
      lowerCommand.includes("calendar") ||
      lowerCommand.includes("mail")
    ) {
      apps.push("outlook");
    }

    return apps.length > 0 ? apps : ["outlook"]; // Default to Outlook for Business accounts
  };

  const getAppDisplayName = (appId: string): string => {
    const appNames = {
      excel: "Excel",
      word: "Word",
      powerpoint: "PowerPoint",
      onenote: "OneNote",
      outlook: "Outlook",
      teams: "Teams",
    };
    return appNames[appId] || appId;
  };

  const getAppIcon = (appId: string) => {
    const iconProps = { style: { fontSize: "14px", marginRight: "4px" } };
    const colorMap = {
      excel: "var(--ms-color-excel)",
      word: "var(--ms-color-word)",
      powerpoint: "var(--ms-color-powerpoint)",
      onenote: "var(--ms-color-onenote)",
      outlook: "var(--ms-color-outlook)",
      teams: "var(--ms-color-teams)",
    };

    const iconStyle = {
      ...iconProps.style,
      color: colorMap[appId] || "var(--ms-color-neutralPrimary)",
    };

    switch (appId) {
      case "excel":
        return <DocumentTableRegular style={iconStyle} />;
      case "word":
        return <DocumentRegular style={iconStyle} />;
      case "powerpoint":
        return <SlideTextRegular style={iconStyle} />;
      case "onenote":
        return <NotebookRegular style={iconStyle} />;
      default:
        return <DocumentRegular style={iconStyle} />;
    }
  };

  const executeRealCommand = async (
    command: string,
    detectedApps: string[]
  ): Promise<AICommand> => {
    const account = accounts[0];
    if (!account) throw new Error("No account found");

    console.log("🚀 Executing REAL AI command:", command);

    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account: account,
    });

    const processor = new RealAICommandProcessor();
    const result = await processor.processCommand({
      command,
      accessToken: response.accessToken,
      availableDocuments: documents,
    });

    return {
      id: Date.now().toString(),
      command,
      status: "completed",
      result,
      timestamp: new Date(),
      apps: detectedApps,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isProcessing) return;

    const detectedApps = detectApps(command);

    console.log("🎯 Starting command execution:", {
      command: command.trim(),
      isReady,
      detectedApps,
      accountsLength: accounts.length,
      accountType,
    });

    const newCommand: AICommand = {
      id: Date.now().toString(),
      command: command.trim(),
      status: "processing",
      timestamp: new Date(),
      apps: detectedApps,
    };

    setCommands((prev) => [newCommand, ...prev]);
    setIsProcessing(true);
    setCommand("");

    onCommandExecute?.(newCommand.command, detectedApps);

    try {
      let completedCommand: AICommand;

      if (isReady) {
        console.log("✅ Using real API processor...");
        // Use real API processor for business accounts
        completedCommand = await executeRealCommand(
          newCommand.command,
          detectedApps
        );
        console.log("✅ AI command completed:", completedCommand);
      } else {
        console.log("❌ Not ready for real API:", { isReady, accountType, accountsLength: accounts.length });
        // Show error for non-business accounts
        throw new Error("Business Microsoft 365 account required for AI commands");
      }

      console.log("🔄 Updating commands with completed result:", {
        newCommandId: newCommand.id,
        completedCommand,
      });

      setCommands((prev) =>
        prev.map((cmd) =>
          cmd.id === newCommand.id
            ? { ...cmd, ...completedCommand, id: newCommand.id }
            : cmd
        )
      );

      console.log("✅ Commands state updated successfully");

      dispatchToast(
        <Toast>
          <ToastTitle>AI Command Completed Successfully</ToastTitle>
        </Toast>,
        { intent: "success" }
      );
    } catch (error) {
      console.error("❌ AI command failed:", error);

      setCommands((prev) =>
        prev.map((cmd) =>
          cmd.id === newCommand.id
            ? {
                ...cmd,
                status: "error" as const,
                result: `Failed to execute command: ${error.message}`,
              }
            : cmd
        )
      );

      dispatchToast(
        <Toast>
          <ToastTitle>Command Failed</ToastTitle>
        </Toast>,
        { intent: "error" }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getExampleCommands = () => {
    if (isReady) {
      return [
        "Get my recent emails and create a summary",
        "Show me my meetings for today",
        "Create a Teams meeting for tomorrow at 2 PM",
        "Find my recent files and show their contents",
        "Send an email to my team about project status",
        "Schedule a follow-up meeting with yesterday's attendees",
        "Create a Word document with my task list",
        "Export my calendar events to a summary",
      ];
    } else {
      return [
        "Extract the budget data from my Excel file and create a summary in Word",
        "Take the sales figures from the Q4 Budget Analysis and create PowerPoint slides",
        "Combine the project status from Word with Excel data to create a comprehensive report",
        "Create meeting notes in OneNote based on the action items in my Word documents",
        "Generate a PowerPoint presentation from the key metrics in my Excel dashboard",
      ];
    }
  };

  return (
    <div style={{ marginBottom: "var(--ms-spacing-xxxl)" }}>
      <Toaster />

      {/* AI Command Input */}
      <Card
        className="ms-card ms-card-elevated"
        style={{
          marginBottom: "var(--ms-spacing-xxl)",
          background: isReady
            ? "linear-gradient(135deg, var(--ms-color-themePrimary) 0%, var(--ms-color-themeDark) 100%)"
            : "linear-gradient(135deg, var(--ms-color-onenote) 0%, #5A1A78 100%)",
          border: "none",
          borderRadius: "var(--ms-borderRadius-large)",
          boxShadow: "var(--ms-shadow-depth16)",
        }}
      >
        <CardHeader
          header={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--ms-spacing-m)",
                color: "white",
              }}
            >
              <Cloud16Color style={{ fontSize: "24px" }} />
              <Text
                className="ms-font-l"
                style={{ color: "white", fontWeight: 600 }}
              >
                AI Assistant - Cross-App Commands
              </Text>
              <Badge
                color={isReady ? "success" : "severe"}
                size="small"
                className={isReady ? "ms-badge-success" : "ms-badge-warning"}
                style={{
                  backgroundColor: isReady
                    ? "var(--ms-color-success)"
                    : "#E879F9",
                  color: "white",
                  border: "none",
                }}
              >
                {isReady ? "LIVE API" : "REQUIRES BUSINESS ACCOUNT"}
              </Badge>
            </div>
          }
          description={
            <div>
              <Text
                className="ms-font-m"
                style={{ color: "rgba(255, 255, 255, 0.8)", display: "block" }}
              >
                {isReady
                  ? "Execute real commands across all your Microsoft 365 apps instantly"
                  : "Demonstrating AI capabilities with realistic sample documents and workflows"}
              </Text>
              <Text
                className="ms-font-s"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  display: "block",
                  marginTop: "4px",
                }}
              >
                {isReady
                  ? `Business Account: ${accountType} • All Microsoft 365 apps ready`
                  : `Using demo documents for simulation • All features work exactly as they would with real data`}
              </Text>
            </div>
          }
        />
        <CardPreview>
          <form
            onSubmit={handleSubmit}
            style={{ padding: "var(--ms-spacing-l)" }}
          >
            <div
              style={{
                display: "flex",
                gap: "var(--ms-spacing-m)",
                alignItems: "flex-end",
              }}
            >
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={
                  isReady
                    ? "e.g., Get my recent emails and create a summary in Word"
                    : "e.g., Extract budget data from Excel and create a Word summary with charts"
                }
                disabled={isProcessing}
                className="ms-input"
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "var(--ms-borderRadius-large)",
                  fontSize: "var(--ms-fontSize-16)",
                  padding: "var(--ms-spacing-m)",
                }}
                size="large"
              />
              <Button
                type="submit"
                appearance="secondary"
                disabled={!command.trim() || isProcessing}
                icon={isProcessing ? <Spinner size="tiny" /> : <SendRegular />}
                size="large"
                className="ms-button-primary"
                style={{
                  backgroundColor: "white",
                  color: isReady
                    ? "var(--ms-color-themePrimary)"
                    : "var(--ms-color-onenote)",
                  border: "none",
                  minWidth: "120px",
                  borderRadius: "var(--ms-borderRadius-large)",
                  fontWeight: 600,
                }}
              >
                {isProcessing ? "Processing..." : "Execute"}
              </Button>
            </div>
          </form>
        </CardPreview>
      </Card>

      {/* Recent Commands Results */}
      {commands.length > 0 && (
        <div style={{ marginBottom: "var(--ms-spacing-xxl)" }}>
          <Text
            className="ms-font-l"
            style={{
              marginBottom: "var(--ms-spacing-l)",
              display: "block",
              fontWeight: 600,
            }}
          >
            Recent Commands
          </Text>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--ms-spacing-l)",
            }}
          >
            <AnimatePresence>
              {commands.slice(0, 3).map((cmd) => (
                <motion.div
                  key={cmd.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="ms-card"
                    style={{
                      border:
                        cmd.status === "completed"
                          ? "2px solid var(--ms-color-success)"
                          : cmd.status === "processing"
                          ? "2px solid var(--ms-color-info)"
                          : "2px solid var(--ms-color-error)",
                      backgroundColor:
                        cmd.status === "completed"
                          ? "var(--ms-color-successLight)"
                          : cmd.status === "processing"
                          ? "var(--ms-color-infoLight)"
                          : "var(--ms-color-errorLight)",
                      borderRadius: "var(--ms-borderRadius-large)",
                    }}
                  >
                    <CardHeader
                      header={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "var(--ms-spacing-m)",
                          }}
                        >
                          <div style={{ marginTop: "4px" }}>
                            {cmd.status === "processing" && (
                              <Spinner size="tiny" />
                            )}
                            {cmd.status === "completed" && (
                              <CheckmarkCircleRegular
                                style={{
                                  color: "var(--ms-color-success)",
                                  fontSize: "16px",
                                }}
                              />
                            )}
                            {cmd.status === "error" && (
                              <ErrorCircleRegular
                                style={{
                                  color: "var(--ms-color-error)",
                                  fontSize: "16px",
                                }}
                              />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              className="ms-font-l"
                              style={{
                                display: "block",
                                marginBottom: "var(--ms-spacing-s)",
                                fontWeight: 600,
                              }}
                            >
                              {cmd.command}
                            </Text>

                            <div
                              style={{
                                display: "flex",
                                gap: "var(--ms-spacing-s)",
                                flexWrap: "wrap",
                                marginBottom: "var(--ms-spacing-m)",
                              }}
                            >
                              {cmd.apps.map((app) => (
                                <Badge
                                  key={app}
                                  size="small"
                                  color={
                                    cmd.status === "processing"
                                      ? "important"
                                      : "brand"
                                  }
                                  style={{
                                    backgroundColor:
                                      cmd.status === "processing"
                                        ? "var(--ms-color-info)"
                                        : "var(--ms-color-themePrimary)",
                                    color: "white",
                                    border: "none",
                                  }}
                                >
                                  {getAppIcon(app)}
                                  {getAppDisplayName(app)}
                                </Badge>
                              ))}
                            </div>

                            {cmd.result && (
                              <div
                                style={{
                                  padding: "var(--ms-spacing-m)",
                                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                                  borderRadius: "var(--ms-borderRadius-medium)",
                                  marginBottom: "var(--ms-spacing-m)",
                                }}
                              >
                                <Text
                                  className="ms-font-m"
                                  style={{
                                    color:
                                      cmd.status === "error"
                                        ? "var(--ms-color-error)"
                                        : "var(--ms-color-neutralPrimary)",
                                    display: "block",
                                    lineHeight: "1.4",
                                  }}
                                >
                                  {cmd.result}
                                </Text>
                              </div>
                            )}

                            {/* Show documents used in demo mode */}
                            {!isReady &&
                              cmd.documentsUsed &&
                              cmd.documentsUsed.length > 0 && (
                                <div
                                  style={{
                                    marginBottom: "var(--ms-spacing-m)",
                                  }}
                                >
                                  <Text
                                    className="ms-font-s"
                                    style={{
                                      display: "block",
                                      marginBottom: "var(--ms-spacing-xs)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Documents Used:
                                  </Text>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "var(--ms-spacing-xs)",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {cmd.documentsUsed.map((doc, index) => (
                                      <Badge
                                        key={index}
                                        appearance="outline"
                                        size="small"
                                      >
                                        {getAppIcon(doc.type)}
                                        {doc.name} ({doc.action})
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Show output files in demo mode */}
                            {!isReady &&
                              cmd.outputFiles &&
                              cmd.outputFiles.length > 0 && (
                                <div
                                  style={{
                                    marginBottom: "var(--ms-spacing-m)",
                                  }}
                                >
                                  <Text
                                    className="ms-font-s"
                                    style={{
                                      display: "block",
                                      marginBottom: "var(--ms-spacing-xs)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Files Created:
                                  </Text>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "var(--ms-spacing-xs)",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {cmd.outputFiles.map((file, index) => (
                                      <Badge
                                        key={index}
                                        color="success"
                                        size="small"
                                        className="ms-badge-success"
                                      >
                                        {getAppIcon(file.type)}
                                        {file.name} ({file.size})
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                            <Text
                              className="ms-font-s"
                              style={{
                                color: "var(--ms-color-neutralTertiary)",
                              }}
                            >
                              {cmd.timestamp.toLocaleTimeString()} •{" "}
                              {isReady
                                ? "Real API execution"
                                : "Demo simulation"}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Example Commands */}
      {commands.length === 0 && (
        <Card
          className="ms-card"
          style={{
            backgroundColor: "var(--ms-color-neutralLighter)",
            border: "1px solid var(--ms-color-neutralQuaternaryAlt)",
            borderRadius: "var(--ms-borderRadius-large)",
          }}
        >
          <CardHeader
            header={
              <Text className="ms-font-l" style={{ fontWeight: 600 }}>
                {isReady
                  ? "Try these real API commands:"
                  : "Try these demo commands:"}
              </Text>
            }
            description={
              <div style={{ marginTop: "var(--ms-spacing-m)" }}>
                {getExampleCommands().map((example, index) => (
                  <div
                    key={index}
                    style={{ marginBottom: "var(--ms-spacing-s)" }}
                  >
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={() => setCommand(example)}
                      className="ms-button-secondary"
                      style={{
                        textAlign: "left",
                        height: "auto",
                        padding: "var(--ms-spacing-s) var(--ms-spacing-m)",
                        whiteSpace: "normal",
                        justifyContent: "flex-start",
                        borderRadius: "var(--ms-borderRadius-medium)",
                      }}
                    >
                      <Text
                        className="ms-font-s"
                        style={{
                          color: isReady
                            ? "var(--ms-color-themePrimary)"
                            : "var(--ms-color-onenote)",
                        }}
                      >
                        "{example}"
                      </Text>
                    </Button>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: "var(--ms-spacing-l)",
                    padding: "var(--ms-spacing-m)",
                    backgroundColor: isReady
                      ? "var(--ms-color-infoLight)"
                      : "var(--ms-color-infoLight)",
                    borderRadius: "var(--ms-borderRadius-medium)",
                    border: "1px solid var(--ms-color-info)",
                  }}
                >
                  <Text
                    className="ms-font-s"
                    style={{ color: "var(--ms-color-info)", fontWeight: 500 }}
                  >
                    {isReady ? (
                      <>
                        🚀 <strong>Live API Mode:</strong> These commands will
                        execute real operations across all your Microsoft 365
                        apps instantly. All actions will be performed on your
                        actual data and services!
                      </>
                    ) : (
                      <>
                        💡 <strong>Demo Mode:</strong> These commands will
                        simulate realistic AI workflows using your demo
                        documents. All features work exactly as they would with
                        real Microsoft 365 data! Try multiple commands to see
                        different scenarios.
                      </>
                    )}
                  </Text>
                </div>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
};
