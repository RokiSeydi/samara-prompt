import React, { useState } from 'react';
import {
  Card,
  Text,
  Button,
  Badge,
  ProgressBar,
  Textarea,
  Checkbox,
  Radio,
  RadioGroup,
  Input,
  Spinner,
} from '@fluentui/react-components';
import {
  VehicleSubwayRegular,
  LocationRegular,
  PeopleRegular,
  DocumentRegular,
  CheckmarkCircleRegular,
  WarningRegular,
  DismissCircleRegular,
  ClockRegular,
  ShieldCheckmarkRegular,
  FlashRegular,
  BuildingRegular,
  PhoneRegular,
  MailRegular,
  ClipboardRegular,
  PersonRunningRegular,
  CompassNorthwestRegular,
  AlertRegular,
  CalendarRegular,
} from '@fluentui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingData {
  checkFirst: string[];
  notify: string[];
  communicate: string;
  logging: string;
  reports: string[];
}

export const TransportationDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'signin' | 'onboarding' | 'processing' | 'dashboard'>('signin');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    checkFirst: [],
    notify: [],
    communicate: '',
    logging: '',
    reports: []
  });
  const [isProcessingDemo, setIsProcessingDemo] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [activeTab, setActiveTab] = useState<'tasks' | 'scenarios' | 'compliance'>('tasks');
  const [processingTime, setProcessingTime] = useState(0);

  const onboardingQuestions = [
    {
      question: "When something goes wrong, where do you usually check first?",
      type: 'checkbox' as const,
      key: 'checkFirst' as keyof OnboardingData,
      options: [
        "Real-time control systems (TRUST, RTPPM)",
        "Excel performance spreadsheets",
        "SharePoint incident logs",
        "Teams channels with depot managers",
        "Radio communications with drivers",
        "Network Rail fault reporting system"
      ]
    },
    {
      question: "Who do you usually need to notify during disruptions?",
      type: 'checkbox' as const,
      key: 'notify' as keyof OnboardingData,
      options: [
        "Control room operations team",
        "Station managers at affected locations", 
        "Onboard crew and drivers",
        "Senior operations leads",
        "Customer information teams",
        "Network Rail control",
        "Fleet maintenance depot"
      ]
    },
    {
      question: "How do you usually communicate with teams during service issues?",
      type: 'radio' as const,
      key: 'communicate' as keyof OnboardingData,
      options: [
        "Microsoft Teams messages",
        "Outlook emails",
        "Radio communication",
        "Phone calls",
        "Control room PA system"
      ]
    },
    {
      question: "Where do you usually log what happened?",
      type: 'radio' as const,
      key: 'logging' as keyof OnboardingData,
      options: [
        "SharePoint incident management system",
        "Excel delay attribution spreadsheets",
        "Word incident report templates",
        "Dedicated railway reporting software",
        "Paper logbooks (digitized later)"
      ]
    },
    {
      question: "Which reports do you need to stay compliant?",
      type: 'checkbox' as const,
      key: 'reports' as keyof OnboardingData,
      options: [
        "Daily performance summary (ORR)",
        "Incident reports and root cause analysis",
        "Delay attribution reports",
        "Driver hours and fatigue monitoring",
        "Safety performance indicators",
        "Infrastructure fault reports",
        "Customer satisfaction metrics"
      ]
    }
  ];

  const handleSignIn = () => {
    setCurrentStep('onboarding');
  };

  const handleOnboardingNext = async () => {
    if (onboardingStep < onboardingQuestions.length - 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      // Start processing phase
      setCurrentStep('processing');
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      setCurrentStep('dashboard');
    }
  };

  const handleOnboardingInput = (value: string, checked?: boolean) => {
    const currentQuestion = onboardingQuestions[onboardingStep];
    
    if (currentQuestion.type === 'checkbox') {
      const currentValues = onboardingData[currentQuestion.key] as string[];
      if (checked) {
        setOnboardingData(prev => ({
          ...prev,
          [currentQuestion.key]: [...currentValues, value]
        }));
      } else {
        setOnboardingData(prev => ({
          ...prev,
          [currentQuestion.key]: currentValues.filter(v => v !== value)
        }));
      }
    } else {
      // Radio button
      setOnboardingData(prev => ({
        ...prev,
        [currentQuestion.key]: value
      }));
    }
  };

  const isOnboardingStepValid = () => {
    const currentQuestion = onboardingQuestions[onboardingStep];
    const currentValue = onboardingData[currentQuestion.key];
    
    if (currentQuestion.type === 'checkbox') {
      return (currentValue as string[]).length > 0;
    } else {
      return (currentValue as string).trim().length > 0;
    }
  };

  const handleDemoPrompt = async () => {
    setIsProcessingDemo(true);
    setShowResults(false);
    const startTime = Date.now();
    
    // Simulate processing time with more realistic delay
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const endTime = Date.now();
    setProcessingTime(endTime - startTime);
    setIsProcessingDemo(false);
    setShowResults(true);
  };

  const priorityTasks = [
    { 
      icon: <AlertRegular />, 
      text: "Signal failure at Pitsea - 6 services delayed", 
      priority: "high",
      source: "📁 SharePoint/Operations/Live-Incidents/",
      sourceType: "folder"
    },
    { 
      icon: <PersonRunningRegular />, 
      text: "Driver shortage at Southend depot - shift coverage needed", 
      priority: "high",
      source: "📊 Excel/Rosters/Driver-Schedule-Week27.xlsx",
      sourceType: "file"
    },
    { 
      icon: <PeopleRegular />, 
      text: "Driver roster approval needed for next week", 
      priority: "medium",
      source: "📊 Excel/Rosters/Weekly-Approval-Queue.xlsx",
      sourceType: "file"
    },
    { 
      icon: <DocumentRegular />, 
      text: "Monthly performance report due tomorrow", 
      priority: "high",
      source: "📄 Word/Reports/Monthly-Performance-Template.docx",
      sourceType: "file"
    },
    { 
      icon: <ClockRegular />, 
      text: "Platform 3 maintenance window - schedule with Network Rail", 
      priority: "medium",
      source: "📧 Outlook/Maintenance-Coordination/",
      sourceType: "folder"
    },
    { 
      icon: <BuildingRegular />, 
      text: "Staff room heating repair at Wickford station", 
      priority: "low",
      source: "📝 Teams/Facilities-Management/Wickford-Issues",
      sourceType: "chat"
    },
    { 
      icon: <CalendarRegular />, 
      text: "Christmas timetable changes - crew briefing required", 
      priority: "medium",
      source: "📁 SharePoint/Timetables/Christmas-2024/",
      sourceType: "folder"
    }
  ];

  const complianceStatus = [
    { 
      name: "ORR Performance submissions", 
      status: "success", 
      detail: "Submitted on time - next due 15th",
      action: "View submission history",
      source: "📁 SharePoint/Compliance/ORR-Submissions/2024/"
    },
    { 
      name: "Delay attribution reports", 
      status: "warning", 
      detail: "2 incidents pending root cause",
      action: "Complete pending reports",
      source: "📊 Excel/Delays/Attribution-Queue.xlsx"
    },
    { 
      name: "Driver hours compliance check", 
      status: "success", 
      detail: "All drivers within limits",
      action: "View detailed report",
      source: "📊 Excel/Compliance/Driver-Hours-Weekly.xlsx"
    },
    { 
      name: "Fatigue review for Driver #C112", 
      status: "error", 
      detail: "14-day review overdue",
      action: "Schedule review meeting",
      source: "📄 SharePoint/HR/Fatigue-Reviews/Driver-C112/"
    },
    { 
      name: "Station safety inspections", 
      status: "success", 
      detail: "Monthly checks completed",
      action: "View inspection reports",
      source: "📁 SharePoint/Safety/Station-Inspections/July-2024/"
    },
    { 
      name: "Rolling stock maintenance logs", 
      status: "warning", 
      detail: "Unit 321404 service due",
      action: "Schedule maintenance",
      source: "📊 Excel/Fleet/Maintenance-Schedule.xlsx"
    }
  ];

  const demoScenarios = [
    {
      id: 'signal-failure',
      title: 'Signal Failure at Pitsea',
      description: 'Signal failure reported at Pitsea Junction affecting the Southend line. Show me impacted services, get replacement crew sorted, notify all teams, and start the incident log for compliance.',
      urgency: 'high',
      icon: <AlertRegular />,
      results: [
        { 
          icon: <AlertRegular />, 
          text: "Signal failure confirmed at Pitsea Junction (Block S47)", 
          color: "#D13438",
          source: "📁 SharePoint/Operations/Live-Incidents/Pitsea-Signal-S47/"
        },
        { 
          icon: <VehicleSubwayRegular />, 
          text: "6 services impacted: 3 cancelled, 3 diverted via Benfleet", 
          color: "#0078D4",
          source: "📊 Excel/Service-Planning/Live-Service-Status.xlsx"
        },
        { 
          icon: <PersonRunningRegular />, 
          text: "Replacement crew dispatched from Shoeburyness depot (ETA 12 mins)", 
          color: "#107C10",
          source: "📊 Excel/Rosters/Emergency-Cover-Shoeburyness.xlsx"
        },
        { 
          icon: <CompassNorthwestRegular />, 
          text: "Network Rail fault team notified - estimated fix time 45 minutes", 
          color: "#0078D4",
          source: "📧 Outlook/Network-Rail/Fault-Notifications/"
        },
        { 
          icon: <PeopleRegular />, 
          text: "Station managers at Pitsea, Benfleet & Wickford notified via Teams", 
          color: "#107C10",
          source: "💬 Teams/Station-Managers/Southend-Line-Group"
        },
        { 
          icon: <PhoneRegular />, 
          text: "Control room and onboard crew alerted via radio protocol", 
          color: "#107C10",
          source: "📞 Radio/Control-Room-Channel-3"
        },
        { 
          icon: <MailRegular />, 
          text: "Passenger information emails sent to affected season ticket holders", 
          color: "#107C10",
          source: "📧 Outlook/Customer-Comms/Automated-Notifications/"
        },
        { 
          icon: <ClipboardRegular />, 
          text: "Incident report P-2024-0156 created in SharePoint", 
          color: "#107C10",
          source: "📄 SharePoint/Incident-Reports/P-2024-0156.docx"
        },
        { 
          icon: <ShieldCheckmarkRegular />, 
          text: "Full audit trail logged for ORR compliance", 
          color: "#107C10",
          source: "📁 SharePoint/Compliance/ORR-Audit-Trails/2024/"
        }
      ]
    },
    {
      id: 'staff-shortage',
      title: 'Driver Shortage Crisis',
      description: 'Multiple drivers called in sick for tomorrow\'s peak hours. Need to reorganize shifts, contact relief drivers, and ensure service continuity while staying within fatigue regulations.',
      urgency: 'high',
      icon: <PersonRunningRegular />,
      results: [
        { 
          icon: <PeopleRegular />, 
          text: "8 drivers affected across 3 depots: Southend, Wickford, Upminster", 
          color: "#D13438",
          source: "📊 Excel/Rosters/Daily-Availability-Report.xlsx"
        },
        { 
          icon: <ClockRegular />, 
          text: "Peak service coverage at 85% - 6 services may need cancellation", 
          color: "#FFA500",
          source: "📊 Excel/Service-Planning/Peak-Hour-Coverage.xlsx"
        },
        { 
          icon: <PersonRunningRegular />, 
          text: "Relief drivers contacted: 4 available from rest day pool", 
          color: "#107C10",
          source: "📊 Excel/Rosters/Relief-Driver-Pool.xlsx"
        },
        { 
          icon: <DocumentRegular />, 
          text: "Fatigue risk assessment completed - all within regulations", 
          color: "#107C10",
          source: "📄 SharePoint/Compliance/Fatigue-Risk-Assessments/"
        },
        { 
          icon: <MailRegular />, 
          text: "Service alteration notices sent to passenger info systems", 
          color: "#107C10",
          source: "📧 Outlook/Passenger-Info/Service-Alterations/"
        },
        { 
          icon: <CalendarRegular />, 
          text: "Revised duty roster published to all affected crew", 
          color: "#107C10",
          source: "📄 SharePoint/Rosters/Emergency-Duty-Revisions/"
        },
        { 
          icon: <ShieldCheckmarkRegular />, 
          text: "Compliance check: All driver hours within ORR limits", 
          color: "#107C10",
          source: "📊 Excel/Compliance/Driver-Hours-Monitoring.xlsx"
        }
      ]
    },
    {
      id: 'performance-review',
      title: 'Monthly Performance Analysis',
      description: 'Need to pull together the monthly performance report for ORR submission. Analyze delay minutes, punctuality, and identify improvement areas across all routes.',
      urgency: 'medium',
      icon: <DocumentRegular />,
      results: [
        { 
          icon: <DocumentRegular />, 
          text: "Performance data extracted from TRUST and RTPPM systems", 
          color: "#0078D4",
          source: "📊 Excel/Performance/Monthly-TRUST-RTPPM-Export.xlsx"
        },
        { 
          icon: <CheckmarkCircleRegular />, 
          text: "Overall punctuality: 89.2% (target: 88%)", 
          color: "#107C10",
          source: "📊 Excel/Performance/Punctuality-Dashboard.xlsx"
        },
        { 
          icon: <WarningRegular />, 
          text: "Delay hotspot identified: Pitsea-Benfleet section (infrastructure)", 
          color: "#FFA500",
          source: "📄 SharePoint/Analysis/Delay-Hotspot-Reports/"
        },
        { 
          icon: <VehicleSubwayRegular />, 
          text: "Rolling stock reliability: 97.8% (above target)", 
          color: "#107C10",
          source: "📊 Excel/Fleet/Rolling-Stock-Reliability.xlsx"
        },
        { 
          icon: <ClipboardRegular />, 
          text: "Monthly report auto-generated with trend analysis", 
          color: "#107C10",
          source: "📄 Word/Reports/Monthly-Performance-July-2024.docx"
        },
        { 
          icon: <MailRegular />, 
          text: "Executive summary sent to ops director and ORR portal", 
          color: "#107C10",
          source: "📧 Outlook/Executive-Reports/ORR-Submissions/"
        },
        { 
          icon: <ShieldCheckmarkRegular />, 
          text: "Submitted 3 days ahead of deadline", 
          color: "#107C10",
          source: "📁 SharePoint/Compliance/ORR-Submissions/2024/"
        }
      ]
    }
  ];

  const currentDemoResults = demoScenarios[selectedScenario]?.results || [];

  if (currentStep === 'signin') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0078D4 0%, #106EBE 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', maxWidth: '400px' }}
        >
          <div style={{ marginBottom: '40px' }}>
            <VehicleSubwayRegular style={{ fontSize: '80px', color: 'white', marginBottom: '20px' }} />
            <Text style={{ 
              fontSize: '36px', 
              fontWeight: 300, 
              color: 'white', 
              display: 'block',
              marginBottom: '10px'
            }}>
              SAMARA AI
            </Text>
            <Text style={{ 
              fontSize: '18px', 
              color: 'rgba(255,255,255,0.9)',
              display: 'block',
              marginBottom: '20px'
            }}>
              Transportation Operations Assistant
            </Text>
            <Badge appearance="filled" style={{
              backgroundColor: '#FF6B35',
              color: 'white',
              padding: '8px 16px',
              fontSize: '14px'
            }}>
              🚇 Rail Operations Demo
            </Badge>
          </div>

          <Card style={{ 
            padding: '30px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px'
          }}>
            <Text style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              marginBottom: '20px',
              display: 'block'
            }}>
              Welcome to Your Operations Hub
            </Text>
            <Text style={{ 
              color: '#666',
              marginBottom: '30px',
              display: 'block'
            }}>
              Sign in with your Microsoft account to continue
            </Text>
            <Button 
              appearance="primary" 
              size="large"
              onClick={handleSignIn}
              style={{
                width: '100%',
                height: '48px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600
              }}
            >
              Sign in with Microsoft
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'processing') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0078D4 0%, #106EBE 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: '500px' }}
        >
          <Card style={{ 
            padding: '50px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px'
          }}>
            <VehicleSubwayRegular style={{ fontSize: '60px', color: '#0078D4', marginBottom: '20px' }} />
            <Text style={{ 
              fontSize: '24px', 
              fontWeight: 600, 
              marginBottom: '15px',
              display: 'block'
            }}>
              Samara is Learning...
            </Text>
            <Text style={{ 
              color: '#666',
              marginBottom: '30px',
              display: 'block',
              lineHeight: '1.5'
            }}>
              Building your personalized operations profile based on your preferences and workflow patterns.
            </Text>
            <Spinner size="large" style={{ marginBottom: '20px' }} />
            <Text style={{ 
              fontSize: '14px',
              color: '#888',
              fontStyle: 'italic'
            }}>
              This usually takes a few seconds...
            </Text>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'onboarding') {
    const currentQuestion = onboardingQuestions[onboardingStep];
    const progress = ((onboardingStep + 1) / onboardingQuestions.length) * 100;

    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0078D4 0%, #106EBE 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <motion.div
          key={onboardingStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          style={{ maxWidth: '600px', width: '100%' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Text style={{ 
              fontSize: '28px', 
              fontWeight: 300, 
              color: 'white', 
              display: 'block',
              marginBottom: '10px'
            }}>
              Teach Samara How You Work
            </Text>
            <Text style={{ 
              fontSize: '16px', 
              color: 'rgba(255,255,255,0.9)',
              display: 'block',
              marginBottom: '20px'
            }}>
              Help Samara become your second brain for rail operations
            </Text>
            <ProgressBar value={progress} style={{ marginBottom: '10px' }} />
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              Question {onboardingStep + 1} of {onboardingQuestions.length}
            </Text>
          </div>

          <Card style={{ 
            padding: '40px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px'
          }}>
            <Text style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              marginBottom: '20px',
              display: 'block'
            }}>
              {currentQuestion.question}
            </Text>
            
            {currentQuestion.type === 'checkbox' ? (
              <div style={{ marginBottom: '30px' }}>
                {currentQuestion.options.map((option, index) => (
                  <Checkbox
                    key={index}
                    label={option}
                    checked={(onboardingData[currentQuestion.key] as string[]).includes(option)}
                    onChange={(_, data) => handleOnboardingInput(option, data.checked === true)}
                    style={{
                      marginBottom: '12px',
                      display: 'block'
                    }}
                  />
                ))}
              </div>
            ) : (
              <RadioGroup
                value={onboardingData[currentQuestion.key] as string}
                onChange={(_, data) => handleOnboardingInput(data.value)}
                style={{ marginBottom: '30px' }}
              >
                {currentQuestion.options.map((option, index) => (
                  <Radio
                    key={index}
                    value={option}
                    label={option}
                    style={{
                      marginBottom: '10px',
                      display: 'block'
                    }}
                  />
                ))}
              </RadioGroup>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                appearance="secondary"
                disabled={onboardingStep === 0}
                onClick={() => setOnboardingStep(prev => prev - 1)}
              >
                Previous
              </Button>
              <Button 
                appearance="primary"
                onClick={handleOnboardingNext}
                disabled={!isOnboardingStepValid()}
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                  border: 'none'
                }}
              >
                {onboardingStep === onboardingQuestions.length - 1 ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <VehicleSubwayRegular style={{ fontSize: '32px', color: '#0078D4' }} />
          <div>
            <Text style={{ fontSize: '24px', fontWeight: 600, display: 'block' }}>
              SAMARA AI
            </Text>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              Rail Operations Assistant
            </Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Badge appearance="filled" color="success">
            <ShieldCheckmarkRegular style={{ marginRight: '4px' }} />
            Compliant
          </Badge>
          <Badge appearance="filled" style={{ backgroundColor: '#FF6B35', color: 'white' }}>
            <FlashRegular style={{ marginRight: '4px' }} />
            Demo Mode
          </Badge>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Left Column */}
        <div>
          {/* Priority Tasks */}
          <Card style={{ padding: '25px', marginBottom: '20px' }}>
            <Text style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', display: 'block' }}>
              🚨 Priority Tasks
            </Text>
            {priorityTasks.map((task, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: task.priority === 'high' ? '#FFF4F4' : task.priority === 'medium' ? '#FFFBF0' : '#F8F9FA',
                borderRadius: '8px',
                border: `1px solid ${task.priority === 'high' ? '#FFD6D6' : task.priority === 'medium' ? '#FFEAA7' : '#E9ECEF'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ color: task.priority === 'high' ? '#DC3545' : task.priority === 'medium' ? '#FFA500' : '#6C757D' }}>
                    {task.icon}
                  </div>
                  <Text style={{ flex: 1 }}>{task.text}</Text>
                  <Badge 
                    appearance="filled" 
                    color={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'subtle'}
                  >
                    {task.priority}
                  </Badge>
                </div>
                <div style={{ paddingLeft: '30px' }}>
                  <Text style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    fontFamily: 'monospace',
                    backgroundColor: '#F8F9FA',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #E9ECEF'
                  }}>
                    {task.source}
                  </Text>
                </div>
              </div>
            ))}
          </Card>

          {/* Demo Scenarios - Samara Style */}
          <Card style={{ padding: '25px' }}>
            <Text style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', display: 'block' }}>
              💬 Ask Samara
            </Text>
            
            {/* Prompt Bar */}
            <div style={{ 
              border: '2px solid #E9ECEF',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px',
              backgroundColor: '#FAFAFA'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <VehicleSubwayRegular style={{ color: '#0078D4', fontSize: '20px' }} />
                <Text style={{ fontWeight: 600, color: '#333' }}>Samara AI Assistant</Text>
              </div>
              <Input
                placeholder="Ask Samara anything about your operations..."
                value={demoScenarios[selectedScenario]?.description || ''}
                readOnly
                style={{
                  width: '100%',
                  backgroundColor: 'white',
                  border: '1px solid #DEE2E6',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            {/* Suggested Scenarios */}
            <Text style={{ fontSize: '14px', fontWeight: 600, marginBottom: '15px', color: '#666' }}>
              💡 Suggested scenarios:
            </Text>
            <div style={{ marginBottom: '20px' }}>
              {demoScenarios.map((scenario, index) => (
                <div 
                  key={scenario.id}
                  style={{ 
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: selectedScenario === index ? '#E3F2FD' : '#F8F9FA',
                    borderRadius: '8px',
                    border: selectedScenario === index ? '2px solid #0078D4' : '1px solid #DEE2E6',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedScenario(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: scenario.urgency === 'high' ? '#DC3545' : scenario.urgency === 'medium' ? '#FFA500' : '#6C757D' }}>
                      {scenario.icon}
                    </div>
                    <Text style={{ fontWeight: 600, fontSize: '14px', flex: 1 }}>{scenario.title}</Text>
                    <Badge 
                      appearance="filled" 
                      color={scenario.urgency === 'high' ? 'danger' : scenario.urgency === 'medium' ? 'warning' : 'subtle'}
                      size="small"
                    >
                      {scenario.urgency}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              appearance="primary"
              size="large"
              onClick={handleDemoPrompt}
              disabled={isProcessingDemo}
              style={{
                width: '100%',
                height: '48px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                border: 'none'
              }}
            >
              {isProcessingDemo ? '🔄 Samara is thinking...' : `🚀 Ask Samara`}
            </Button>
          </Card>
        </div>

        {/* Right Column */}
        <div>
          {/* Compliance Tracker */}
          <Card style={{ padding: '25px', marginBottom: '20px' }}>
            <Text style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', display: 'block' }}>
              🛡️ Compliance Tracker
            </Text>
            {complianceStatus.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '10px',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: '#F8F9FA',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ 
                    color: item.status === 'success' ? '#107C10' : item.status === 'warning' ? '#FFA500' : '#DC3545'
                  }}>
                    {item.status === 'success' ? <CheckmarkCircleRegular /> : 
                     item.status === 'warning' ? <WarningRegular /> : <DismissCircleRegular />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 600, display: 'block' }}>{item.name}</Text>
                    <Text style={{ fontSize: '14px', color: '#666' }}>{item.detail}</Text>
                  </div>
                </div>
                <div style={{ paddingLeft: '30px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Button 
                    appearance="subtle" 
                    size="small"
                    style={{
                      alignSelf: 'flex-start',
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: item.status === 'error' ? '#DC3545' : '#0078D4'
                    }}
                  >
                    {item.action} →
                  </Button>
                  <Text style={{ 
                    fontSize: '11px', 
                    color: '#666',
                    fontFamily: 'monospace',
                    backgroundColor: 'white',
                    padding: '3px 6px',
                    borderRadius: '3px',
                    border: '1px solid #E9ECEF',
                    alignSelf: 'flex-start'
                  }}>
                    📂 {item.source}
                  </Text>
                </div>
              </div>
            ))}
            <div style={{ 
              padding: '15px',
              backgroundColor: '#E3F2FD',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <Text style={{ 
                fontSize: '14px',
                color: '#1976D2',
                fontWeight: 500
              }}>
                💡 <strong>Stay Protected:</strong> 94% compliance score this month. The more you resolve through Samara, the stronger your audit trail becomes. Every action logged automatically.
              </Text>
            </div>
          </Card>

          {/* Demo Results */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card style={{ padding: '25px' }}>
                  <Text style={{ 
                    fontSize: '20px', 
                    fontWeight: 600, 
                    marginBottom: '15px', 
                    display: 'block',
                    color: '#107C10'
                  }}>
                    ✅ Scenario Complete - {demoScenarios[selectedScenario]?.title}
                  </Text>
                  
                  {/* Productivity Impact */}
                  <div style={{ 
                    padding: '15px',
                    backgroundColor: '#FFF8E1',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #FFEB3B'
                  }}>
                    <Text style={{ 
                      fontSize: '14px',
                      color: '#F57C00',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '5px'
                    }}>
                      🚀 Productivity Boost
                    </Text>
                    <Text style={{ fontSize: '13px', color: '#666' }}>
                      Traditional manual process: ~25-30 minutes | Samara: {(processingTime / 1000).toFixed(1)} seconds
                    </Text>
                  </div>
                  {currentDemoResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '15px',
                        marginBottom: '10px',
                        backgroundColor: '#F0F9FF',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ color: result.color }}>
                          {result.icon}
                        </div>
                        <Text style={{ flex: 1 }}>{result.text}</Text>
                      </div>
                      {result.source && (
                        <div style={{ paddingLeft: '30px' }}>
                          <Text style={{ 
                            fontSize: '11px', 
                            color: '#666',
                            fontFamily: 'monospace',
                            backgroundColor: '#F8F9FA',
                            padding: '3px 6px',
                            borderRadius: '3px',
                            border: '1px solid #E9ECEF'
                          }}>
                            🔗 {result.source}
                          </Text>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Performance Metrics */}
                  <div style={{ 
                    padding: '15px',
                    backgroundColor: '#F0F9FF',
                    borderRadius: '8px',
                    marginTop: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <Text style={{ fontSize: '14px', fontWeight: 600, color: '#0078D4' }}>
                        ⚡ Samara Performance
                      </Text>
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        Processing time: {(processingTime / 1000).toFixed(1)}s
                      </Text>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '12px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <Text style={{ display: 'block', fontWeight: 600, color: '#107C10' }}>9</Text>
                        <Text style={{ color: '#666' }}>Actions</Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text style={{ display: 'block', fontWeight: 600, color: '#107C10' }}>3</Text>
                        <Text style={{ color: '#666' }}>Systems</Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text style={{ display: 'block', fontWeight: 600, color: '#107C10' }}>15+</Text>
                        <Text style={{ color: '#666' }}>People notified</Text>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '15px',
                    backgroundColor: '#E8F5E8',
                    borderRadius: '8px',
                    marginTop: '15px'
                  }}>
                    <Text style={{ 
                      fontSize: '14px',
                      color: '#107C10',
                      fontWeight: 500
                    }}>
                      🔒 All actions logged for compliance. Full audit trail available instantly.
                    </Text>
                  </div>
                  
                  {/* What Happens Next */}
                  <div style={{ 
                    padding: '15px',
                    backgroundColor: '#F3E5F5',
                    borderRadius: '8px',
                    marginTop: '15px'
                  }}>
                    <Text style={{ 
                      fontSize: '14px',
                      color: '#7B1FA2',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      🔄 What happens next?
                    </Text>
                    <Text style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                      • Samara monitors progress and sends updates to your Teams<br/>
                      • Auto-generates follow-up tasks based on incident resolution<br/>
                      • Updates performance dashboards and ORR reports in real-time<br/>
                      • Learns from this scenario to handle similar issues faster next time
                    </Text>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
