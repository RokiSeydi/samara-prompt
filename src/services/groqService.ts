import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
});

export interface WorkflowAction {
  action: string;
  app: string;
  source?: string;
  target?: string;
  parameters?: Record<string, any>;
  description: string;
  priority: number;
  required: boolean; // NEW: Whether this action is actually needed
}

export interface WorkflowPlan {
  intent: string;
  summary: string;
  actions: WorkflowAction[];
  estimatedTime: number;
  complexity: "low" | "medium" | "high";
  requiredApps: string[];
  dependencies: string[];
  focusedExecution: boolean; // NEW: Whether to execute only essential actions
}

export interface ParsedIntent {
  primaryGoal: string;
  secondaryGoals: string[];
  dataRequirements: string[];
  outputRequirements: string[];
  stakeholders: string[];
  urgency: "low" | "medium" | "high";
  context: Record<string, any>;
  executionType: "simple" | "complex"; // NEW: Simple queries vs complex workflows
  specificApp?: string; // NEW: If request is specific to one app
}

export class GroqWorkflowService {
  private async callGroq(
    prompt: string,
    systemPrompt: string
  ): Promise<string> {
    try {
      console.log("🚀 Calling Groq API with Llama-3.1-70B...");

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Fast and capable model
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1, // Lower temperature for more focused responses
        max_tokens: 2000,
        top_p: 0.9,
        stream: false,
      });

      const result = response.choices[0]?.message?.content || "";
      console.log("✅ Groq API response received");
      return result;
    } catch (error) {
      console.error("❌ Groq API Error:", error);

      // Fallback to Mixtral if Llama fails
      try {
        console.log("🔄 Trying fallback model: Mixtral-8x7B...");
        const fallbackResponse = await groq.chat.completions.create({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        });

        return fallbackResponse.choices[0]?.message?.content || "";
      } catch (fallbackError) {
        console.error("❌ Fallback model also failed:", fallbackError);
        throw new Error(`Groq API failed: ${error.message}`);
      }
    }
  }

  async parseIntent(userPrompt: string): Promise<ParsedIntent> {
    const systemPrompt = `You are an expert Microsoft 365 workflow analyst. Your job is to understand EXACTLY what the user wants and classify the request appropriately.

CRITICAL: Distinguish between simple queries and complex workflows:

SIMPLE QUERIES (executionType: "simple"):
- "List my Word documents"
- "Show me Excel files"
- "Get my recent emails"
- "Find PowerPoint presentations"
- "Show calendar events"

COMPLEX WORKFLOWS (executionType: "complex"):
- "Merge Excel files and create a report"
- "Analyze data and email results to team"
- "Create presentation from spreadsheet data"

For SIMPLE queries, identify the specific app and don't suggest unnecessary actions.
For COMPLEX workflows, plan multi-step processes.

Return JSON with this structure:
{
  "primaryGoal": "Exactly what the user wants to accomplish",
  "secondaryGoals": ["Only if there are actual secondary goals"],
  "dataRequirements": ["What specific data is needed"],
  "outputRequirements": ["What outputs are needed"],
  "stakeholders": ["Only if explicitly mentioned"],
  "urgency": "low|medium|high",
  "context": {
    "timeframe": "When this should be completed",
    "scope": "How comprehensive this should be",
    "format": "Preferred output formats"
  },
  "executionType": "simple|complex",
  "specificApp": "excel|word|powerpoint|outlook|teams|onenote|planner|null"
}

EXAMPLES:
User: "List my recent Word documents"
Response: {"primaryGoal": "List recent Word documents", "executionType": "simple", "specificApp": "word", ...}

User: "Merge Excel budget files and email to finance team"
Response: {"primaryGoal": "Merge Excel files and email results", "executionType": "complex", "specificApp": null, ...}

Return ONLY valid JSON, no additional text.`;

    const response = await this.callGroq(userPrompt, systemPrompt);

    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse intent JSON:", error);
      console.log("Raw response:", response);

      // Smart fallback parsing
      return this.createFallbackIntent(userPrompt);
    }
  }

  async generateWorkflowPlan(
    intent: ParsedIntent,
    availableDocuments: any[]
  ): Promise<WorkflowPlan> {
    const documentsContext = availableDocuments
      .slice(0, 10)
      .map(
        (doc) =>
          `- ${doc.name} (${doc.type}): ${
            doc.summary?.substring(0, 100) || "Available for processing"
          }`
      )
      .join("\n");

    const systemPrompt = `You are an expert Microsoft 365 workflow planner. Create FOCUSED, EFFICIENT plans that do ONLY what's needed.

CRITICAL RULES:
1. For SIMPLE queries (executionType: "simple"), create minimal plans with 1-2 actions max
2. For COMPLEX workflows (executionType: "complex"), create comprehensive multi-step plans
3. Mark actions as "required: true" only if absolutely necessary
4. Set "focusedExecution: true" for simple queries

Available Apps: excel, word, powerpoint, outlook, teams, onenote, planner, sharepoint

Available Documents:
${documentsContext}

Create a JSON workflow plan:
{
  "intent": "Clear description of what will be accomplished",
  "summary": "Brief overview focusing on essential actions only",
  "actions": [
    {
      "action": "list|read|merge|analyze|create|send|schedule|extract|calculate|format",
      "app": "excel|word|powerpoint|outlook|teams|onenote|planner|sharepoint",
      "source": "Where data comes from",
      "target": "Where output goes",
      "parameters": {
        "filter": "recent|all|specific",
        "count": 10,
        "format": "list|detailed|summary"
      },
      "description": "Human-readable description",
      "priority": 1,
      "required": true
    }
  ],
  "estimatedTime": 30,
  "complexity": "low|medium|high",
  "requiredApps": ["only", "necessary", "apps"],
  "dependencies": ["Only if actions depend on each other"],
  "focusedExecution": true
}

EXAMPLES:

For "List my Word documents":
{
  "intent": "List recent Word documents",
  "summary": "Retrieve and display Word documents from OneDrive",
  "actions": [
    {
      "action": "list",
      "app": "word",
      "parameters": {"filter": "recent", "count": 20},
      "description": "Get recent Word documents",
      "priority": 1,
      "required": true
    }
  ],
  "focusedExecution": true,
  "complexity": "low"
}

For "Merge Excel files and email team":
{
  "intent": "Merge Excel files and send email notification",
  "summary": "Multi-step workflow: merge data, create report, send email",
  "actions": [
    {
      "action": "merge",
      "app": "excel",
      "description": "Merge Excel budget files",
      "priority": 1,
      "required": true
    },
    {
      "action": "send",
      "app": "outlook",
      "description": "Email results to team",
      "priority": 2,
      "required": true
    }
  ],
  "focusedExecution": false,
  "complexity": "medium"
}

Return ONLY valid JSON, no additional text.`;

    const prompt = `Create a focused workflow plan for this intent:

Primary Goal: ${intent.primaryGoal}
Execution Type: ${intent.executionType}
Specific App: ${intent.specificApp || "multiple"}
Secondary Goals: ${intent.secondaryGoals?.join(", ") || "none"}
Data Requirements: ${intent.dataRequirements?.join(", ") || "none"}
Output Requirements: ${intent.outputRequirements?.join(", ") || "none"}

Create a plan that does ONLY what's necessary. For simple queries, keep it minimal.`;

    const response = await this.callGroq(prompt, systemPrompt);

    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse workflow plan JSON:", error);
      console.log("Raw response:", response);

      // Fallback plan
      return this.createFallbackPlan(intent);
    }
  }

  async generateActionInstructions(
    action: WorkflowAction,
    context: any
  ): Promise<string> {
    const systemPrompt = `You are a Microsoft 365 automation expert. Generate specific, efficient instructions for this action.

Focus on:
- Exact Microsoft Graph API endpoints needed
- Specific parameters and filters
- Expected response format
- Error handling considerations

Be concise and actionable.`;

    const prompt = `Generate execution instructions for this action:

Action: ${action.action}
App: ${action.app}
Description: ${action.description}
Parameters: ${JSON.stringify(action.parameters || {})}

Provide specific technical instructions for Microsoft Graph API execution.`;

    return await this.callGroq(prompt, systemPrompt);
  }

  async generateProgressUpdates(
    action: WorkflowAction,
    status: string
  ): Promise<string> {
    const systemPrompt = `Generate clear, specific progress updates for workflow actions.

Rules:
- Be specific about what's happening
- Use appropriate app-specific language
- Keep it concise (1 sentence)
- Make it user-friendly`;

    const prompt = `Generate a progress update:

Action: ${action.description}
App: ${action.app}
Status: ${status}

Create a clear, specific progress message.`;

    const response = await this.callGroq(prompt, systemPrompt);
    return response.trim();
  }

  async handleErrors(error: any, context: any): Promise<string> {
    const systemPrompt = `Analyze errors and provide helpful guidance.

Focus on:
- Clear explanation of what went wrong
- Possible causes specific to Microsoft 365
- Actionable solutions
- When to contact support

Be helpful and specific.`;

    const prompt = `Analyze this error:

Error: ${error.message || error}
Context: ${JSON.stringify(context)}

Provide helpful guidance for resolving this Microsoft 365 issue.`;

    const response = await this.callGroq(prompt, systemPrompt);
    return response.trim();
  }

  // Helper methods for fallback parsing
  private createFallbackIntent(prompt: string): ParsedIntent {
    const lowerPrompt = prompt.toLowerCase();

    // Detect if it's a simple query
    const isSimpleQuery =
      lowerPrompt.includes("list") ||
      lowerPrompt.includes("show") ||
      lowerPrompt.includes("get") ||
      lowerPrompt.includes("find") ||
      lowerPrompt.includes("recent") ||
      lowerPrompt.includes("my ");

    // Detect specific app
    let specificApp = null;
    if (lowerPrompt.includes("word")) specificApp = "word";
    else if (lowerPrompt.includes("excel")) specificApp = "excel";
    else if (lowerPrompt.includes("powerpoint") || lowerPrompt.includes("ppt"))
      specificApp = "powerpoint";
    else if (lowerPrompt.includes("email") || lowerPrompt.includes("outlook"))
      specificApp = "outlook";
    else if (lowerPrompt.includes("teams")) specificApp = "teams";
    else if (lowerPrompt.includes("onenote")) specificApp = "onenote";

    return {
      primaryGoal:
        prompt.length > 100 ? prompt.substring(0, 100) + "..." : prompt,
      secondaryGoals: [],
      dataRequirements: specificApp
        ? [`${specificApp} files`]
        : ["Available documents"],
      outputRequirements: isSimpleQuery
        ? ["List of items"]
        : ["Processed results"],
      stakeholders: [],
      urgency: "medium",
      context: {
        timeframe: "immediate",
        scope: isSimpleQuery ? "focused" : "comprehensive",
        format: "professional",
      },
      executionType: isSimpleQuery ? "simple" : "complex",
      specificApp,
    };
  }

  private createFallbackPlan(intent: ParsedIntent): WorkflowPlan {
    const actions: WorkflowAction[] = [];

    if (intent.executionType === "simple" && intent.specificApp) {
      // Simple query - just one action
      actions.push({
        action: "list",
        app: intent.specificApp,
        description: `Get ${intent.specificApp} files`,
        priority: 1,
        required: true,
        parameters: { filter: "recent", count: 20 },
      });
    } else {
      // Complex workflow - multiple actions
      if (
        intent.dataRequirements.some((req) =>
          req.toLowerCase().includes("excel")
        )
      ) {
        actions.push({
          action: "analyze",
          app: "excel",
          description: "Analyze Excel data",
          priority: 1,
          required: true,
        });
      }

      if (
        intent.outputRequirements.some((req) =>
          req.toLowerCase().includes("report")
        )
      ) {
        actions.push({
          action: "create",
          app: "word",
          description: "Create report document",
          priority: 2,
          required: true,
        });
      }

      if (intent.stakeholders.length > 0) {
        actions.push({
          action: "send",
          app: "outlook",
          description: "Send results to stakeholders",
          priority: 3,
          required: true,
        });
      }
    }

    return {
      intent: intent.primaryGoal,
      summary:
        intent.executionType === "simple"
          ? "Simple query execution"
          : "Multi-step workflow",
      actions:
        actions.length > 0
          ? actions
          : [
              {
                action: "list",
                app: "word",
                description: "Get available documents",
                priority: 1,
                required: true,
              },
            ],
      estimatedTime: intent.executionType === "simple" ? 30 : 300,
      complexity: intent.executionType === "simple" ? "low" : "medium",
      requiredApps: intent.specificApp ? [intent.specificApp] : ["word"],
      dependencies: [],
      focusedExecution: intent.executionType === "simple",
    };
  }
}

// Export singleton instance
export const groqService = new GroqWorkflowService();
