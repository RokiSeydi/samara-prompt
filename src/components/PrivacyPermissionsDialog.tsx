import React, { useState } from "react";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Text,
  Card,
  Badge,
  Divider,
} from "@fluentui/react-components";
import {
  ShieldCheckmarkRegular,
  LockClosedRegular,
  DocumentRegular,
  MailRegular,
  ShareRegular,
  CloudSyncRegular,
  InfoRegular,
  DismissRegular,
  PersonRegular,
  CheckmarkCircleRegular,
} from "@fluentui/react-icons";
import { motion } from "framer-motion";

interface PrivacyPermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToSignIn: () => void;
  onTryDemo?: () => void;
}

export const PrivacyPermissionsDialog: React.FC<
  PrivacyPermissionsDialogProps
> = ({ isOpen, onClose, onProceedToSignIn, onTryDemo }) => {
  const [currentSection, setCurrentSection] = useState<
    "overview" | "permissions" | "security"
  >("overview");

  const permissionItems = [
    {
      icon: <DocumentRegular style={{ fontSize: "20px", color: "#107C41" }} />,
      title: "Reading & Writing Files",
      description:
        "Access your Excel, Word, PowerPoint files for automated workflows",
      details: [
        "Merge Excel spreadsheets automatically",
        "Generate Word reports from data analysis",
        "Create PowerPoint presentations with charts",
        "Save new documents to your OneDrive",
      ],
      technical: "Files.Read, Files.ReadWrite permissions",
    },
    {
      icon: <MailRegular style={{ fontSize: "20px", color: "#0078D4" }} />,
      title: "Sending Emails",
      description: "Send automated notifications and reports through Outlook",
      details: [
        "Email completed reports to stakeholders",
        "Send workflow completion notifications",
        "Share generated documents with teams",
        "Maintain professional email formatting",
      ],
      technical: "Mail.Send permission",
    },
    {
      icon: <ShareRegular style={{ fontSize: "20px", color: "#6264A7" }} />,
      title: "Calendar & Tasks",
      description: "Schedule meetings and create tasks automatically",
      details: [
        "Schedule Teams meetings for workflow reviews",
        "Create calendar events for deadlines",
        "Generate tasks in Planner from action items",
        "Coordinate team schedules efficiently",
      ],
      technical: "Calendars.ReadWrite, Tasks.ReadWrite permissions",
    },
    {
      icon: <CloudSyncRegular style={{ fontSize: "20px", color: "#7719AA" }} />,
      title: "Persistent Access",
      description: "Maintain workflow continuity and background processing",
      details: [
        "Complete long-running workflows reliably",
        "Maintain real-time sync with Microsoft 365",
        "Enable seamless workflow automation",
        "Support for scheduled and background tasks",
      ],
      technical: "offline_access permission",
    },
  ];

  const securityFeatures = [
    {
      icon: (
        <LockClosedRegular style={{ fontSize: "18px", color: "#107C10" }} />
      ),
      title: "Zero Data Storage",
      description:
        "Samara AI never stores your files. All data remains in your Microsoft 365 environment.",
    },
    {
      icon: (
        <ShieldCheckmarkRegular
          style={{ fontSize: "18px", color: "#0078D4" }}
        />
      ),
      title: "Microsoft Security",
      description:
        "All actions follow Microsoft's security policies and use official Microsoft Graph APIs.",
    },
    {
      icon: (
        <CheckmarkCircleRegular
          style={{ fontSize: "18px", color: "#6264A7" }}
        />
      ),
      title: "Audit Trail Only",
      description:
        "We only store workflow metadata for audit trails - never your actual document content.",
    },
    {
      icon: <PersonRegular style={{ fontSize: "18px", color: "#D24726" }} />,
      title: "Your Control",
      description:
        "You can revoke permissions at any time through your Microsoft 365 admin panel.",
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(event, data) => !data.open && onClose()}
    >
      <DialogSurface
        style={{ maxWidth: "700px", width: "90vw", maxHeight: "90vh" }}
      >
        <DialogTitle>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ShieldCheckmarkRegular
              style={{ fontSize: "28px", color: "#667eea" }}
            />
            <div>
              <Text size={600} weight="semibold">
                Privacy & Permissions
              </Text>
              <Text size={300} style={{ color: "#605E5C", display: "block" }}>
                Understanding what Samara AI needs for workflow automation
              </Text>
            </div>
          </div>
        </DialogTitle>

        <DialogContent style={{ padding: "0 24px" }}>
          {/* Navigation Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "24px",
              borderBottom: "1px solid #E1DFDD",
              paddingBottom: "12px",
            }}
          >
            <Button
              appearance={currentSection === "overview" ? "primary" : "subtle"}
              size="small"
              onClick={() => setCurrentSection("overview")}
            >
              Overview
            </Button>
            <Button
              appearance={
                currentSection === "permissions" ? "primary" : "subtle"
              }
              size="small"
              onClick={() => setCurrentSection("permissions")}
            >
              Permissions
            </Button>
            <Button
              appearance={currentSection === "security" ? "primary" : "subtle"}
              size="small"
              onClick={() => setCurrentSection("security")}
            >
              Security
            </Button>
          </div>

          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {/* Overview Section */}
            {currentSection === "overview" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: "24px" }}>
                  <Text
                    size={500}
                    weight="semibold"
                    style={{ display: "block", marginBottom: "12px" }}
                  >
                    Why Samara AI Needs These Permissions
                  </Text>
                  <Text
                    size={400}
                    style={{ lineHeight: "1.6", color: "#323130" }}
                  >
                    Samara AI automates complex workflows across your Microsoft
                    365 apps, turning hours of manual work into minutes of
                    automated processing.
                    <strong> We don't store any of your data</strong>—everything
                    stays in your Microsoft environment.
                  </Text>
                </div>

                <Card
                  style={{
                    padding: "20px",
                    backgroundColor: "#E6F3FF",
                    border: "2px solid #C7E0F4",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <InfoRegular
                      style={{ fontSize: "20px", color: "#667eea" }}
                    />
                    <Text
                      size={400}
                      weight="semibold"
                      style={{ color: "#667eea" }}
                    >
                      What happens when you click "Sign in with Microsoft"
                    </Text>
                  </div>
                  <Text
                    size={300}
                    style={{ lineHeight: "1.5", color: "#323130" }}
                  >
                    You'll be redirected to Microsoft's secure login page where
                    you can review and approve the specific permissions Samara
                    AI needs. You're always in control and can revoke these
                    permissions at any time through your Microsoft 365 settings.
                  </Text>
                </Card>

                <div style={{ marginBottom: "24px" }}>
                  <Text
                    size={400}
                    weight="semibold"
                    style={{ display: "block", marginBottom: "16px" }}
                  >
                    Quick Permission Summary:
                  </Text>

                  <div style={{ display: "grid", gap: "12px" }}>
                    {permissionItems.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          backgroundColor: "#F8F9FA",
                          borderRadius: "6px",
                          border: "1px solid #E1DFDD",
                        }}
                      >
                        {item.icon}
                        <div style={{ flex: 1 }}>
                          <Text
                            size={300}
                            weight="semibold"
                            style={{ display: "block" }}
                          >
                            {item.title}
                          </Text>
                          <Text size={200} style={{ color: "#605E5C" }}>
                            {item.description}
                          </Text>
                        </div>
                        <CheckmarkCircleRegular
                          style={{ fontSize: "16px", color: "#107C10" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Card
                  style={{
                    padding: "16px",
                    backgroundColor: "#F3F9F1",
                    border: "2px solid #C4E7C7",
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
                    <LockClosedRegular
                      style={{ fontSize: "18px", color: "#107C10" }}
                    />
                    <Text
                      size={400}
                      weight="semibold"
                      style={{ color: "#107C10" }}
                    >
                      Your Data Security Promise
                    </Text>
                  </div>
                  <Text
                    size={300}
                    style={{ lineHeight: "1.5", color: "#323130" }}
                  >
                    <strong>
                      Samara AI never stores or exports your files.
                    </strong>{" "}
                    All workflow automation happens within your Microsoft 365
                    account and follows Microsoft's security policies. We only
                    keep workflow metadata for audit trails—never your actual
                    document content.
                  </Text>
                </Card>
              </motion.div>
            )}

            {/* Permissions Section */}
            {currentSection === "permissions" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Text
                  size={500}
                  weight="semibold"
                  style={{ display: "block", marginBottom: "16px" }}
                >
                  Detailed Permission Breakdown
                </Text>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {permissionItems.map((item, index) => (
                    <Card
                      key={index}
                      style={{ padding: "20px", border: "1px solid #E1DFDD" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px",
                            borderRadius: "8px",
                            backgroundColor: `${item.icon.props.style.color}15`,
                          }}
                        >
                          {item.icon}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              marginBottom: "8px",
                            }}
                          >
                            <Text size={400} weight="semibold">
                              {item.title}
                            </Text>
                            <Badge appearance="outline" size="small">
                              Required
                            </Badge>
                          </div>

                          <Text
                            size={300}
                            style={{ color: "#605E5C", marginBottom: "12px" }}
                          >
                            {item.description}
                          </Text>

                          <Text
                            size={300}
                            weight="semibold"
                            style={{ marginBottom: "8px" }}
                          >
                            Enables automated workflows like:
                          </Text>

                          <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            {item.details.map((detail, detailIndex) => (
                              <li
                                key={detailIndex}
                                style={{ marginBottom: "4px" }}
                              >
                                <Text size={300} style={{ color: "#323130" }}>
                                  {detail}
                                </Text>
                              </li>
                            ))}
                          </ul>

                          <div
                            style={{
                              marginTop: "12px",
                              padding: "8px 12px",
                              backgroundColor: "#F8F9FA",
                              borderRadius: "4px",
                            }}
                          >
                            <Text
                              size={200}
                              style={{
                                color: "#8A8886",
                                fontFamily: "monospace",
                              }}
                            >
                              Technical: {item.technical}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security Section */}
            {currentSection === "security" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Text
                  size={500}
                  weight="semibold"
                  style={{ display: "block", marginBottom: "16px" }}
                >
                  How We Protect Your Data
                </Text>

                <div
                  style={{ display: "grid", gap: "16px", marginBottom: "24px" }}
                >
                  {securityFeatures.map((feature, index) => (
                    <Card
                      key={index}
                      style={{
                        padding: "16px",
                        border: "1px solid #E1DFDD",
                        backgroundColor: "#FAFAFA",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <div style={{ marginTop: "2px" }}>{feature.icon}</div>
                        <div>
                          <Text
                            size={400}
                            weight="semibold"
                            style={{ display: "block", marginBottom: "4px" }}
                          >
                            {feature.title}
                          </Text>
                          <Text
                            size={300}
                            style={{ color: "#605E5C", lineHeight: "1.5" }}
                          >
                            {feature.description}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card
                  style={{
                    padding: "20px",
                    backgroundColor: "#FFF4E6",
                    border: "2px solid #F7E600",
                  }}
                >
                  <Text
                    size={400}
                    weight="semibold"
                    style={{ display: "block", marginBottom: "12px" }}
                  >
                    🏢 Perfect for Business Environments
                  </Text>
                  <Text
                    size={300}
                    style={{ lineHeight: "1.6", color: "#323130" }}
                  >
                    Samara AI is designed for business and enterprise
                    environments with strict compliance requirements:
                  </Text>
                  <ul style={{ margin: "12px 0 0 20px", padding: 0 }}>
                    <li style={{ marginBottom: "4px" }}>
                      <Text size={300}>
                        ✅ <strong>No data exfiltration</strong> - everything
                        stays in your Microsoft tenant
                      </Text>
                    </li>
                    <li style={{ marginBottom: "4px" }}>
                      <Text size={300}>
                        ✅ <strong>Audit compliance</strong> - full activity
                        logging through Microsoft Graph
                      </Text>
                    </li>
                    <li style={{ marginBottom: "4px" }}>
                      <Text size={300}>
                        ✅ <strong>Zero third-party storage</strong> - no
                        external databases or file systems
                      </Text>
                    </li>
                    <li style={{ marginBottom: "4px" }}>
                      <Text size={300}>
                        ✅ <strong>Microsoft security standards</strong> -
                        inherits your organization's policies
                      </Text>
                    </li>
                  </ul>
                </Card>

                <Divider style={{ margin: "24px 0" }} />

                <div style={{ textAlign: "center" }}>
                  <Text size={300} style={{ color: "#605E5C" }}>
                    Questions about our security practices?
                  </Text>
                  <br />
                  <Text size={300} style={{ color: "#667eea" }}>
                    📧 Contact us at: <strong>security@samara-ai.com</strong>
                  </Text>
                </div>
              </motion.div>
            )}
          </div>
        </DialogContent>

        <DialogActions style={{ padding: "16px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                appearance="subtle"
                onClick={onClose}
                icon={<DismissRegular />}
              >
                Cancel
              </Button>
            </div>

            <Button
              appearance="primary"
              onClick={onProceedToSignIn}
              icon={<PersonRegular />}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                padding: "12px 24px",
              }}
            >
              I Understand - Sign In with Microsoft
            </Button>
          </div>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};
