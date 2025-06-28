# Samara AI - Workflow Automation MVP

A streamlined AI-powered workflow automation tool for Microsoft 365. One natural language prompt triggers intelligent multi-step workflows across Excel, Word, PowerPoint, Outlook, Teams, and Planner.

![Samara AI](https://img.shields.io/badge/Samara%20AI-Workflow%20Automation-667eea?style=for-the-badge)

## 🚀 Core Value Proposition

**Turn 10 hours of manual work into 5 minutes of automated workflow**

Simply describe what you want to accomplish in natural language, and Samara AI will:
- Analyze your request
- Plan the optimal workflow
- Execute tasks across multiple Microsoft 365 apps
- Provide real-time progress updates
- Show you exactly how much time you saved

## ✨ Key Features

### 🎯 **Natural Language Workflows**
```
"Merge all Excel budget files from this quarter, create a summary report in Word, and email it to the finance team"
```

### 🔄 **Multi-App Automation**
- **Excel**: Data extraction, merging, analysis
- **Word**: Document generation, reports, summaries
- **PowerPoint**: Presentation creation with charts
- **Outlook**: Email notifications, stakeholder updates
- **Teams**: Meeting scheduling, collaboration setup
- **Planner**: Task creation, project management

### ⚡ **Real-Time Execution**
- Live progress tracking
- Transparent step-by-step execution
- Time savings calculation
- File creation notifications

### 📊 **Intelligent Processing**
- Automatic workflow planning
- Cross-app data integration
- Smart content generation
- Stakeholder identification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Microsoft 365 Business account
- Azure AD application registration

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd samara-ai-workflow-mvp
   npm install
   ```

2. **Configure Azure AD**
   ```typescript
   // src/config/msalConfig.ts
   export const msalConfig: Configuration = {
     auth: {
       clientId: 'your-client-id-here', // Replace with your Azure AD app ID
       authority: 'https://login.microsoftonline.com/common',
       redirectUri: window.location.origin,
     },
   };
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Azure AD Setup

### Required Permissions
Add these Microsoft Graph permissions to your Azure AD app:
- `User.Read` (Delegated)
- `Files.Read` (Delegated)
- `Files.ReadWrite` (Delegated)
- `Mail.Send` (Delegated)
- `Calendars.ReadWrite` (Delegated)
- `Tasks.ReadWrite` (Delegated)
- `offline_access` (Delegated)

### Redirect URIs
- Development: `http://localhost:5173`
- Production: `https://your-domain.com`

## 💡 Example Workflows

### **Budget Analysis & Reporting**
```
"Merge all Excel budget files from this quarter, create a summary report in Word, and email it to the finance team"
```
**Result**: Automated data consolidation, report generation, and stakeholder notification

### **Project Status Update**
```
"Find all project documents from the last month, extract key metrics, and create a PowerPoint presentation for the board meeting"
```
**Result**: Document analysis, metric extraction, and executive presentation creation

### **Customer Feedback Analysis**
```
"Analyze customer feedback from emails and surveys, categorize by sentiment, and create an action plan document"
```
**Result**: Sentiment analysis, categorization, and actionable insights document

### **Meeting Preparation**
```
"Consolidate all meeting notes from this week, identify action items, and create follow-up tasks in Planner"
```
**Result**: Note consolidation, action item extraction, and task management setup

## 🏗️ Architecture

### **Core Components**
- **WorkflowInterface**: Natural language input and progress display
- **WorkflowProcessor**: Multi-step workflow execution engine
- **Microsoft Graph Integration**: Secure API access to Microsoft 365

### **Workflow Engine**
1. **Intent Analysis**: Parse natural language requests
2. **Workflow Planning**: Determine optimal execution steps
3. **Cross-App Execution**: Coordinate actions across Microsoft 365
4. **Progress Tracking**: Real-time status updates
5. **Result Compilation**: Summary and time savings calculation

## 🔒 Security & Privacy

- **Zero Data Storage**: All data remains in your Microsoft 365 environment
- **Secure Authentication**: OAuth 2.0 with Microsoft Identity Platform
- **Audit Trail**: Complete workflow logging through Microsoft Graph
- **Compliance Ready**: Inherits your organization's security policies

## 📈 Time Savings Examples

| Workflow Type | Manual Time | Automated Time | Time Saved |
|---------------|-------------|----------------|------------|
| Budget Consolidation | 8 hours | 3 minutes | 7h 57m |
| Report Generation | 4 hours | 2 minutes | 3h 58m |
| Presentation Creation | 6 hours | 4 minutes | 5h 56m |
| Email Notifications | 1 hour | 30 seconds | 59m 30s |

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables for production Azure AD app

## 🔮 Future Enhancements

- Voice input for hands-free operation
- Workflow templates and favorites
- Team workflow sharing
- Advanced analytics and insights
- Custom workflow builders
- Mobile app support

## 📞 Support

For questions or issues:
- Check the Azure AD configuration
- Verify Microsoft Graph permissions
- Review the browser console for errors
- Ensure Microsoft 365 Business account access

---

**Built for the future of work - where AI handles the complexity, and you focus on what matters most.**

*Samara AI: Transforming 10 hours of work into 5 minutes of magic.*