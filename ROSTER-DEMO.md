# 🚀 Samara AI - Roster Management Demo

## Overview

This demonstration showcases Samara AI's ability to handle complex driver roster management tasks for transportation operations, integrating real Microsoft 365 data with compliance requirements and fatigue regulations.

## ✨ What This Demo Does

### 🎯 Core Functionality
- **Real Excel Integration**: Fetches actual roster files from your OneDrive
- **Issue Detection**: Automatically identifies unstaffed shifts, sick calls, and compliance risks
- **Smart Suggestions**: Recommends available replacement drivers based on:
  - Recent working hours and fatigue status
  - Working Time Directive compliance
  - Rest period requirements
  - ORR regulations
- **Automated Actions**: Creates updated rosters, sends Teams notifications, maintains audit trails

### 🔧 Technical Implementation
- **Real Samara Engine**: Uses the production `intelligentWorkflowProcessor` with full Microsoft Graph API integration
- **Groq AI**: Lightning-fast prompt processing and workflow planning
- **Full Compliance**: Complete audit logging, data classification, and regulatory compliance
- **No Mock Data**: Everything connects to real Microsoft 365 services

## 🚀 Access the Demo

### Option 1: Direct URL
```
https://your-domain.com/?demo=roster
```

### Option 2: Local Development
```bash
npm run dev
# Then visit: http://localhost:5173/?demo=roster
```

## 📋 Demo Scenarios

### 1. 🚨 Emergency Roster Fix
**Use Case**: Handle sick calls and urgent staff shortages

**What Samara Does**:
- Scans Excel roster files for gaps
- Identifies available drivers from rest day pool
- Checks fatigue limits and working time compliance
- Creates updated roster assignments
- Sends Teams messages to affected staff
- Updates compliance tracker with all changes

**Example Prompt**:
```
I need to fix our driver roster for tomorrow - we have several sick calls and need to fill gaps while staying compliant with fatigue regulations. 

Please:
1. Find the Excel roster file from OneDrive
2. Identify unstaffed shifts and highlight issues
3. Suggest available replacement drivers based on their recent hours and fatigue status
4. Create an updated roster assignment
5. Send Teams message to affected staff about shift changes
6. Update compliance tracker with all changes made

Make sure we stay within Working Time Directive limits and maintain proper rest periods between shifts.
```

### 2. 📊 Weekly Roster Analysis
**Use Case**: Analyze current week's staffing and compliance

**What Samara Does**:
- Analyzes current week's roster data
- Checks all drivers against fatigue regulations
- Identifies compliance risks and efficiency issues
- Calculates utilization rates and overtime costs
- Generates comprehensive Word report
- Creates actionable recommendations

### 3. 📅 Next Week Planning
**Use Case**: Optimize roster for upcoming week with holiday coverage

**What Samara Does**:
- Accesses current roster and driver availability
- Accounts for scheduled holidays and training
- Optimizes assignments to minimize overtime
- Ensures full service coverage
- Creates provisional roster for approval
- Sets up compliance monitoring

## 🛡️ Compliance Features

### ORR (Office of Rail and Road) Compliance
- **Driver Hours Monitoring**: Automatic tracking of weekly/daily limits
- **Fatigue Management**: Rest period validation between shifts
- **Working Time Directive**: EU working time regulation compliance
- **Audit Trails**: Complete documentation for regulatory reporting

### Data Security & Privacy
- **Microsoft OAuth 2.0**: Secure authentication
- **Data Classification**: Automatic sensitivity labeling
- **Audit Logging**: Complete action tracking
- **Retention Policies**: Regulatory-compliant data retention

## 🔧 Real Microsoft 365 Integration

### Excel Operations
- **File Access**: Real OneDrive roster file retrieval
- **Data Processing**: Actual Excel workbook reading and writing
- **Roster Updates**: Creation of updated assignment files
- **Merge Capabilities**: Multi-file roster consolidation

### Teams Integration
- **Notifications**: Automated messages to affected drivers
- **Channel Updates**: Group notifications for shift changes
- **Meeting Scheduling**: Roster review meetings

### Compliance Tracking
- **SharePoint Integration**: Compliance document storage
- **Automated Reporting**: Regulatory submission preparation
- **Real-time Monitoring**: Continuous compliance checking

## 📈 Performance Benefits

### Traditional Manual Process vs. Samara
| Task | Manual Time | Samara Time | Time Saved |
|------|-------------|-------------|------------|
| Roster gap analysis | 45-60 mins | 15 seconds | 98% |
| Driver availability check | 30-45 mins | 10 seconds | 97% |
| Compliance validation | 60-90 mins | 20 seconds | 98% |
| Notification sending | 15-30 mins | 5 seconds | 95% |
| Documentation | 30-60 mins | Automatic | 100% |

**Total Process**: 3-4.5 hours → Under 1 minute

## 🎨 User Interface Features

### Current Issues Dashboard
- Real-time roster issue detection
- Severity-based prioritization (High/Medium/Low)
- Suggested fixes with compliance impact assessment
- Visual indicators for different issue types

### Scenario Selection
- Pre-configured common scenarios
- Custom prompt input for specific needs
- Professional transportation industry styling
- Intuitive workflow guidance

### Results Display
- Step-by-step process visualization
- Real file/system references
- Compliance status indicators
- Performance metrics and time savings

## 🚀 Getting Started

1. **Access the Demo**: Visit `/?demo=roster` 
2. **Choose a Scenario**: Select from emergency fixes, analysis, or planning
3. **Watch Samara Work**: Real-time processing with full transparency
4. **Review Results**: Updated rosters, notifications, and compliance logs

## 💡 Custom Scenarios

You can create your own roster management scenarios by describing specific challenges:

**Example Custom Prompts**:
- "Need to reorganize next week's shifts due to planned maintenance at Southend depot"
- "Analyze overtime costs for this month and suggest efficiency improvements"
- "Handle a last-minute timetable change affecting 15 services"
- "Prepare roster for holiday period with reduced staff availability"

## 🔗 Technology Stack

- **Frontend**: React + TypeScript + Fluent UI
- **AI Engine**: Groq (ultra-fast LLM processing)
- **Microsoft Integration**: Graph API + MSAL authentication
- **Compliance**: Custom logging and audit trail system
- **Real-time Processing**: Intelligent workflow orchestration

## 📞 Support

This is a demonstration of Samara AI's capabilities for transportation roster management. For production deployment or customization, the system can be configured for your specific operational requirements and compliance frameworks.

---

*Powered by Samara AI - Turning complex transportation operations into simple, compliant workflows.*
