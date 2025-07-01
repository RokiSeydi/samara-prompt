import React, { useState } from "react";
import { Text, Button } from "@fluentui/react-components";
import {
  Cloud16Regular,
  CloudRegular,
  DocumentRegular,
  PeopleRegular,
  PersonRegular,
  ShieldCheckmarkRegular,
} from "@fluentui/react-icons";
import { motion } from "framer-motion";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../config/msalConfig";
import { PrivacyPermissionsDialog } from "./PrivacyPermissionsDialog";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onStartDemo: () => void; // Keep for compatibility but won't be used
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
}) => {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const handleSignInClick = () => {
    // Show privacy dialog before proceeding to sign in
    setShowPrivacyDialog(true);
  };

  const handleProceedToSignIn = async () => {
    setShowPrivacyDialog(false);

    try {
      await instance.loginRedirect(loginRequest);
      // After successful login, automatically proceed to the main app
      setTimeout(() => {
        onGetStarted();
      }, 500);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleClosePrivacyDialog = () => {
    setShowPrivacyDialog(false);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--ms-color-themePrimary) 0%, var(--ms-color-themeDark) 100%)",
          padding: "var(--ms-spacing-xxxl) var(--ms-spacing-xxl)",
          textAlign: "center",
          color: "white",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* SAMARA AI Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              marginBottom: "var(--ms-spacing-xxl)",
              textAlign: "center",
            }}
          >
            <Text
              className="ms-font-su"
              style={{
                color: "white",
                letterSpacing: "4px",
                fontFamily: "Segoe UI, system-ui, sans-serif",
                display: "block",
                fontSize: "var(--ms-fontSize-68)",
                marginBottom: "var(--ms-spacing-s)",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                fontWeight: 300,
              }}
            >
              SAMARA AI
            </Text>
            <div
              style={{
                width: "120px",
                height: "3px",
                backgroundColor: "white",
                margin: "0 auto",
                borderRadius: "var(--ms-borderRadius-medium)",
                opacity: 0.8,
              }}
            />
          </motion.div>

          <div style={{ marginBottom: "var(--ms-spacing-xxxl)" }}>
            <Cloud16Regular
              style={{ fontSize: "64px", color: "white", opacity: 0.9 }}
            />
          </div>

          <Text
            className="ms-font-xxl"
            style={{
              display: "block",
              marginBottom: "var(--ms-spacing-l)",
              color: "white",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              fontWeight: 300,
            }}
          >
            Workflow Automation for Microsoft 365
          </Text>

          <Text
            className="ms-font-l"
            style={{
              display: "block",
              marginBottom: "var(--ms-spacing-xxxl)",
              color: "rgba(255, 255, 255, 0.9)",
              maxWidth: "600px",
              lineHeight: "1.5",
              fontWeight: 300,
            }}
          >
            One natural language prompt triggers intelligent multi-step
            workflows across your Microsoft 365 apps. Turn 10 hours of manual
            work into 5 minutes of automated magic.
          </Text>

          <div
            style={{
              display: "flex",
              gap: "var(--ms-spacing-xxxl)",
              justifyContent: "center",
              marginBottom: "var(--ms-spacing-xxxl)",
              flexWrap: "wrap",
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "var(--ms-spacing-xxl)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--ms-borderRadius-large)",
                minWidth: "180px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "var(--ms-shadow-depth8)",
              }}
            >
              <DocumentRegular
                style={{
                  fontSize: "32px",
                  color: "white",
                  marginBottom: "var(--ms-spacing-m)",
                  opacity: 0.9,
                }}
              />
              <Text
                className="ms-font-m"
                style={{
                  color: "white",
                  marginBottom: "var(--ms-spacing-s)",
                  fontWeight: 600,
                }}
              >
                Smart Automation
              </Text>
              <Text
                className="ms-font-s"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  textAlign: "center",
                }}
              >
                Excel merging, Word reports, PowerPoint presentations
              </Text>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "var(--ms-spacing-xxl)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--ms-borderRadius-large)",
                minWidth: "180px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "var(--ms-shadow-depth8)",
              }}
            >
              <PeopleRegular
                style={{
                  fontSize: "32px",
                  color: "white",
                  marginBottom: "var(--ms-spacing-m)",
                  opacity: 0.9,
                }}
              />
              <Text
                className="ms-font-m"
                style={{
                  color: "white",
                  marginBottom: "var(--ms-spacing-s)",
                  fontWeight: 600,
                }}
              >
                Team Coordination
              </Text>
              <Text
                className="ms-font-s"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  textAlign: "center",
                }}
              >
                Automated emails, Teams meetings, task creation
              </Text>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "var(--ms-spacing-xxl)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--ms-borderRadius-large)",
                minWidth: "180px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "var(--ms-shadow-depth8)",
              }}
            >
              <ShieldCheckmarkRegular
                style={{
                  fontSize: "32px",
                  color: "white",
                  marginBottom: "var(--ms-spacing-m)",
                  opacity: 0.9,
                }}
              />
              <Text
                className="ms-font-m"
                style={{
                  color: "white",
                  marginBottom: "var(--ms-spacing-s)",
                  fontWeight: 600,
                }}
              >
                Secure & Private
              </Text>
              <Text
                className="ms-font-s"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  textAlign: "center",
                }}
              >
                Zero data storage, Microsoft security standards
              </Text>
            </motion.div>
          </div>

          {/* Action Button */}
          {!isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                appearance="primary"
                size="large"
                icon={<PersonRegular />}
                onClick={handleSignInClick}
                className="ms-button-primary"
                style={{
                  fontSize: "var(--ms-fontSize-16)",
                  padding: "var(--ms-spacing-l) var(--ms-spacing-xxxl)",
                  background: "rgba(255, 255, 255, 0.9)",
                  color: "var(--ms-color-themePrimary)",
                  border: "none",
                  boxShadow: "var(--ms-shadow-depth16)",
                  fontWeight: 600,
                  borderRadius: "var(--ms-borderRadius-large)",
                }}
              >
                Sign In with Microsoft 365
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                appearance="primary"
                size="large"
                onClick={onGetStarted}
                className="ms-button-primary"
                style={{
                  fontSize: "var(--ms-fontSize-16)",
                  padding: "var(--ms-spacing-l) var(--ms-spacing-xxxl)",
                  background: "rgba(255, 255, 255, 0.9)",
                  color: "var(--ms-color-themePrimary)",
                  border: "none",
                  boxShadow: "var(--ms-shadow-depth16)",
                  fontWeight: 600,
                  borderRadius: "var(--ms-borderRadius-large)",
                }}
              >
                Start Automating Workflows
              </Button>
            </motion.div>
          )}

          {/* Progress Indicator */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ marginTop: "var(--ms-spacing-xxl)" }}
            >
              <Text
                className="ms-font-m"
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--ms-spacing-s)",
                }}
              >
                ✓ Successfully connected to Microsoft 365
              </Text>
            </motion.div>
          )}

          {/* Privacy Notice */}
          <div
            className="ms-card"
            style={{
              marginTop: "var(--ms-spacing-xxxl)",
              padding: "var(--ms-spacing-xl)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--ms-borderRadius-large)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              maxWidth: "500px",
              backdropFilter: "blur(10px)",
              boxShadow: "var(--ms-shadow-depth8)",
            }}
          >
            <Text
              className="ms-font-m"
              style={{ color: "rgba(255, 255, 255, 0.9)", lineHeight: "1.5" }}
            >
              🔒 <strong>Privacy First:</strong> Samara AI never stores your
              data. Everything stays in your Microsoft 365 environment. We only
              keep workflow metadata for audit trails—never your actual
              documents or sensitive information.
            </Text>
          </div>

          {/* Example Workflow */}
          <div
            className="ms-card"
            style={{
              marginTop: "var(--ms-spacing-xxxl)",
              padding: "var(--ms-spacing-xl)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "var(--ms-borderRadius-large)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              maxWidth: "600px",
              backdropFilter: "blur(5px)",
              boxShadow: "var(--ms-shadow-depth4)",
            }}
          >
            <Text
              className="ms-font-m"
              style={{
                color: "white",
                marginBottom: "var(--ms-spacing-m)",
                display: "block",
                fontWeight: 600,
              }}
            >
              💡 Example Workflow:
            </Text>
            <Text
              className="ms-font-m"
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: "1.5",
                fontStyle: "italic",
              }}
            >
              "Merge all Excel budget files from this quarter, create a summary
              report in Word, and email it to the finance team"
            </Text>
            <Text
              className="ms-font-s"
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                marginTop: "var(--ms-spacing-s)",
              }}
            >
              → Automated in 3 minutes instead of 8 hours of manual work
            </Text>
          </div>
        </motion.div>
      </div>

      {/* Privacy & Permissions Dialog */}
      <PrivacyPermissionsDialog
        isOpen={showPrivacyDialog}
        onClose={handleClosePrivacyDialog}
        onProceedToSignIn={handleProceedToSignIn}
      />
    </>
  );
};
