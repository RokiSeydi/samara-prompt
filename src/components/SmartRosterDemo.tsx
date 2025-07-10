import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Button,
  Badge,
  Spinner,
  ProgressBar,
} from "@fluentui/react-components";
import {
  AlertRegular,
  CheckmarkCircleRegular,
  WarningRegular,
  FlashRegular,
  PersonRegular,
  VehicleBusRegular,
  CalendarRegular,
  ClockRegular,
  ChartMultipleRegular,
  DocumentRegular,
  EditRegular,
  EyeRegular,
} from "@fluentui/react-icons";
import { motion } from "framer-motion";
import { smartRosterOptimizer } from "../services/smartRosterOptimizer";

type DemoStep = "overview" | "excel_loaded" | "applying_change" | "optimizing" | "results";

interface OptimizationState {
  step: DemoStep;
  trigger?: string;
  results?: any;
  progress: number;
}

const SmartRosterDemo: React.FC = () => {
  const [state, setState] = useState<OptimizationState>({
    step: "overview",
    progress: 0
  });
  const [selectedChange, setSelectedChange] = useState<string>("");

  // Simulate loading Excel file on component mount
  useEffect(() => {
    if (state.step === "overview") {
      setTimeout(() => {
        setState(prev => ({ ...prev, step: "excel_loaded" }));
      }, 2000);
    }
  }, [state.step]);

  const handleApplyChange = async (changeType: string, entityId: string, description: string) => {
    setSelectedChange(description);
    setState(prev => ({ ...prev, step: "applying_change", trigger: description, progress: 0 }));

    // Simulate applying the change
    setTimeout(() => {
      setState(prev => ({ ...prev, step: "optimizing", progress: 25 }));
    }, 1000);

    // Simulate optimization progress
    const progressInterval = setInterval(() => {
      setState(prev => {
        const newProgress = Math.min(prev.progress + 15, 90);
        return { ...prev, progress: newProgress };
      });
    }, 300);

    // Complete optimization
    setTimeout(async () => {
      clearInterval(progressInterval);
      setState(prev => ({ ...prev, progress: 100 }));
      
      // Get optimization results
      const optimization = await smartRosterOptimizer.applyChange(changeType, entityId);
      const results = smartRosterOptimizer.generateWorkflowResults(optimization, description);
      
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          step: "results", 
          results: { optimization, workflowResults: results },
          progress: 100 
        }));
      }, 1000);
    }, 3000);
  };

  const resetDemo = () => {
    setState({ step: "overview", progress: 0 });
    setSelectedChange("");
  };

  if (state.step === "overview") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Card style={{
          padding: "40px",
          maxWidth: "600px",
          textAlign: "center",
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
        }}>
          <VehicleBusRegular style={{ fontSize: "80px", color: "#0078D4", marginBottom: "20px" }} />
          <Text style={{ fontSize: "28px", fontWeight: 600, color: "#323130", display: "block", marginBottom: "15px" }}>
            Smart Roster Optimizer
          </Text>
          <Text style={{ fontSize: "16px", color: "#605E5C", lineHeight: "1.6", marginBottom: "30px" }}>
            Loading your current roster from <strong>transport_roster_2025.xlsx</strong>
            <br />
            Analyzing driver schedules, vehicle allocations, and route assignments...
          </Text>
          <Spinner size="large" />
          <Text style={{ fontSize: "14px", color: "#8A8886", marginTop: "15px" }}>
            Connected to Excel via Microsoft Graph API
          </Text>
        </Card>
      </div>
    );
  }

  if (state.step === "excel_loaded") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)",
        padding: "20px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", color: "white" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <CheckmarkCircleRegular style={{
              fontSize: "60px",
              color: "#107C10",
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: "50%",
              padding: "15px",
              marginBottom: "20px"
            }} />
            <Text style={{ fontSize: "28px", fontWeight: 300, display: "block", marginBottom: "10px" }}>
              Roster Loaded Successfully
            </Text>
            <Text style={{ fontSize: "16px", opacity: 0.9, display: "block", marginBottom: "30px" }}>
              Current roster shows <strong>8 drivers</strong>, <strong>8 vehicles</strong>, and <strong>5 active routes</strong>
              <br />
              3 conflicts detected requiring immediate attention
            </Text>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
            <Card style={{ padding: "30px", backgroundColor: "rgba(255,255,255,0.95)" }}>
              <Text style={{ fontSize: "20px", fontWeight: 600, color: "#323130", marginBottom: "20px", display: "block" }}>
                📊 Current Status
              </Text>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f3f2f1", borderRadius: "8px" }}>
                  <Text style={{ fontSize: "24px", fontWeight: 600, color: "#107C10", display: "block" }}>5</Text>
                  <Text style={{ fontSize: "12px", color: "#605E5C" }}>Routes Covered</Text>
                </div>
                <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#fff4ce", borderRadius: "8px" }}>
                  <Text style={{ fontSize: "24px", fontWeight: 600, color: "#D83B01", display: "block" }}>3</Text>
                  <Text style={{ fontSize: "12px", color: "#605E5C" }}>Conflicts</Text>
                </div>
                <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f3f2f1", borderRadius: "8px" }}>
                  <Text style={{ fontSize: "24px", fontWeight: 600, color: "#0078D4", display: "block" }}>89%</Text>
                  <Text style={{ fontSize: "12px", color: "#605E5C" }}>Efficiency</Text>
                </div>
                <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f3f2f1", borderRadius: "8px" }}>
                  <Text style={{ fontSize: "24px", fontWeight: 600, color: "#0078D4", display: "block" }}>£890</Text>
                  <Text style={{ fontSize: "12px", color: "#605E5C" }}>Daily Cost</Text>
                </div>
              </div>
            </Card>

            <Card style={{ padding: "30px", backgroundColor: "rgba(255,255,255,0.95)" }}>
              <Text style={{ fontSize: "20px", fontWeight: 600, color: "#323130", marginBottom: "20px", display: "block" }}>
                ⚠️ Detected Issues
              </Text>
              <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fdf2f2", borderRadius: "6px", borderLeft: "4px solid #D83B01" }}>
                <Text style={{ fontSize: "14px", fontWeight: 600, color: "#D83B01", display: "block" }}>
                  Driver D005 (David Chen) - Called in sick
                </Text>
                <Text style={{ fontSize: "12px", color: "#605E5C" }}>
                  Assigned to Route 67 (14:00-22:00) - High priority route
                </Text>
              </div>
              <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fff4ce", borderRadius: "6px", borderLeft: "4px solid #F7B900" }}>
                <Text style={{ fontSize: "14px", fontWeight: 600, color: "#8A6914", display: "block" }}>
                  Vehicle V004 - Emergency maintenance
                </Text>
                <Text style={{ fontSize: "12px", color: "#605E5C" }}>
                  Assigned to Route 23 (08:00-16:00) - No backup allocated
                </Text>
              </div>
              <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fff4ce", borderRadius: "6px", borderLeft: "4px solid #F7B900" }}>
                <Text style={{ fontSize: "14px", fontWeight: 600, color: "#8A6914", display: "block" }}>
                  Vehicle V002 - Double booked
                </Text>
                <Text style={{ fontSize: "12px", color: "#605E5C" }}>
                  Scheduled for Route 45 and Route 89 simultaneously
                </Text>
              </div>
            </Card>
          </div>

          <Card style={{ padding: "30px", backgroundColor: "rgba(255,255,255,0.95)" }}>
            <Text style={{ fontSize: "20px", fontWeight: 600, color: "#323130", marginBottom: "20px", display: "block" }}>
              🚨 Simulate Last-Minute Changes
            </Text>
            <Text style={{ fontSize: "14px", color: "#605E5C", marginBottom: "25px" }}>
              Click any scenario below to see how the Smart Roster Optimizer automatically resolves conflicts and rebalances the entire operation in real-time.
            </Text>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <Card 
                style={{
                  padding: "20px",
                  textAlign: "center",
                  border: "2px solid #f3f2f1",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  ":hover": { borderColor: "#0078D4", transform: "scale(1.02)" }
                }}
                onClick={() => handleApplyChange("driver_sick", "D005", "Driver David Chen called in sick")}
              >
                <PersonRegular style={{ fontSize: "32px", color: "#D83B01", marginBottom: "10px" }} />
                <Text style={{ fontSize: "16px", fontWeight: 600, color: "#323130", display: "block", marginBottom: "8px" }}>
                  Driver Called Sick
                </Text>
                <Text style={{ fontSize: "12px", color: "#605E5C" }}>
                  David Chen unavailable for Route 67 evening shift
                </Text>
              </Card>

              <Card 
                style={{
                  padding: "20px",
                  textAlign: "center",
                  border: "2px solid #f3f2f1",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  ":hover": { borderColor: "#0078D4", transform: "scale(1.02)" }
                }}
                onClick={() => handleApplyChange("vehicle_maintenance", "V004", "Vehicle V004 emergency maintenance")}
              >
                <VehicleBusRegular style={{ fontSize: "32px", color: "#F7B900", marginBottom: "10px" }} />
                <Text style={{ fontSize: "16px", fontWeight: 600, color: "#323130", display: "block", marginBottom: "8px" }}>
                  Vehicle Breakdown
                </Text>
                <Text style={{ fontSize: "12px", color: "#605E5C" }}>
                  Single Decker V004 needs immediate maintenance
                </Text>
              </Card>

              <Card 
                style={{
                  padding: "20px",
                  textAlign: "center",
                  border: "2px solid #f3f2f1",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  ":hover": { borderColor: "#0078D4", transform: "scale(1.02)" }
                }}
                onClick={() => handleApplyChange("route_cancelled", "R008", "Route 78 weekend service cancelled")}
              >
                <CalendarRegular style={{ fontSize: "32px", color: "#0078D4", marginBottom: "10px" }} />
                <Text style={{ fontSize: "16px", fontWeight: 600, color: "#323130", display: "block", marginBottom: "8px" }}>
                  Route Cancelled
                </Text>
                <Text style={{ fontSize: "12px", color: "#605E5C" }}>
                  Weekend service Route 78 suspended due to roadworks
                </Text>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (state.step === "applying_change" || state.step === "optimizing") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Card style={{
          padding: "50px",
          maxWidth: "700px",
          textAlign: "center",
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <FlashRegular style={{ fontSize: "80px", color: "#0078D4", marginBottom: "30px" }} />
          </motion.div>
          
          <Text style={{ fontSize: "24px", fontWeight: 600, color: "#323130", display: "block", marginBottom: "15px" }}>
            Smart Optimization in Progress
          </Text>
          <Text style={{ fontSize: "16px", color: "#605E5C", lineHeight: "1.6", marginBottom: "30px" }}>
            <strong>Change Applied:</strong> {selectedChange}
            <br />
            Analyzing conflicts, reassigning resources, and optimizing routes...
          </Text>

          <ProgressBar value={state.progress} max={100} style={{ width: "100%", height: "8px", marginBottom: "20px" }} />
          <Text style={{ fontSize: "16px", fontWeight: 500, color: "#0078D4" }}>
            {state.progress}% Complete
          </Text>

          <div style={{ marginTop: "30px", textAlign: "left" }}>
            <div style={{ marginBottom: "10px", opacity: state.progress > 20 ? 1 : 0.3, transition: "opacity 0.5s" }}>
              <Text style={{ fontSize: "14px", color: state.progress > 20 ? "#107C10" : "#8A8886" }}>
                ✓ Detecting conflicts and resource overlaps
              </Text>
            </div>
            <div style={{ marginBottom: "10px", opacity: state.progress > 40 ? 1 : 0.3, transition: "opacity 0.5s" }}>
              <Text style={{ fontSize: "14px", color: state.progress > 40 ? "#107C10" : "#8A8886" }}>
                ✓ Finding optimal driver and vehicle reassignments
              </Text>
            </div>
            <div style={{ marginBottom: "10px", opacity: state.progress > 60 ? 1 : 0.3, transition: "opacity 0.5s" }}>
              <Text style={{ fontSize: "14px", color: state.progress > 60 ? "#107C10" : "#8A8886" }}>
                ✓ Calculating cost implications and efficiency gains
              </Text>
            </div>
            <div style={{ marginBottom: "10px", opacity: state.progress > 80 ? 1 : 0.3, transition: "opacity 0.5s" }}>
              <Text style={{ fontSize: "14px", color: state.progress > 80 ? "#107C10" : "#8A8886" }}>
                ✓ Generating optimized schedule and recommendations
              </Text>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (state.step === "results" && state.results) {
    const { optimization, workflowResults } = state.results;
    
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)",
        padding: "20px",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", color: "white" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <CheckmarkCircleRegular style={{
              fontSize: "60px",
              color: "#107C10",
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: "50%",
              padding: "15px",
              marginBottom: "20px"
            }} />
            <Text style={{ fontSize: "28px", fontWeight: 300, display: "block", marginBottom: "10px" }}>
              Optimization Complete!
            </Text>
            <Text style={{ fontSize: "16px", opacity: 0.9, display: "block", marginBottom: "20px" }}>
              <strong>{selectedChange}</strong> - Roster automatically rebalanced in under 30 seconds
            </Text>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "25px" }}>
              <div style={{ textAlign: "center" }}>
                <Text style={{ fontSize: "32px", fontWeight: 600, color: "#107C10", display: "block" }}>
                  £{optimization.savings.toFixed(0)}
                </Text>
                <Text style={{ fontSize: "14px", opacity: 0.8 }}>Cost Savings</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Text style={{ fontSize: "32px", fontWeight: 600, color: "#FFFFFF", display: "block" }}>
                  {optimization.coverage.toFixed(0)}%
                </Text>
                <Text style={{ fontSize: "14px", opacity: 0.8 }}>Route Coverage</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Text style={{ fontSize: "32px", fontWeight: 600, color: "#FFD700", display: "block" }}>
                  {optimization.changes.length}
                </Text>
                <Text style={{ fontSize: "14px", opacity: 0.8 }}>Smart Changes</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Text style={{ fontSize: "32px", fontWeight: 600, color: "#87CEEB", display: "block" }}>
                  30s
                </Text>
                <Text style={{ fontSize: "14px", opacity: 0.8 }}>Processing Time</Text>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "25px", marginBottom: "30px" }}>
            {workflowResults.map((result: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card style={{
                  padding: "25px",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  <div style={{ marginBottom: "15px" }}>
                    <Badge
                      appearance="filled"
                      color={result.app === "Excel" ? "success" : result.app === "Analysis" ? "warning" : "brand"}
                      style={{ marginBottom: "10px" }}
                    >
                      {result.app}
                    </Badge>
                    <Text style={{ fontSize: "18px", fontWeight: 600, color: "#323130", display: "block", marginBottom: "8px" }}>
                      {result.title}
                    </Text>
                    <Text style={{ fontSize: "14px", color: "#605E5C", lineHeight: "1.4" }}>
                      {result.description}
                    </Text>
                  </div>

                  {result.data && (
                    <div style={{ marginBottom: "20px", flex: 1 }}>
                      {result.app === "Excel" && result.data.changes && (
                        <div>
                          <Text style={{ fontSize: "14px", fontWeight: 600, color: "#323130", marginBottom: "10px", display: "block" }}>
                            Key Changes:
                          </Text>
                          {result.data.changes.slice(0, 2).map((change: any, i: number) => (
                            <div key={i} style={{ 
                              marginBottom: "8px", 
                              padding: "8px", 
                              backgroundColor: "#f8f9fa", 
                              borderRadius: "4px",
                              fontSize: "12px",
                              color: "#323130"
                            }}>
                              <strong>{change.type.replace('_', ' ')}:</strong> {change.reason}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {result.app === "Analysis" && result.data.conflicts && (
                        <div>
                          <Text style={{ fontSize: "14px", fontWeight: 600, color: "#323130", marginBottom: "10px", display: "block" }}>
                            Conflicts Resolved:
                          </Text>
                          {result.data.conflicts.slice(0, 2).map((conflict: any, i: number) => (
                            <div key={i} style={{ 
                              marginBottom: "8px", 
                              padding: "8px", 
                              backgroundColor: conflict.severity === 'critical' ? '#fdf2f2' : '#fff8e1', 
                              borderRadius: "4px",
                              fontSize: "12px",
                              color: "#323130"
                            }}>
                              <strong>{conflict.severity.toUpperCase()}:</strong> {conflict.description}
                            </div>
                          ))}
                        </div>
                      )}

                      {result.app === "Analytics" && result.data.cost_analysis && (
                        <div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#f3f2f1", borderRadius: "6px" }}>
                              <Text style={{ fontSize: "16px", fontWeight: 600, color: "#107C10", display: "block" }}>
                                {result.data.cost_analysis.savings}
                              </Text>
                              <Text style={{ fontSize: "11px", color: "#605E5C" }}>Daily Savings</Text>
                            </div>
                            <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#e6f7ff", borderRadius: "6px" }}>
                              <Text style={{ fontSize: "16px", fontWeight: 600, color: "#0078D4", display: "block" }}>
                                {result.data.cost_analysis.efficiency_gain}
                              </Text>
                              <Text style={{ fontSize: "11px", color: "#605E5C" }}>Efficiency Gain</Text>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {result.quickActions && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {result.quickActions.map((action: any, i: number) => (
                        <Button
                          key={i}
                          size="small"
                          appearance={action.primary ? "primary" : "outline"}
                          onClick={action.action}
                          style={{ flex: action.primary ? "1" : "auto", fontSize: "12px" }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <Button
              appearance="primary"
              size="large"
              onClick={resetDemo}
              style={{ marginRight: "15px", padding: "12px 30px" }}
            >
              <FlashRegular style={{ marginRight: "8px" }} />
              Try Another Change
            </Button>
            <Button 
              size="large" 
              onClick={() => window.location.href = "/"}
              style={{ padding: "12px 30px" }}
            >
              Back to SAMARA
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SmartRosterDemo;
