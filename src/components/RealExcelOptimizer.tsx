import React, { useState, useRef } from 'react';
import {
  Card,
  Text,
  Button,
  Spinner,
  ProgressBar,
  MessageBar,
  Input,
  Badge,
  Divider,
} from '@fluentui/react-components';
import {
  ArrowUploadRegular,
  ArrowDownloadRegular,
  CheckmarkCircleRegular,
  AlertRegular,
  SparkleRegular,
  PersonRegular,
  VehicleCarRegular,
  RouterFilled,
  SendRegular,
  WarningRegular,
  ShieldCheckmarkRegular,
  ClockRegular,
} from '@fluentui/react-icons';
import { RealExcelProcessor } from '../services/realExcelProcessor';

const realExcelProcessor = RealExcelProcessor.getInstance();

interface FileUploadState {
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  fileName?: string;
}

interface OptimizationState {
  processing: boolean;
  progress: number;
  completed: boolean;
  result?: any;
  error?: string;
}

interface ComplianceIssue {
  type: 'hours_exceeded' | 'license_mismatch' | 'unavailable_resource' | 'schedule_conflict';
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}

export const RealExcelOptimizer: React.FC = () => {
  console.log('🚀 RealExcelOptimizer component is loading!');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileState, setFileState] = useState<FileUploadState>({
    uploading: false,
    uploaded: false,
  });
  const [optimizationState, setOptimizationState] = useState<OptimizationState>({
    processing: false,
    progress: 0,
    completed: false,
  });
  const [parsedData, setParsedData] = useState<any>(null);
  const [userCommand, setUserCommand] = useState('');
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const checkCompliance = (optimizationResult: any) => {
    const issues: ComplianceIssue[] = [];
    
    // Check driver hour violations (STRICT 8-hour enforcement)
    optimizationResult.optimizedData.drivers.forEach((driver: any) => {
      if (driver.currentHours > 8.0) {
        issues.push({
          type: 'hours_exceeded',
          severity: 'high',
          description: `${driver.name} assigned ${driver.currentHours.toFixed(1)} hours (exceeds 8-hour limit)`,
          suggestion: `URGENT: Reduce ${driver.name}'s shift or redistribute to other drivers`
        });
      } else if (driver.currentHours > 7.5) {
        issues.push({
          type: 'hours_exceeded',
          severity: 'medium',
          description: `${driver.name} assigned ${driver.currentHours.toFixed(1)} hours (approaching 8-hour limit)`,
          suggestion: `Consider monitoring ${driver.name}'s workload closely`
        });
      }
    });

    // Check license mismatches
    optimizationResult.optimizedData.routes.forEach((route: any) => {
      const assignedDriver = optimizationResult.optimizedData.drivers.find((d: any) => d.route === route.id);
      if (assignedDriver && route.required_license && assignedDriver.licenseType !== route.required_license) {
        issues.push({
          type: 'license_mismatch',
          severity: 'high',
          description: `${assignedDriver.name} (${assignedDriver.licenseType}) assigned to route requiring ${route.required_license}`,
          suggestion: `Reassign to driver with ${route.required_license} license`
        });
      }
    });

    // Check vehicle capacity vs route requirements
    optimizationResult.optimizedData.routes.forEach((route: any) => {
      const assignedDriver = optimizationResult.optimizedData.drivers.find((d: any) => d.route === route.id);
      if (assignedDriver && assignedDriver.vehicle) {
        const assignedVehicle = optimizationResult.optimizedData.vehicles.find((v: any) => v.id === assignedDriver.vehicle);
        if (assignedVehicle && route.passenger_capacity_needed > assignedVehicle.capacity) {
          issues.push({
            type: 'unavailable_resource',
            severity: 'medium',
            description: `Route ${route.name} needs ${route.passenger_capacity_needed} passengers but vehicle ${assignedVehicle.id} only has ${assignedVehicle.capacity} capacity`,
            suggestion: `Assign larger vehicle or split route`
          });
        }
      }
    });

    // Check for unassigned routes
    const unassignedRoutes = optimizationResult.optimizedData.routes.filter((route: any) =>
      !optimizationResult.optimizedData.drivers.some((d: any) => d.route === route.id)
    );
    
    if (unassignedRoutes.length > 0) {
      issues.push({
        type: 'unavailable_resource',
        severity: 'high',
        description: `${unassignedRoutes.length} routes remain unassigned`,
        suggestion: 'Consider hiring additional drivers or adjusting route schedules'
      });
    }

    // Calculate compliance score
    const totalDrivers = optimizationResult.optimizedData.drivers.length;
    const compliantDrivers = optimizationResult.optimizedData.drivers.filter((d: any) => d.currentHours <= 8.0).length;
    const totalRoutes = optimizationResult.optimizedData.routes.length;
    const assignedRoutes = totalRoutes - unassignedRoutes.length;
    
    const driverComplianceRate = totalDrivers > 0 ? (compliantDrivers / totalDrivers) * 100 : 100;
    const routeCompletionRate = totalRoutes > 0 ? (assignedRoutes / totalRoutes) * 100 : 100;
    const overallScore = Math.round((driverComplianceRate * 0.7 + routeCompletionRate * 0.3));

    return {
      issues,
      isCompliant: issues.filter(i => i.severity === 'high').length === 0,
      score: Math.max(0, overallScore),
      driverComplianceRate: Math.round(driverComplianceRate),
      routeCompletionRate: Math.round(routeCompletionRate)
    };
  };

  const handleSampleFileDownload = () => {
    const sampleUrl = '/sample_transportation_roster.xlsx';
    const link = document.createElement('a');
    link.href = sampleUrl;
    link.download = 'sample_transportation_roster.xlsx';
    link.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
      setFileState({
        uploading: false,
        uploaded: false,
        error: 'Please upload an Excel file (.xlsx or .xls)',
      });
      return;
    }

    setFileState({
      uploading: true,
      uploaded: false,
      fileName: file.name,
    });

    try {
      const data = await realExcelProcessor.parseExcelFile(file);
      setParsedData(data);
      setFileState({
        uploading: false,
        uploaded: true,
        fileName: file.name,
      });
    } catch (error) {
      setFileState({
        uploading: false,
        uploaded: false,
        error: error instanceof Error ? error.message : 'Failed to parse Excel file',
      });
    }
  };

  const handleOptimizeRoster = async () => {
    if (!parsedData) return;

    setOptimizationState({
      processing: true,
      progress: 0,
      completed: false,
    });

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setOptimizationState(prev => ({ ...prev, progress: i }));
      }

      // Apply compliance constraints before optimization
      const complianceConstraints = {
        maxDailyHours: 8,
        maxWeeklyHours: 48,
        minBreakBetweenShifts: 10, // hours
        enforceOvertime: true,
        checkLicenseRequirements: true,
        validateVehicleCapacity: true,
      };

      const result = await realExcelProcessor.optimizeRoster(
        parsedData.drivers,
        parsedData.vehicles,
        parsedData.routes
      );

      // Check for compliance issues
      const compliance = checkCompliance(result);
      setComplianceIssues(compliance.issues);

      setOptimizationState({
        processing: false,
        progress: 100,
        completed: true,
        result: {
          ...result,
          compliance: compliance,
        },
      });
    } catch (error) {
      setOptimizationState({
        processing: false,
        progress: 0,
        completed: false,
        error: error instanceof Error ? error.message : 'Optimization failed',
      });
    }
  };

  const handleDownloadOptimized = () => {
    if (!optimizationState.result) return;
    
    try {
      const blob = realExcelProcessor.exportToExcel(optimizationState.result);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `optimized_roster_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleCommandSubmit = async () => {
    if (!userCommand.trim() || !optimizationState.result) return;

    const command = userCommand.trim();
    setCommandHistory(prev => [...prev, command]);
    setUserCommand('');

    // Show processing state
    setOptimizationState(prev => ({
      ...prev,
      processing: true,
      progress: 0,
    }));

    try {
      // Apply the command changes using the real Excel processor
      const updatedResult = await realExcelProcessor.applyCommandChanges(command, optimizationState.result);
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setOptimizationState(prev => ({ ...prev, progress: i }));
      }
      
      // Check for compliance issues in updated result
      const compliance = checkCompliance(updatedResult);
      setComplianceIssues(compliance.issues);

      setOptimizationState({
        processing: false,
        progress: 100,
        completed: true,
        result: {
          ...updatedResult,
          compliance: compliance,
        },
      });

    } catch (error) {
      setOptimizationState(prev => ({
        ...prev,
        processing: false,
        error: error instanceof Error ? error.message : 'Command processing failed',
      }));
    }
  };

  // Function removed - now using realExcelProcessor.applyCommandChanges

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <SparkleRegular style={{ fontSize: '48px', color: '#0078D4', marginBottom: '16px' }} />
        <Text style={{ fontSize: '32px', fontWeight: 700, color: '#323130', display: 'block', marginBottom: '8px' }}>
          SAMARA Excel Optimizer
        </Text>
        <Text style={{ fontSize: '18px', color: '#605E5C', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
          Upload your transportation roster Excel file to optimize driver assignments, vehicle allocation, and route scheduling with AI-powered insights.
        </Text>
      </div>

      {/* Getting Started */}
      {!fileState.uploaded && (
        <Card style={{ padding: '24px', marginBottom: '24px', backgroundColor: '#f3f9fd' }}>
          <Text style={{ fontSize: '20px', fontWeight: 600, color: '#0078D4', marginBottom: '16px', display: 'block' }}>
            🚀 Getting Started
          </Text>
          <Text style={{ marginBottom: '16px', display: 'block' }}>
            Need a sample file to try out the optimizer? Download our sample transportation roster with realistic data:
          </Text>
          <Button appearance="outline" onClick={handleSampleFileDownload} style={{ marginBottom: '16px' }}>
            <ArrowDownloadRegular style={{ marginRight: '8px' }} />
            Download Sample Excel File
          </Button>
          <Text style={{ fontSize: '14px', color: '#666', display: 'block' }}>
            The sample file contains 25 drivers, 20 vehicles, and 15 routes with realistic transportation data.
          </Text>
        </Card>
      )}

      {/* File Upload */}
      <Card style={{ padding: '30px', marginBottom: '20px' }}>
        <Text style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', display: 'block' }}>
          📁 Upload Excel File
        </Text>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {!fileState.uploaded ? (
          <div
            style={{
              border: '2px dashed #D1D1D1',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                const event = { target: { files: [files[0]] } } as any;
                handleFileUpload(event);
              }
            }}
          >
            {fileState.uploading ? (
              <>
                <Spinner size="large" style={{ marginBottom: '16px' }} />
                <Text style={{ fontSize: '16px' }}>Uploading and parsing...</Text>
              </>
            ) : (
              <>
                <ArrowUploadRegular style={{ fontSize: '48px', color: '#0078D4', marginBottom: '16px' }} />
                <Text style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Drop your Excel file here or click to browse
                </Text>
                <Text style={{ fontSize: '14px', color: '#666' }}>
                  Supports .xlsx and .xls files
                </Text>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#f3f9fd', borderRadius: '8px', border: '1px solid #0078D4' }}>
            <CheckmarkCircleRegular style={{ fontSize: '24px', color: '#107C10', marginRight: '12px' }} />
            <div style={{ flex: 1 }}>
              <Text style={{ fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                {fileState.fileName}
              </Text>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                File uploaded successfully
              </Text>
            </div>
            <Button
              appearance="subtle"
              onClick={() => {
                setFileState({ uploading: false, uploaded: false });
                setParsedData(null);
                setOptimizationState({ processing: false, progress: 0, completed: false });
              }}
            >
              Upload Different File
            </Button>
          </div>
        )}

        {fileState.error && (
          <MessageBar intent="error" style={{ marginTop: '16px' }}>
            <AlertRegular style={{ marginRight: '8px' }} />
            {fileState.error}
          </MessageBar>
        )}
      </Card>

      {/* Data Summary */}
      {parsedData && !optimizationState.processing && !optimizationState.completed && (
        <Card style={{ padding: '20px', marginBottom: '20px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 600, color: '#0078D4', marginBottom: '15px', display: 'block' }}>
            📊 Roster Data Summary
          </Text>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '15px', backgroundColor: '#f3f9fd', borderRadius: '8px', textAlign: 'center' }}>
              <PersonRegular style={{ fontSize: '24px', color: '#0078D4', marginBottom: '8px' }} />
              <Text style={{ fontSize: '20px', fontWeight: 600, display: 'block' }}>
                {parsedData.drivers?.length || 0}
              </Text>
              <Text style={{ fontSize: '12px', color: '#666' }}>Drivers</Text>
            </div>
            
            <div style={{ padding: '15px', backgroundColor: '#f9f5ff', borderRadius: '8px', textAlign: 'center' }}>
              <VehicleCarRegular style={{ fontSize: '24px', color: '#6264A7', marginBottom: '8px' }} />
              <Text style={{ fontSize: '20px', fontWeight: 600, display: 'block' }}>
                {parsedData.vehicles?.length || 0}
              </Text>
              <Text style={{ fontSize: '12px', color: '#666' }}>Vehicles</Text>
            </div>
            
            <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
              <RouterFilled style={{ fontSize: '24px', color: '#107C10', marginBottom: '8px' }} />
              <Text style={{ fontSize: '20px', fontWeight: 600, display: 'block' }}>
                {parsedData.routes?.length || 0}
              </Text>
              <Text style={{ fontSize: '12px', color: '#666' }}>Routes</Text>
            </div>
          </div>

          <Button
            appearance="primary"
            size="large"
            onClick={handleOptimizeRoster}
            disabled={optimizationState.processing}
            style={{ width: '100%', height: '48px', fontSize: '16px', fontWeight: 600 }}
          >
            <SparkleRegular style={{ marginRight: '8px' }} />
            Optimize with SAMARA
          </Button>
        </Card>
      )}

      {/* Optimization Progress */}
      {optimizationState.processing && (
        <Card style={{ padding: '30px', textAlign: 'center' }}>
          <Spinner size="large" style={{ marginBottom: '20px' }} />
          <Text style={{ fontSize: '20px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
            Optimizing Your Roster
          </Text>
          <Text style={{ fontSize: '14px', color: '#666', marginBottom: '20px', display: 'block' }}>
            Analyzing driver assignments, vehicle allocation, and route optimization...
          </Text>
          
          <ProgressBar value={optimizationState.progress} max={100} style={{ width: '100%', marginBottom: '10px' }} />
          <Text style={{ fontSize: '14px', color: '#0078D4' }}>
            {optimizationState.progress}% Complete
          </Text>
        </Card>
      )}

      {/* Results */}
      {optimizationState.completed && optimizationState.result && (
        <div>
          {/* Compliance Dashboard */}
          <Card style={{ padding: '24px', marginBottom: '20px', backgroundColor: optimizationState.result.compliance?.isCompliant ? '#f3f9fd' : '#fff4f4' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              {optimizationState.result.compliance?.isCompliant ? (
                <ShieldCheckmarkRegular style={{ fontSize: '32px', color: '#107C10', marginRight: '12px' }} />
              ) : (
                <WarningRegular style={{ fontSize: '32px', color: '#D13438', marginRight: '12px' }} />
              )}
              <div>
                <Text style={{ fontSize: '24px', fontWeight: 600, color: optimizationState.result.compliance?.isCompliant ? '#107C10' : '#D13438', display: 'block' }}>
                  {optimizationState.result.compliance?.isCompliant ? 'Fully Compliant' : 'Compliance Issues Detected'}
                </Text>
                <Text style={{ fontSize: '14px', color: '#666' }}>
                  Compliance Score: {optimizationState.result.compliance?.score || 0}/100
                </Text>
              </div>
            </div>

            {complianceIssues.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Issues to Address:
                </Text>
                {complianceIssues.map((issue, index) => (
                  <MessageBar 
                    key={index} 
                    intent={issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'info'}
                    style={{ marginBottom: '8px' }}
                  >
                    <div>
                      <Text style={{ fontWeight: 600, display: 'block' }}>{issue.description}</Text>
                      <Text style={{ fontSize: '12px', color: '#666' }}>{issue.suggestion}</Text>
                    </div>
                  </MessageBar>
                ))}
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <ClockRegular style={{ fontSize: '20px', color: '#0078D4', marginBottom: '4px' }} />
                <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>Max Daily Hours</Text>
                <Text style={{ fontSize: '16px', fontWeight: 600 }}>8 hours</Text>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <PersonRegular style={{ fontSize: '20px', color: '#107C10', marginBottom: '4px' }} />
                <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>Drivers Compliant</Text>
                <Text style={{ fontSize: '16px', fontWeight: 600 }}>
                  {optimizationState.result.optimizedData.drivers.filter((d: any) => d.currentHours <= 8).length}/
                  {optimizationState.result.optimizedData.drivers.length}
                  <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>
                    ({optimizationState.result.compliance?.driverComplianceRate || 0}%)
                  </Text>
                </Text>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <RouterFilled style={{ fontSize: '20px', color: '#6264A7', marginBottom: '4px' }} />
                <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>Routes Assigned</Text>
                <Text style={{ fontSize: '16px', fontWeight: 600 }}>
                  {optimizationState.result.optimizedData.routes.filter((r: any) => 
                    optimizationState.result.optimizedData.drivers.some((d: any) => d.route === r.id)
                  ).length}/
                  {optimizationState.result.optimizedData.routes.length}
                  <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>
                    ({optimizationState.result.compliance?.routeCompletionRate || 0}%)
                  </Text>
                </Text>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <ShieldCheckmarkRegular style={{ fontSize: '20px', color: '#6264A7', marginBottom: '4px' }} />
                <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>Overall Score</Text>
                <Text style={{ fontSize: '16px', fontWeight: 600, color: 
                  (optimizationState.result.compliance?.score || 0) >= 90 ? '#107C10' : 
                  (optimizationState.result.compliance?.score || 0) >= 70 ? '#F7630C' : '#D13438' 
                }}>
                  {optimizationState.result.compliance?.score || 0}/100
                </Text>
              </div>
            </div>
          </Card>

          {/* AI Command Interface */}
          <Card style={{ padding: '24px', marginBottom: '20px' }}>
            <Text style={{ fontSize: '20px', fontWeight: 600, color: '#0078D4', marginBottom: '16px', display: 'block' }}>
              🤖 Make Changes with AI
            </Text>
            <Text style={{ fontSize: '14px', color: '#666', marginBottom: '16px', display: 'block' }}>
              Tell me what changes you need and I'll update the optimization accordingly:
            </Text>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Input
                value={userCommand}
                onChange={(e) => setUserCommand(e.target.value)}
                placeholder="e.g., 'Mark John Smith as sick' or 'Bus V003 is in maintenance'"
                style={{ flex: 1 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCommandSubmit();
                  }
                }}
              />
              <Button
                appearance="primary"
                onClick={handleCommandSubmit}
                disabled={!userCommand.trim() || optimizationState.processing}
              >
                <SendRegular style={{ marginRight: '8px' }} />
                Apply
              </Button>
            </div>

            {/* Command Examples */}
            <div style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                Quick Commands:
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'Mark John Smith as sick',
                  'Bus V003 is in maintenance', 
                  'Reduce Maria Garcia hours',
                  'Prioritize school routes',
                  'Mark Driver D001 unavailable'
                ].map((example, index) => (
                  <Badge 
                    key={index} 
                    style={{ margin: '4px', cursor: 'pointer' }} 
                    color={index % 2 === 0 ? 'brand' : 'success'}
                    onClick={() => setUserCommand(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Command History */}
            {commandHistory.length > 0 && (
              <div>
                <Text style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                  Recent Changes:
                </Text>
                <div style={{ maxHeight: '100px', overflowY: 'auto', backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
                  {commandHistory.slice(-5).map((cmd, index) => (
                    <Text key={index} style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                      ✓ {cmd}
                    </Text>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Original Results Card */}
          <Card style={{ padding: '24px', marginBottom: '20px', backgroundColor: '#f3f9fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <CheckmarkCircleRegular style={{ fontSize: '32px', color: '#107C10', marginRight: '12px' }} />
              <div>
                <Text style={{ fontSize: '24px', fontWeight: 600, color: '#107C10', display: 'block' }}>
                  Optimization Complete!
                </Text>
                <Text style={{ fontSize: '14px', color: '#666' }}>
                  Your roster has been optimized for maximum efficiency
                </Text>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '24px', fontWeight: 600, color: '#107C10', display: 'block' }}>
                  ${optimizationState.result.metrics.cost_savings.toFixed(0)}
                </Text>
                <Text style={{ fontSize: '14px', color: '#666' }}>Cost Savings</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '24px', fontWeight: 600, color: '#0078D4', display: 'block' }}>
                  {optimizationState.result.metrics.efficiency_improvement.toFixed(1)}%
                </Text>
                <Text style={{ fontSize: '14px', color: '#666' }}>Efficiency Gain</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '24px', fontWeight: 600, color: '#6264A7', display: 'block' }}>
                  {optimizationState.result.metrics.conflicts_resolved}
                </Text>
                <Text style={{ fontSize: '14px', color: '#666' }}>Conflicts Resolved</Text>
              </div>
            </div>

            <Button
              appearance="primary"
              size="large"
              onClick={handleDownloadOptimized}
              style={{ width: '100%', height: '48px', fontSize: '16px', fontWeight: 600 }}
            >
              <ArrowDownloadRegular style={{ marginRight: '8px' }} />
              Download Optimized Roster
            </Button>
          </Card>
        </div>
      )}

      {/* Errors */}
      {optimizationState.error && (
        <MessageBar intent="error">
          <AlertRegular style={{ marginRight: '8px' }} />
          {optimizationState.error}
        </MessageBar>
      )}
    </div>
  );
};

export default RealExcelOptimizer;
