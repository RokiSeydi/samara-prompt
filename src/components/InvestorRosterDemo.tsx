import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Button,
  Spinner,
  Avatar,
  Badge,
  Divider,
  Title1,
  Title2,
  Title3,
  Subtitle1,
  Subtitle2,
  Body1,
  Body2,
  Caption1,
} from "@fluentui/react-components";
import {
  CheckmarkCircleRegular,
  ClockRegular,
  DocumentRegular,
  PersonRegular,
  VehicleSubwayRegular,
  ShieldCheckmarkRegular,
  ArrowRightRegular,
  ChevronDownRegular,
  ChevronUpRegular,
  WindowRegular,
} from "@fluentui/react-icons";
import { motion, AnimatePresence } from "framer-motion";

// Add CSS styles for the animated SAMARA logo
const logoStyles = `
.company-name {
  font-size: var(--fluent-font-size-1000);
  font-weight: 700;
  background: linear-gradient(
    -45deg,
    #0078d4,
    #ff6b35,
    #f7931e,
    #ffd23f,
    #6264a7,
    #8b5cf6,
    #ff6b6b,
    #0078d4
  );
  background-size: 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: var(--fluent-spacing-xl) 0;
  padding: var(--fluent-spacing-l) 0;
  letter-spacing: -1px;
  animation: gradientMove 3s ease-in-out infinite;
  position: relative;
  line-height: 1.2;
  overflow: visible;
}

.company-name::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    -45deg,
    #0078d4,
    #ff6b35,
    #f7931e,
    #ffd23f,
    #6264a7,
    #8b5cf6,
    #ff6b6b,
    #0078d4
  );
  background-size: 400%;
  animation: rainbowShift 2s linear infinite;
  border-radius: inherit;
  z-index: -1;
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes rainbowShift {
  0% {
    background-position: 0% 50%;
    filter: hue-rotate(0deg);
  }
  25% {
    background-position: 25% 50%;
    filter: hue-rotate(90deg);
  }
  50% {
    background-position: 50% 50%;
    filter: hue-rotate(180deg);
  }
  75% {
    background-position: 75% 50%;
    filter: hue-rotate(270deg);
  }
  100% {
    background-position: 100% 50%;
    filter: hue-rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = logoStyles;
  if (!document.head.querySelector("style[data-samara-logo]")) {
    styleElement.setAttribute("data-samara-logo", "true");
    document.head.appendChild(styleElement);
  }
}

interface WorkflowStep {
  id: string;
  title: string;
  app: string;
  appIcon: string;
  status: "pending" | "waiting_approval" | "completed";
  file?: string;
  action: string;
  details?: string;
  duration?: number;
  samaraAnalysis?: {
    issues?: Array<{
      type: "warning" | "error" | "info";
      title: string;
      description: string;
      driver?: string;
    }>;
    summary: string;
  };
}

export const InvestorRosterDemo: React.FC = () => {
  const [currentState, setCurrentState] = useState<
    "login" | "loading" | "prompt" | "thinking" | "workflow" | "complete"
  >("login");
  const [prompt, setPrompt] = useState("");
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);

  const workflowSteps: WorkflowStep[] = [
    {
      id: "excel-access",
      title: "Accessing Driver Roster Data",
      app: "Excel",
      appIcon: "excel",
      status: "pending",
      file: "Driver_Schedule_Week_28.xlsx",
      action: "Reading current roster assignments and availability",
      details:
        "Analyzing 45 drivers across 3 depots with current shift patterns",
      samaraAnalysis: {
        summary: "Data structure validated, no formatting issues detected",
      },
    },
    {
      id: "vehicle-data",
      title: "Retrieving Vehicle Fleet Status",
      app: "Excel",
      appIcon: "excel",
      status: "pending",
      file: "Fleet_Management_July.xlsx",
      action: "Checking vehicle availability and maintenance schedules",
      details:
        "Scanning 38 vehicles for capacity, condition, and compliance status",
      samaraAnalysis: {
        summary: "Fleet data complete, all vehicles operational",
      },
    },
    {
      id: "compliance-check",
      title: "Running Compliance Validation",
      app: "SharePoint",
      appIcon: "sharepoint",
      status: "pending",
      file: "Compliance_Framework_2024.docx",
      action:
        "Validating against Working Time Directive and safety regulations",
      details:
        "Ensuring all assignments meet ORR requirements and fatigue management",
      samaraAnalysis: {
        issues: [
          {
            type: "warning",
            title: "Driving Hours Exceeded",
            description:
              "Driver M. Thompson scheduled for 11 hours on Thursday, exceeding 10-hour ORR limit",
            driver: "M. Thompson",
          },
        ],
        summary: "1 compliance issue identified requiring schedule adjustment",
      },
    },
    {
      id: "optimization",
      title: "Generating Optimized Roster",
      app: "AI Engine",
      appIcon: "ai",
      status: "pending",
      file: "Optimization_Algorithm_v3.2",
      action: "Creating cost-efficient assignments with compliance priority",
      details:
        "Balancing 156 routes with driver preferences and operational constraints",
      samaraAnalysis: {
        summary: "Algorithm parameters validated, ready for optimization",
      },
    },
    {
      id: "output-creation",
      title: "Creating Updated Roster File",
      app: "Excel",
      appIcon: "excel",
      status: "pending",
      file: "Optimized_Roster_Week_28_NEW.xlsx",
      action: "Generating new roster with highlighted changes",
      details: "15 optimizations made, saving £2,340 in operational costs",
      samaraAnalysis: {
        summary: "Output template ready, changes will be highlighted in green",
      },
    },
    {
      id: "notification-prep",
      title: "Preparing Staff Notifications",
      app: "Teams",
      appIcon: "teams",
      status: "pending",
      file: "Roster_Changes_Notification.msg",
      action: "Drafting personalized messages for affected drivers",
      details: "8 drivers to be notified of schedule adjustments via Teams",
      samaraAnalysis: {
        summary: "Message templates personalized for each affected driver",
      },
    },
  ];

  const [steps, setSteps] = useState(workflowSteps);

  // Auto-progression logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentState === "thinking") {
      setTimeout(() => setCurrentState("workflow"), 2000);
    }

    if (currentState === "workflow") {
      // Start processing timer
      interval = setInterval(() => {
        setProcessingTime((prev) => prev + 1);
      }, 1000);

      // Only activate the first step initially
      if (currentStepIndex === 0) {
        setTimeout(() => {
          setSteps((prev) => {
            const updated = [...prev];
            updated[0].status = "waiting_approval";
            return updated;
          });
        }, 1000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentState, currentStepIndex]);

  const handleStepApproval = (stepId: string) => {
    setSteps((prevSteps) => {
      const newSteps = [...prevSteps];
      const stepIndex = newSteps.findIndex((s) => s.id === stepId);

      if (stepIndex !== -1) {
        newSteps[stepIndex].status = "completed";
        newSteps[stepIndex].duration = Math.floor(Math.random() * 8) + 3;

        // Activate the next step if it exists
        if (stepIndex + 1 < newSteps.length) {
          setTimeout(() => {
            setSteps((prev) => {
              const updated = [...prev];
              updated[stepIndex + 1].status = "waiting_approval";
              return updated;
            });
          }, 500);
        }

        setCurrentStepIndex(stepIndex + 1);

        // If this was the last step, go to completion
        if (stepIndex === newSteps.length - 1) {
          setTimeout(() => setCurrentState("complete"), 1000);
        }
      }

      return newSteps;
    });

    setExpandedStep(null);
  };

  const getAppColor = (app: string) => {
    const colors = {
      Excel: "#217346",
      SharePoint: "#0078d4",
      Teams: "#6264a7",
      "AI Engine": "#8b5cf6",
    };
    return colors[app as keyof typeof colors] || "#0078d4";
  };

  const getAppIcon = (iconType: string) => {
    switch (iconType) {
      case "excel":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="2" fill="#217346" />
            <path
              d="M8 7l4 5-4 5h2l3-4 3 4h2l-4-5 4-5h-2l-3 4-3-4H8z"
              fill="white"
            />
          </svg>
        );
      case "sharepoint":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="2" fill="#0078d4" />
            <circle cx="12" cy="9" r="3" fill="white" />
            <path
              d="M5 18c0-3.87 3.13-7 7-7s7 3.13 7 7"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      case "teams":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="2" fill="#6264a7" />
            <circle cx="9" cy="8" r="2" fill="white" />
            <circle cx="15" cy="8" r="1.5" fill="white" />
            <path
              d="M5 18v-2c0-2.21 1.79-4 4-4s4 1.79 4 4v2"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M13 18v-2c0-1.66 1.34-3 3-3s3 1.34 3 3v2"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        );
      case "ai":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="2" fill="#8b5cf6" />
            <circle cx="12" cy="12" r="3" fill="white" />
            <path
              d="M12 1v6m0 10v6m11-7h-6m-10 0H1"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="m20.5 7.5-4.24 4.24M7.76 16.76l-4.24 4.24m16.48 0-4.24-4.24M7.76 7.24 3.52 3"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="2" fill="#0078d4" />
            <circle cx="12" cy="12" r="3" fill="white" />
          </svg>
        );
    }
  };

  const glassMorphismStyle = {
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    boxShadow:
      "0 12px 40px 0 rgba(31, 38, 135, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          currentState === "login" || currentState === "loading"
            ? "#f5f5f5"
            : "linear-gradient(135deg, rgb(26, 53, 169) 0%, rgb(52 30 74) 100%)",
        padding:
          currentState === "login" || currentState === "loading" ? "0" : "20px",
        fontFamily: "Segoe UI, system-ui, sans-serif",
      }}
    >
      <AnimatePresence mode="wait">
        {/* Microsoft Login State */}
        {currentState === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              gap: "0px",
            }}
          >
            <Card
              style={{
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: "2px",
                boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.2)",
                padding: "44px",
                textAlign: "center",
                maxWidth: "440px",
                width: "100%",
              }}
            >
              {/* Microsoft Logo */}
              <div style={{ marginBottom: "24px" }}>
                <svg
                  width="108"
                  height="24"
                  viewBox="0 0 108 24"
                  style={{ display: "block", margin: "0 auto" }}
                >
                  <title>Microsoft</title>
                  <rect x="0" y="0" width="10.8" height="10.8" fill="#F25022" />
                  <rect
                    x="12.6"
                    y="0"
                    width="10.8"
                    height="10.8"
                    fill="#7FBA00"
                  />
                  <rect
                    x="0"
                    y="12.6"
                    width="10.8"
                    height="10.8"
                    fill="#00A4EF"
                  />
                  <rect
                    x="12.6"
                    y="12.6"
                    width="10.8"
                    height="10.8"
                    fill="#FFB900"
                  />
                  <text
                    x="30"
                    y="8"
                    fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    fontSize="10.67"
                    fontWeight="600"
                    fill="#5E5E5E"
                  >
                    Microsoft
                  </text>
                </svg>
              </div>

              {/* Sign in heading */}
              <Title2
                style={{
                  color: "#1B1B1B",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "28px",
                  marginBottom: "16px",
                  textAlign: "left",
                }}
              >
                Sign in
              </Title2>

              {/* Subtitle */}
              <Body1
                style={{
                  color: "#1B1B1B",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  fontSize: "15px",
                  lineHeight: "20px",
                  marginBottom: "24px",
                  textAlign: "left",
                }}
              >
                to continue to Microsoft 365
              </Body1>

              {/* Email input field */}
              <div style={{ marginBottom: "16px", textAlign: "left" }}>
                <input
                  type="email"
                  placeholder="Email, phone, or Skype"
                  style={{
                    width: "100%",
                    height: "32px",
                    padding: "8px 12px",
                    border: "2px solid #605e5c",
                    borderRadius: "2px",
                    fontSize: "15px",
                    fontFamily:
                      "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0078d4";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#605e5c";
                  }}
                />
              </div>

              {/* Sign in button */}
              <Button
                appearance="primary"
                size="large"
                onClick={() => setCurrentState("loading")}
                style={{
                  background: "#0078d4",
                  border: "1px solid #0078d4",
                  borderRadius: "2px",
                  padding: "8px 12px",
                  height: "32px",
                  fontSize: "15px",
                  fontWeight: 400,
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  color: "white",
                  width: "100%",
                  marginBottom: "24px",
                }}
              >
                Next
              </Button>

              {/* Footer links */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  fontSize: "13px",
                  color: "#0067b8",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <a
                    href="#"
                    style={{ color: "#0067b8", textDecoration: "none" }}
                  >
                    Can't access your account?
                  </a>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <a
                    href="#"
                    style={{ color: "#0067b8", textDecoration: "none" }}
                  >
                    Sign-in options
                  </a>
                  <a
                    href="#"
                    style={{ color: "#0067b8", textDecoration: "none" }}
                  >
                    Create one!
                  </a>
                </div>
              </div>
            </Card>

            {/* Privacy footer */}
            <div
              style={{
                position: "fixed",
                bottom: "12px",
                left: "0",
                right: "0",
                display: "flex",
                justifyContent: "center",
                gap: "36px",
                fontSize: "12px",
                color: "#605e5c",
              }}
            >
              <a href="#" style={{ color: "#605e5c", textDecoration: "none" }}>
                Terms of use
              </a>
              <a href="#" style={{ color: "#605e5c", textDecoration: "none" }}>
                Privacy & cookies
              </a>
              <span>© Microsoft 2025</span>
            </div>
          </motion.div>
        )}

        {/* Microsoft 365 Copilot Loading State */}
        {currentState === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => {
              setTimeout(() => setCurrentState("prompt"), 3000);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              gap: "40px",
            }}
          >
            {/* Microsoft Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{ marginBottom: "20px" }}
            >
              <svg
                width="54"
                height="54"
                viewBox="0 0 24 24"
                style={{ display: "block", margin: "0 auto" }}
              >
                <rect x="0" y="0" width="10.8" height="10.8" fill="#F25022" />
                <rect
                  x="12.6"
                  y="0"
                  width="10.8"
                  height="10.8"
                  fill="#7FBA00"
                />
                <rect
                  x="0"
                  y="12.6"
                  width="10.8"
                  height="10.8"
                  fill="#00A4EF"
                />
                <rect
                  x="12.6"
                  y="12.6"
                  width="10.8"
                  height="10.8"
                  fill="#FFB900"
                />
              </svg>
            </motion.div>

            {/* Animated Copilot-style spinner */}
            <motion.div
              style={{
                position: "relative",
                width: "40px",
                height: "40px",
              }}
            >
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  width: "40px",
                  height: "40px",
                  border: "3px solid #e5e5e5",
                  borderTop: "3px solid #0078d4",
                  borderRadius: "50%",
                }}
              />

              {/* Inner ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  width: "24px",
                  height: "24px",
                  border: "2px solid transparent",
                  borderTop: "2px solid #0078d4",
                  borderRadius: "50%",
                  opacity: 0.6,
                }}
              />
            </motion.div>

            {/* Loading text with typing animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{ textAlign: "center" }}
            >
              <Title3
                style={{
                  color: "#323130",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  fontWeight: 600,
                  fontSize: "20px",
                  marginBottom: "8px",
                }}
              >
                Setting up your workspace
              </Title3>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
                style={{
                  height: "2px",
                  background:
                    "linear-gradient(90deg, #0078d4, #40e0d0, #0078d4)",
                  borderRadius: "1px",
                  margin: "0 auto",
                  maxWidth: "200px",
                }}
              />

              <Body1
                style={{
                  color: "#605e5c",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  fontSize: "14px",
                  marginTop: "16px",
                  opacity: 0.8,
                }}
              >
                Connecting to Microsoft 365...
              </Body1>
            </motion.div>

            {/* Animated dots */}
            <motion.div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#0078d4",
                  }}
                />
              ))}
            </motion.div>

            {/* App icons floating in */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              style={{
                display: "flex",
                gap: "24px",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              {[
                {
                  name: "Excel",
                  color: "#217346",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <rect width="16" height="16" rx="2" fill="#217346" />
                      <path
                        d="M6.5 4L4 8l2.5 4h1L5 8.5 7.5 4h-1z"
                        fill="white"
                      />
                      <path
                        d="M9.5 4L12 8l-2.5 4h-1L11 8.5 8.5 4h1z"
                        fill="white"
                      />
                    </svg>
                  ),
                },
                {
                  name: "SharePoint",
                  color: "#0078d4",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <rect width="16" height="16" rx="2" fill="#0078d4" />
                      <circle cx="8" cy="6" r="2.5" fill="white" />
                      <path
                        d="M3 12c0-2.76 2.24-5 5-5s5 2.24 5 5"
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  ),
                },
                {
                  name: "Teams",
                  color: "#6264a7",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <rect width="16" height="16" rx="2" fill="#6264a7" />
                      <circle cx="6" cy="5.5" r="1.5" fill="white" />
                      <circle cx="10.5" cy="5.5" r="1.2" fill="white" />
                      <path
                        d="M3.5 12v-1.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V12"
                        stroke="white"
                        strokeWidth="1"
                        fill="none"
                      />
                      <path
                        d="M8.5 12v-1.5c0-1.1.9-2 2-2s2 .9 2 2V12"
                        stroke="white"
                        strokeWidth="1"
                        fill="none"
                      />
                    </svg>
                  ),
                },
                {
                  name: "Word",
                  color: "#2b579a",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <rect width="16" height="16" rx="2" fill="#2b579a" />
                      <path
                        d="M4 4h8v1H4V4zM4 6h8v1H4V6zM4 8h8v1H4V8zM4 10h6v1H4v-1z"
                        fill="white"
                      />
                    </svg>
                  ),
                },
                {
                  name: "Outlook",
                  color: "#0078d4",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <rect width="16" height="16" rx="2" fill="#0078d4" />
                      <circle cx="8" cy="8" r="3" fill="white" />
                      <path
                        d="M6 7l1.5 1L10 6"
                        stroke="#0078d4"
                        strokeWidth="1.2"
                        fill="none"
                      />
                    </svg>
                  ),
                },
              ].map((app, index) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: [0, 1, 0.7, 1],
                    y: [20, 0, -2, 0],
                  }}
                  transition={{
                    delay: 1.8 + index * 0.15,
                    duration: 1.2,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    times: [0, 0.6, 0.8, 1],
                  }}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `
                      0 8px 32px rgba(${
                        app.color === "#217346"
                          ? "33, 115, 70"
                          : app.color === "#0078d4"
                          ? "0, 120, 212"
                          : app.color === "#6264a7"
                          ? "98, 100, 167"
                          : app.color === "#2b579a"
                          ? "43, 87, 154"
                          : "0, 120, 212"
                      }, 0.3),
                      0 2px 8px rgba(0, 0, 0, 0.1),
                      inset 0 1px 1px rgba(255, 255, 255, 0.8)
                    `,
                    border: "1px solid rgba(255, 255, 255, 0.6)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Glass reflection effect */}
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      right: "0",
                      height: "50%",
                      background:
                        "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)",
                      borderRadius: "12px 12px 0 0",
                      pointerEvents: "none",
                    }}
                  />
                  {app.icon}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Prompt Input State */}
        {currentState === "prompt" && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              gap: "30px",
            }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                textAlign: "center",
                marginBottom: "30px",
                padding: "20px 0",
              }}
            >
              <div
                className="company-name"
                style={{
                  fontSize: "48px",
                  marginBottom: "15px",
                }}
              >
                SAMARA
              </div>
              <Body1
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  display: "block",
                }}
              >
                Roki, your M365 apps are now connected. Let's get some work done
              </Body1>
            </motion.div>

            <Card
              style={{
                // ...glassMorphismStyle,
                // padding: "30px",
                width: "100%",
                maxWidth: "800px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                {/* <Avatar
                  name="SAMARA AI"
                  style={{
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                  }}
                /> */}
                <div style={{ flex: 1 }}>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="How can I help you today?"
                    style={{
                      width: "100%",
                      minHeight: "60px",
                      border: "none",
                      background: "rgba(255, 255, 255, 0.5)",
                      borderRadius: "12px",
                      padding: "15px",
                      fontSize: "16px",
                      fontFamily: "Segoe UI, system-ui, sans-serif",
                      resize: "none",
                      outline: "none",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (prompt.trim()) {
                          setCurrentState("thinking");
                        }
                      }
                    }}
                  />
                </div>
                <Button
                  appearance="primary"
                  onClick={() => {
                    if (prompt.trim()) {
                      setCurrentState("thinking");
                    }
                  }}
                  disabled={!prompt.trim()}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    minWidth: "50px",
                    boxShadow: "0 4px 20px 0 rgba(31, 38, 135, 0.2)",
                    transition: "all 0.2s ease",
                    // color: "white",
                  }}
                  onMouseEnter={(e) => {
                    if (!prompt.trim()) return;
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.25)";
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 24px 0 rgba(31, 38, 135, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.2)";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px 0 rgba(31, 38, 135, 0.2)";
                  }}
                >
                  <ArrowRightRegular style={{ fontSize: "20px" }} />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Thinking State */}
        {currentState === "thinking" && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              gap: "30px",
            }}
          >
            {/* Custom SAMARA thinking animation - no background card */}
            <motion.div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                maxWidth: "500px",
              }}
            >
              {/* Central AI icon only */}
              <motion.div
                style={{
                  position: "relative",
                  width: "120px",
                  height: "120px",
                  margin: "0 auto 30px",
                }}
              >
                {/* Central brain/AI icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)",
                    zIndex: 3,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9H21ZM19 21H5V3H13V9H19V21ZM12 18C12.6 18 13 17.6 13 17S12.6 16 12 16 11 16.4 11 17 11.4 18 12 18ZM12 8C9.8 8 8 9.8 8 12S9.8 16 12 16 16 14.2 16 12 14.2 8 12 8ZM12 14C10.9 14 10 13.1 10 12S10.9 10 12 10 14 10.9 14 12 13.1 14 12 14Z" />
                  </svg>
                </motion.div>

                {/* Scanning rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "80px",
                    height: "80px",
                    border: "2px solid transparent",
                    borderTop: "2px solid rgba(139, 92, 246, 0.6)",
                    borderRight: "2px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "50%",
                  }}
                />

                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "100px",
                    height: "100px",
                    border: "1px solid transparent",
                    borderLeft: "1px solid rgba(139, 92, 246, 0.4)",
                    borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
                    borderRadius: "50%",
                  }}
                />
              </motion.div>

              <Title2
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  display: "block",
                  marginBottom: "15px",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                thinking...
              </Title2>

              {/* Dynamic status messages */}
              <motion.div key="status-messages" style={{ minHeight: "40px" }}>
                {[
                  "Scanning your M365 workspace...",
                  "Analyzing file structures...",
                  "Identifying optimization opportunities...",
                  "Planning the optimal workflow...",
                ].map((message, index) => (
                  <motion.div
                    key={message}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: [10, 0, 0, -10],
                    }}
                    transition={{
                      duration: 2,
                      times: [0, 0.2, 0.8, 1],
                      delay: index * 1.5,
                      repeat: Infinity,
                      repeatDelay: 4.5,
                    }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "100%",
                    }}
                  >
                    <Body1
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        display: "block",
                        fontStyle: "italic",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      {message}
                    </Body1>
                  </motion.div>
                ))}
              </motion.div>

              {/* Rainbow gradient progress dots */}
              <motion.div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                {[0, 1, 2, 3].map((index) => (
                  <motion.div
                    key={index}
                    animate={{
                      scale: [0.8, 1.4, 0.8],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut",
                    }}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(-45deg, #0078d4, #ff6b35, #f7931e, #ffd23f, #6264a7, #8b5cf6, #ff6b6b, #0078d4)",
                      backgroundSize: "400%",
                      animation: "gradientMove 3s ease-in-out infinite",
                      boxShadow: "0 2px 8px rgba(139, 92, 246, 0.4)",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Workflow Timeline State */}
        {currentState === "workflow" && (
          <motion.div
            key="workflow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                textAlign: "center",
                marginBottom: "40px",
                padding: "20px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  marginBottom: "10px",
                  padding: "10px 0",
                }}
              >
                <div
                  className="company-name"
                  style={{
                    fontSize: "32px",
                    marginBottom: "0",
                  }}
                >
                  SAMARA
                </div>
                <Title3
                  style={{
                    color: "white",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  Workflow Pipeline
                </Title3>
              </div>
              <Body1
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  display: "block",
                }}
              >
                End-to-end roster generation with compliance validation
              </Body1>
            </motion.div>

            {/* Interactive Workflow Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: "24px",
                marginBottom: "30px",
              }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  <Card
                    style={{
                      ...glassMorphismStyle,
                      padding: "24px",
                      minHeight: "200px",
                      border:
                        step.status === "completed"
                          ? "2px solid rgba(5, 150, 105, 0.8)"
                          : step.status === "waiting_approval"
                          ? "2px solid rgba(251, 191, 36, 0.6)"
                          : "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow:
                        step.status === "completed"
                          ? "0 0 30px rgba(5, 150, 105, 0.3), 0 8px 32px rgba(0,0,0,0.12)"
                          : step.status === "waiting_approval"
                          ? "0 0 20px rgba(251, 191, 36, 0.2), 0 8px 32px rgba(0,0,0,0.12)"
                          : "0 8px 32px rgba(0,0,0,0.12)",
                      opacity: step.status === "pending" ? 0.6 : 1,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Status indicator */}
                    <div
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {step.status === "pending" && (
                        <Badge color="subtle" style={{ opacity: 0.6 }}>
                          Waiting
                        </Badge>
                      )}
                      {step.status === "waiting_approval" && (
                        <Badge appearance="filled" color="warning">
                          Review Required
                        </Badge>
                      )}
                      {step.status === "completed" && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <CheckmarkCircleRegular
                            style={{ fontSize: "16px", color: "#059669" }}
                          />
                          <Badge appearance="filled" color="success">
                            Complete ({step.duration}s)
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* App icon and title */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "6px",
                          background: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(10px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow:
                            "0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        {getAppIcon(step.appIcon)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Subtitle1 style={{ marginBottom: "4px" }}>
                          {step.title}
                        </Subtitle1>
                      </div>
                    </div>

                    {/* Action description */}
                    <Body2 style={{ marginBottom: "16px", lineHeight: 1.4 }}>
                      {step.action}
                    </Body2>

                    {/* File info */}
                    {step.file && (
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.3)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "6px",
                          padding: "12px",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        <DocumentRegular style={{ fontSize: "16px" }} />
                        <Caption1 style={{ fontFamily: "Consolas, monospace" }}>
                          {step.file}
                        </Caption1>
                      </div>
                    )}

                    {/* SAMARA Analysis section */}
                    {step.samaraAnalysis && (
                      <div
                        style={{
                          background: "rgba(139, 92, 246, 0.1)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "6px",
                          padding: "12px",
                          marginBottom: "16px",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.1)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: "bold",
                              color: "white",
                            }}
                          >
                            S
                          </div>
                          <Caption1
                            style={{
                              fontWeight: 600,
                              color: "rgb(49 24 106 / 90%)",
                            }}
                          >
                            SAMARA Analysis
                          </Caption1>
                        </div>

                        {step.samaraAnalysis.issues &&
                          step.samaraAnalysis.issues.length > 0 && (
                            <div style={{ marginBottom: "8px" }}>
                              {step.samaraAnalysis.issues.map((issue, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    background:
                                      issue.type === "warning"
                                        ? "rgba(251, 191, 36, 0.1)"
                                        : issue.type === "error"
                                        ? "rgba(239, 68, 68, 0.1)"
                                        : "rgba(59, 130, 246, 0.1)",
                                    border: `1px solid ${
                                      issue.type === "warning"
                                        ? "rgba(251, 191, 36, 0.3)"
                                        : issue.type === "error"
                                        ? "rgba(239, 68, 68, 0.3)"
                                        : "rgba(59, 130, 246, 0.3)"
                                    }`,
                                    borderRadius: "4px",
                                    padding: "8px",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "12px",
                                      marginBottom: "2px",
                                    }}
                                  >
                                    ⚠️ {issue.title}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      lineHeight: 1.3,
                                      opacity: 0.9,
                                    }}
                                  >
                                    {issue.description}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        <Caption1
                          style={{
                            fontSize: "11px",
                            lineHeight: 1.3,
                            opacity: 0.8,
                          }}
                        >
                          {step.samaraAnalysis.summary}
                        </Caption1>
                      </div>
                    )}

                    {/* Interactive action buttons */}
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {step.status === "completed" && (
                        <>
                          {/* File-specific actions based on app type */}
                          {step.app === "Excel" && (
                            <>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <WindowRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Open in Excel
                              </Button>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <ArrowRightRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                View Changes
                              </Button>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <DocumentRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Download File
                              </Button>
                            </>
                          )}

                          {step.app === "SharePoint" && (
                            <>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <WindowRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Open in SharePoint
                              </Button>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <DocumentRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Download Document
                              </Button>
                            </>
                          )}

                          {step.app === "Teams" && (
                            <>
                              <Button
                                size="small"
                                appearance="secondary"
                                onClick={() =>
                                  setExpandedStep(
                                    expandedStep === step.id ? null : step.id
                                  )
                                }
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <PersonRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Show Draft Messages
                              </Button>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <WindowRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Open in Teams
                              </Button>
                            </>
                          )}

                          {step.app === "AI Engine" && (
                            <>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <ArrowRightRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                View Algorithm Details
                              </Button>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <DocumentRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Export Results
                              </Button>
                            </>
                          )}
                        </>
                      )}

                      {step.status === "pending" && step.file && (
                        <Button
                          size="small"
                          appearance="secondary"
                          disabled
                          style={{
                            background: "rgba(255, 255, 255, 0.3)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "4px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            opacity: 0.6,
                          }}
                        >
                          <DocumentRegular
                            style={{ fontSize: "14px", marginRight: "6px" }}
                          />
                          File Preview
                        </Button>
                      )}

                      {step.status === "waiting_approval" && (
                        <>
                          {/* File preview/open actions for waiting approval */}
                          {step.app === "Excel" && (
                            <>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <WindowRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Open in Excel
                              </Button>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <DocumentRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Preview File
                              </Button>
                            </>
                          )}

                          {step.app === "SharePoint" && (
                            <>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <WindowRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Open in SharePoint
                              </Button>
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                <DocumentRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Preview Document
                              </Button>
                            </>
                          )}

                          {/* Compliance-specific rectification options */}
                          {step.id === "compliance-check" &&
                            step.samaraAnalysis?.issues &&
                            step.samaraAnalysis.issues.length > 0 && (
                              <Button
                                size="small"
                                appearance="secondary"
                                style={{
                                  background: "rgba(251, 191, 36, 0.2)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(251, 191, 36, 0.4)",
                                  borderRadius: "4px",
                                  boxShadow:
                                    "0 4px 12px rgba(251, 191, 36, 0.1)",
                                  color: "rgb(146, 64, 14)",
                                }}
                              >
                                <ArrowRightRegular
                                  style={{
                                    fontSize: "14px",
                                    marginRight: "6px",
                                  }}
                                />
                                Auto-Fix Issue
                              </Button>
                            )}

                          <Button
                            appearance="primary"
                            size="small"
                            onClick={() => handleStepApproval(step.id)}
                            style={{
                              background:
                                "linear-gradient(135deg, #059669 0%, #047857 100%)",
                              border: "none",
                            }}
                          >
                            <CheckmarkCircleRegular
                              style={{ fontSize: "14px", marginRight: "6px" }}
                            />
                            Approve & Continue
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Expanded content for Teams messages */}
                    <AnimatePresence>
                      {expandedStep === step.id &&
                        step.app === "Teams" &&
                        step.status === "completed" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: "hidden" }}
                          >
                            <Divider style={{ margin: "16px 0" }} />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                              }}
                            >
                              <Subtitle2 style={{ marginBottom: "12px" }}>
                                Draft Messages (8 affected drivers)
                              </Subtitle2>

                              {/* Sample message previews */}
                              {[
                                {
                                  name: "Sarah Johnson",
                                  shift: "Early shift moved to 06:30-14:30",
                                },
                                {
                                  name: "Mike Chen",
                                  shift:
                                    "Route changed from North to Central depot",
                                },
                                {
                                  name: "Emma Davis",
                                  shift: "Friday shift extended by 2 hours",
                                },
                              ].map((driver, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.4)",
                                    backdropFilter: "blur(8px)",
                                    borderRadius: "6px",
                                    padding: "12px",
                                    marginBottom: "8px",
                                    fontSize: "13px",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight: 600,
                                      marginBottom: "4px",
                                    }}
                                  >
                                    To: {driver.name}
                                  </div>
                                  <div>
                                    Hi {driver.name.split(" ")[0]}, your
                                    schedule has been updated: {driver.shift}.
                                    Please confirm receipt. Thanks, Roster Team.
                                  </div>
                                </div>
                              ))}

                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  marginTop: "12px",
                                }}
                              >
                                <Button size="small" appearance="primary">
                                  Send All Messages
                                </Button>
                                <Button size="small" appearance="secondary">
                                  Edit Messages
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Details expansion for waiting approval */}
                    <AnimatePresence>
                      {step.status === "waiting_approval" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: "hidden" }}
                        >
                          <Divider style={{ margin: "16px 0" }} />
                          <div
                            style={{
                              background: "rgba(255, 255, 255, 0.4)",
                              backdropFilter: "blur(10px)",
                              borderRadius: "6px",
                              padding: "16px",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          >
                            <Subtitle2 style={{ marginBottom: "8px" }}>
                              Review Details
                            </Subtitle2>
                            <br />
                            <Body2
                              style={{ lineHeight: 1.4, marginBottom: "12px" }}
                            >
                              {step.details}
                            </Body2>

                            {/* Compliance warning for issues */}
                            {step.id === "compliance-check" &&
                              step.samaraAnalysis?.issues &&
                              step.samaraAnalysis.issues.length > 0 && (
                                <div
                                  style={{
                                    background: "rgba(239, 68, 68, 0.1)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    borderRadius: "6px",
                                    padding: "12px",
                                    marginTop: "12px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    <div style={{ fontSize: "16px" }}>⚠️</div>
                                    <Subtitle2
                                      style={{
                                        color: "rgb(185, 28, 28)",
                                        margin: 0,
                                      }}
                                    >
                                      Compliance Warning
                                    </Subtitle2>
                                  </div>
                                  <Body2
                                    style={{
                                      fontSize: "13px",
                                      lineHeight: 1.4,
                                      marginBottom: "8px",
                                    }}
                                  >
                                    <strong>
                                      Proceeding with this compliance issue may
                                      result in:
                                    </strong>
                                  </Body2>
                                  <ul
                                    style={{
                                      fontSize: "12px",
                                      lineHeight: 1.4,
                                      margin: "0 0 12px 16px",
                                      padding: 0,
                                    }}
                                  >
                                    <li>
                                      Legal liability for ORR non-compliance
                                    </li>
                                    <li>
                                      Potential safety incidents and insurance
                                      claims
                                    </li>
                                    <li>
                                      Full audit trail recorded for regulatory
                                      review
                                    </li>
                                    <li>
                                      Management accountability for override
                                      decisions
                                    </li>
                                  </ul>
                                  <Body2
                                    style={{
                                      fontSize: "12px",
                                      fontStyle: "italic",
                                      opacity: 0.9,
                                    }}
                                  >
                                    All decisions are logged in the compliance
                                    report and accessible to auditors.
                                  </Body2>
                                </div>
                              )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Summary section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card
                style={{
                  ...glassMorphismStyle,
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <Title3 style={{ marginBottom: "16px" }}>
                  Workflow Progress
                </Title3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "24px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ClockRegular style={{ fontSize: "16px" }} />
                    <Body2>Processing: {processingTime}s</Body2>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckmarkCircleRegular
                      style={{ fontSize: "16px", color: "#059669" }}
                    />
                    <Body2>
                      {steps.filter((s) => s.status === "completed").length}/
                      {steps.length} Complete
                    </Body2>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ShieldCheckmarkRegular
                      style={{ fontSize: "16px", color: "#0078d4" }}
                    />
                    <Body2>100% Compliant</Body2>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "24px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ClockRegular style={{ fontSize: "16px" }} />
                    <Body2>Processing: {processingTime}s</Body2>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckmarkCircleRegular
                      style={{ fontSize: "16px", color: "#059669" }}
                    />
                    <Body2>
                      {steps.filter((s) => s.status === "completed").length}/
                      {steps.length} Complete
                    </Body2>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ShieldCheckmarkRegular
                      style={{ fontSize: "16px", color: "#0078d4" }}
                    />
                    <Body2>100% Compliant</Body2>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Completion State */}
        {currentState === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              gap: "30px",
            }}
          >
            <Card
              style={{
                ...glassMorphismStyle,
                padding: "48px",
                textAlign: "center",
                maxWidth: "700px",
                width: "100%",
              }}
            >
              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  delay: 0.2,
                  duration: 0.8,
                  stiffness: 200,
                }}
                style={{ marginBottom: "24px" }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    boxShadow:
                      "0 8px 32px rgba(5, 150, 105, 0.3), 0 0 40px rgba(5, 150, 105, 0.2)",
                    position: "relative",
                  }}
                >
                  <CheckmarkCircleRegular
                    style={{
                      fontSize: "40px",
                      color: "white",
                    }}
                  />
                  {/* Glow effect */}
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, rgba(5, 150, 105, 0.4) 0%, rgba(4, 120, 87, 0.4) 100%)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                </div>
              </motion.div>

              {/* Title with SAMARA branding */}
              <div style={{ marginBottom: "24px" }}>
                <Title1
                  style={{
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontSize: "32px",
                    fontWeight: 700,
                    marginBottom: "8px",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Roster Generated Successfully!
                </Title1>
                <Body1
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "16px",
                    fontWeight: 400,
                  }}
                >
                  SAMARA has optimized your transportation roster with full
                  compliance
                </Body1>
              </div>

              {/* Elegant stats cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                {[
                  {
                    label: "Drivers Optimized",
                    value: "45",
                    color: "#059669",
                    icon: "👥",
                  },
                  {
                    label: "Vehicles Assigned",
                    value: "38",
                    color: "#0078d4",
                    icon: "🚌",
                  },
                  {
                    label: "Cost Savings",
                    value: "£2,340",
                    color: "#8b5cf6",
                    icon: "💰",
                  },
                  {
                    label: "Processing Time",
                    value: `${processingTime}s`,
                    color: "#f59e0b",
                    icon: "⚡",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${stat.color}40`,
                      borderRadius: "12px",
                      padding: "20px 16px",
                      textAlign: "center",
                      boxShadow: `0 4px 20px ${stat.color}20`,
                    }}
                  >
                    <div style={{ fontSize: "20px", marginBottom: "8px" }}>
                      {stat.icon}
                    </div>
                    <Title3
                      style={{
                        color: stat.color,
                        marginBottom: "4px",
                        fontSize: "24px",
                        fontWeight: 700,
                      }}
                    >
                      {stat.value}
                    </Title3>
                    <Caption1
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </Caption1>
                  </motion.div>
                ))}
              </div>

              {/* SAMARA AI conversation card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                  background: "rgba(139, 92, 246, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "32px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <Avatar
                    name="SAMARA AI"
                    style={{
                      background:
                        "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                      width: "48px",
                      height: "48px",
                      fontSize: "18px",
                    }}
                  />
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <Subtitle1
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        marginBottom: "4px",
                        fontWeight: 600,
                      }}
                    >
                      SAMARA AI Assistant
                    </Subtitle1>
                    <Caption1
                      style={{
                        color: "rgba(139, 92, 246, 0.8)",
                        fontSize: "12px",
                      }}
                    >
                      Ready for your next request
                    </Caption1>
                  </div>
                </div>
                <Body1
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    textAlign: "left",
                  }}
                >
                  "Excellent! Your roster has been optimized with full
                  regulatory compliance. Would you like me to generate next
                  week's schedule or help with something else?"
                </Body1>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {[
                  {
                    label: "Generate Next Week",
                    variant: "secondary" as const,
                    color: "#0078d4",
                    icon: <ArrowRightRegular style={{ fontSize: "16px" }} />,
                  },
                  {
                    label: "Export to Teams",
                    variant: "secondary" as const,
                    color: "#6264a7",
                    icon: <WindowRegular style={{ fontSize: "16px" }} />,
                  },
                  {
                    label: "Schedule Review",
                    variant: "secondary" as const,
                    color: "#f59e0b",
                    icon: <ClockRegular style={{ fontSize: "16px" }} />,
                  },
                ].map((action, index) => (
                  <Button
                    key={action.label}
                    appearance={action.variant}
                    size="medium"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${action.color}40`,
                      borderRadius: "8px",
                      color: action.color,
                      padding: "12px 20px",
                      fontWeight: 500,
                      boxShadow: `0 4px 12px ${action.color}20`,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${action.color}20`;
                      e.currentTarget.style.borderColor = `${action.color}60`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 6px 20px ${action.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.borderColor = `${action.color}40`;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}20`;
                    }}
                  >
                    {action.icon}
                    <span style={{ marginLeft: "8px" }}>{action.label}</span>
                  </Button>
                ))}
              </motion.div>

              {/* Primary CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                style={{ marginTop: "24px" }}
              >
                <Button
                  appearance="primary"
                  size="large"
                  onClick={() => {
                    setCurrentState("prompt");
                    setPrompt("");
                    setCurrentStepIndex(0);
                    setProcessingTime(0);
                    setExpandedStep(null);
                    setSteps(
                      workflowSteps.map((step) => ({
                        ...step,
                        status: "pending" as const,
                        duration: undefined,
                      }))
                    );
                  }}
                  style={{
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "16px 32px",
                    fontSize: "16px",
                    fontWeight: 600,
                    boxShadow: "0 8px 32px rgba(139, 92, 246, 0.4)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 40px rgba(139, 92, 246, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 32px rgba(139, 92, 246, 0.4)";
                  }}
                >
                  <ArrowRightRegular
                    style={{ fontSize: "18px", marginRight: "8px" }}
                  />
                  Start New Request
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestorRosterDemo;
