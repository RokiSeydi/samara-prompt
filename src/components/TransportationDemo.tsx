import React, { useState } from 'react';
import {
  Card,
  Text,
  Button,
  Badge,
  ProgressBar,
  Textarea,
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
  checkFirst: string;
  notify: string;
  communicate: string;
  logging: string;
  reports: string;
}

export const TransportationDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'signin' | 'onboarding' | 'dashboard'>('signin');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    checkFirst: '',
    notify: '',
    communicate: '',
    logging: '',
    reports: ''
  });
  const [isProcessingDemo, setIsProcessingDemo] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [activeTab, setActiveTab] = useState<'tasks' | 'scenarios' | 'compliance'>('tasks');
  const [processingTime, setProcessingTime] = useState(0);

  const onboardingQuestions = [
    {
      question: "When something goes wrong, where do you usually check first?",
      placeholder: "Excel spreadsheets, SharePoint sites, Teams channels, phone calls...",
      key: 'checkFirst' as keyof OnboardingData
    },
    {
      question: "Who do you usually need to notify during disruptions?",
      placeholder: "Control room, station managers, onboard crew, senior ops leads...",
      key: 'notify' as keyof OnboardingData
    },
    {
      question: "How do you usually communicate with teams during service issues?",
      placeholder: "Teams messages, Outlook emails, phone calls, radio...",
      key: 'communicate' as keyof OnboardingData
    },
    {
      question: "Where do you usually log what happened?",
      placeholder: "Excel sheets, Word documents, SharePoint lists...",
      key: 'logging' as keyof OnboardingData
    },
    {
      question: "Which reports do you need to stay compliant?",
      placeholder: "Daily performance summary, incident reports, delay attribution...",
      key: 'reports' as keyof OnboardingData
    }
  ];

  const handleSignIn = () => {
    setCurrentStep('onboarding');
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < onboardingQuestions.length - 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      setCurrentStep('dashboard');
    }
  };

  const handleOnboardingInput = (value: string) => {
    const currentQuestion = onboardingQuestions[onboardingStep];
    setOnboardingData(prev => ({
      ...prev,
      [currentQuestion.key]: value
    }));
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
    { icon: <AlertRegular />, text: "Signal failure at Pitsea - 6 services delayed", priority: "high" },
    { icon: <PersonRunningRegular />, text: "Driver shortage at Southend depot - shift coverage needed", priority: "high" },
    { icon: <PeopleRegular />, text: "Driver roster approval needed for next week", priority: "medium" },
    { icon: <DocumentRegular />, text: "Monthly performance report due tomorrow", priority: "high" },
    { icon: <ClockRegular />, text: "Platform 3 maintenance window - schedule with Network Rail", priority: "medium" },
    { icon: <BuildingRegular />, text: "Staff room heating repair at Wickford station", priority: "low" },
    { icon: <CalendarRegular />, text: "Christmas timetable changes - crew briefing required", priority: "medium" }
  ];

  const complianceStatus = [
    { name: "ORR Performance submissions", status: "success", detail: "Submitted on time - next due 15th" },
    { name: "Delay attribution reports", status: "warning", detail: "2 incidents pending root cause" },
    { name: "Driver hours compliance check", status: "success", detail: "All drivers within limits" },
    { name: "Fatigue review for Driver #C112", status: "error", detail: "14-day review overdue" },
    { name: "Station safety inspections", status: "success", detail: "Monthly checks completed" },
    { name: "Rolling stock maintenance logs", status: "warning", detail: "Unit 321404 service due" }
  ];

  const demoScenarios = [
    {
      id: 'signal-failure',
      title: 'Signal Failure at Pitsea',
      description: 'Signal failure reported at Pitsea Junction affecting the Southend line. Show me impacted services, get replacement crew sorted, notify all teams, and start the incident log for compliance.',
      urgency: 'high',
      icon: <AlertRegular />,
      results: [
        { icon: <AlertRegular />, text: "Signal failure confirmed at Pitsea Junction (Block S47)", color: "#D13438" },
        { icon: <VehicleSubwayRegular />, text: "6 services impacted: 3 cancelled, 3 diverted via Benfleet", color: "#0078D4" },
        { icon: <PersonRunningRegular />, text: "Replacement crew dispatched from Shoeburyness depot (ETA 12 mins)", color: "#107C10" },
        { icon: <CompassNorthwestRegular />, text: "Network Rail fault team notified - estimated fix time 45 minutes", color: "#0078D4" },
        { icon: <PeopleRegular />, text: "Station managers at Pitsea, Benfleet & Wickford notified via Teams", color: "#107C10" },
        { icon: <PhoneRegular />, text: "Control room and onboard crew alerted via radio protocol", color: "#107C10" },
        { icon: <MailRegular />, text: "Passenger information emails sent to affected season ticket holders", color: "#107C10" },
        { icon: <ClipboardRegular />, text: "Incident report P-2024-0156 created in SharePoint", color: "#107C10" },
        { icon: <ShieldCheckmarkRegular />, text: "Full audit trail logged for ORR compliance", color: "#107C10" }
      ]
    },
    {
      id: 'staff-shortage',
      title: 'Driver Shortage Crisis',
      description: 'Multiple drivers called in sick for tomorrow\'s peak hours. Need to reorganize shifts, contact relief drivers, and ensure service continuity while staying within fatigue regulations.',
      urgency: 'high',
      icon: <PersonRunningRegular />,
      results: [
        { icon: <PeopleRegular />, text: "8 drivers affected across 3 depots: Southend, Wickford, Upminster", color: "#D13438" },
        { icon: <ClockRegular />, text: "Peak service coverage at 85% - 6 services may need cancellation", color: "#FFA500" },
        { icon: <PersonRunningRegular />, text: "Relief drivers contacted: 4 available from rest day pool", color: "#107C10" },
        { icon: <DocumentRegular />, text: "Fatigue risk assessment completed - all within regulations", color: "#107C10" },
        { icon: <MailRegular />, text: "Service alteration notices sent to passenger info systems", color: "#107C10" },
        { icon: <CalendarRegular />, text: "Revised duty roster published to all affected crew", color: "#107C10" },
        { icon: <ShieldCheckmarkRegular />, text: "Compliance check: All driver hours within ORR limits", color: "#107C10" }
      ]
    },
    {
      id: 'performance-review',
      title: 'Monthly Performance Analysis',
      description: 'Need to pull together the monthly performance report for ORR submission. Analyze delay minutes, punctuality, and identify improvement areas across all routes.',
      urgency: 'medium',
      icon: <DocumentRegular />,
      results: [
        { icon: <DocumentRegular />, text: "Performance data extracted from TRUST and RTPPM systems", color: "#0078D4" },
        { icon: <CheckmarkCircleRegular />, text: "Overall punctuality: 89.2% (target: 88%)", color: "#107C10" },
        { icon: <WarningRegular />, text: "Delay hotspot identified: Pitsea-Benfleet section (infrastructure)", color: "#FFA500" },
        { icon: <VehicleSubwayRegular />, text: "Rolling stock reliability: 97.8% (above target)", color: "#107C10" },
        { icon: <ClipboardRegular />, text: "Monthly report auto-generated with trend analysis", color: "#107C10" },
        { icon: <MailRegular />, text: "Executive summary sent to ops director and ORR portal", color: "#107C10" },
        { icon: <ShieldCheckmarkRegular />, text: "Submitted 3 days ahead of deadline", color: "#107C10" }
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
            
            <Textarea
              value={onboardingData[currentQuestion.key]}
              onChange={(e) => handleOnboardingInput(e.target.value)}
              placeholder={currentQuestion.placeholder}
              rows={4}
              style={{
                width: '100%',
                marginBottom: '30px',
                fontSize: '16px',
                borderRadius: '8px'
              }}
            />

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
                disabled={!onboardingData[currentQuestion.key].trim()}
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
                alignItems: 'center', 
                gap: '15px',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: task.priority === 'high' ? '#FFF4F4' : task.priority === 'medium' ? '#FFFBF0' : '#F8F9FA',
                borderRadius: '8px',
                border: `1px solid ${task.priority === 'high' ? '#FFD6D6' : task.priority === 'medium' ? '#FFEAA7' : '#E9ECEF'}`
              }}>
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
            ))}
          </Card>

          {/* Demo Scenarios */}
          <Card style={{ padding: '25px' }}>
            <Text style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', display: 'block' }}>
              🤖 Demo Scenarios
            </Text>
            
            {/* Scenario Selection */}
            <div style={{ marginBottom: '20px' }}>
              {demoScenarios.map((scenario, index) => (
                <div 
                  key={scenario.id}
                  style={{ 
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: selectedScenario === index ? '#E3F2FD' : '#F8F9FA',
                    borderRadius: '8px',
                    border: selectedScenario === index ? '2px solid #0078D4' : '1px solid #DEE2E6',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedScenario(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ color: scenario.urgency === 'high' ? '#DC3545' : scenario.urgency === 'medium' ? '#FFA500' : '#6C757D' }}>
                      {scenario.icon}
                    </div>
                    <Text style={{ fontWeight: 600, flex: 1 }}>{scenario.title}</Text>
                    <Badge 
                      appearance="filled" 
                      color={scenario.urgency === 'high' ? 'danger' : scenario.urgency === 'medium' ? 'warning' : 'subtle'}
                    >
                      {scenario.urgency}
                    </Badge>
                  </div>
                  <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                    {scenario.description}
                  </Text>
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
              {isProcessingDemo ? '🔄 Samara is working...' : `🚀 Execute: ${demoScenarios[selectedScenario]?.title}`}
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
                alignItems: 'center', 
                gap: '15px',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: '#F8F9FA',
                borderRadius: '8px'
              }}>
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
                        alignItems: 'center', 
                        gap: '15px',
                        padding: '15px',
                        marginBottom: '10px',
                        backgroundColor: '#F0F9FF',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ color: result.color }}>
                        {result.icon}
                      </div>
                      <Text>{result.text}</Text>
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
