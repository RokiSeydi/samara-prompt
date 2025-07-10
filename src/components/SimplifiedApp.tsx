import React, { useState, useEffect } from "react";
import { useIsAuthenticated } from "@azure/msal-react";
import { Text, Spinner } from "@fluentui/react-components";
import { motion, AnimatePresence } from "framer-motion";
import { WorkflowInterface } from "./WorkflowInterface";
import { WelcomeScreen } from "./WelcomeScreen";
import { TransportationDemo } from "./TransportationDemo";
import { RosterManagementDemo } from "./RosterManagementDemo";
import SmartRosterDemo from "./SmartRosterDemo";
import { RealExcelOptimizer } from "./RealExcelOptimizer";

export const SimplifiedApp: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const [showWelcome, setShowWelcome] = useState(!isAuthenticated);
  const [showTransition, setShowTransition] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Check URL parameters for demo mode
  const urlParams = new URLSearchParams(window.location.search);
  const demoMode = urlParams.get("demo");
  
  console.log('🔍 SimplifiedApp - Current URL:', window.location.href);
  console.log('🔍 SimplifiedApp - Demo mode:', demoMode);
  console.log('🔍 SimplifiedApp - URL params:', Object.fromEntries(urlParams.entries()));

  // If demo mode, skip authentication flow and go straight to demo
  useEffect(() => {
    if (demoMode === "transportation" || demoMode === "roster" || demoMode === "smart-roster" || demoMode === "excel-optimizer") {
      setShowWelcome(false);
      setShowTransition(false);
      setIsReady(true);
      return;
    }

    if (isAuthenticated && showWelcome) {
      // Start transition when user authenticates
      setShowWelcome(false);
      setShowTransition(true);
    } else if (isAuthenticated) {
      setIsReady(true);
    }
  }, [isAuthenticated, showWelcome, demoMode]);

  // Handle transition timer when showTransition changes
  useEffect(() => {
    if (showTransition) {
      const timer = setTimeout(() => {
        setShowTransition(false);
        setIsReady(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showTransition]);

  const handleGetStarted = () => {
    setShowWelcome(false);
    setShowTransition(true);
  };

  if (showTransition) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--ms-color-themePrimary) 0%, var(--ms-color-themeDark) 100%)",
          color: "white",
          textAlign: "center",
          padding: "var(--ms-spacing-xxxl) var(--ms-spacing-xxl)",
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Text
            className="ms-font-su"
            style={{
              display: "block",
              marginBottom: "var(--ms-spacing-xxl)",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              fontWeight: 300,
            }}
          >
            SAMARA AI
          </Text>

          <div style={{ marginBottom: "var(--ms-spacing-xxxl)" }}>
            <Spinner size="large" style={{ color: "white" }} />
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Text
              className="ms-font-l"
              style={{
                display: "block",
                marginBottom: "var(--ms-spacing-l)",
                opacity: 0.9,
                fontWeight: 300,
              }}
            >
              Connecting to Microsoft 365
            </Text>

            <Text
              className="ms-font-m"
              style={{
                opacity: 0.8,
                maxWidth: "400px",
                margin: "0 auto",
                fontWeight: 300,
              }}
            >
              Setting up secure connections to Excel, Word, PowerPoint, Outlook,
              Teams, and Planner...
            </Text>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {/* Handle demo modes first */}
      {demoMode === "transportation" && (
        <motion.div
          key="transportation-demo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TransportationDemo />
        </motion.div>
      )}

      {demoMode === "roster" && (
        <motion.div
          key="roster-demo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RosterManagementDemo />
        </motion.div>
      )}

      {demoMode === "smart-roster" && (
        <motion.div
          key="smart-roster-demo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SmartRosterDemo />
        </motion.div>
      )}

      {demoMode === "excel-optimizer" && (
        <motion.div
          key="excel-optimizer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RealExcelOptimizer />
        </motion.div>
      )}

      {/* Main app flow (only if not in demo mode) */}
      {!demoMode && showWelcome && (
        <WelcomeScreen
          key="welcome"
          onGetStarted={handleGetStarted}
          onStartDemo={() => {}} // Simplified - no demo mode
        />
      )}

      {!demoMode && !showWelcome && isReady && (
        <motion.div
          key="workflow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <WorkflowInterface />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
