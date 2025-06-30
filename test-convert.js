// Test the convertToWorkflowResults logic

const testSteps = [
  {
    step: "Excel: list",
    status: "completed",
    description: "Test step",
    result:
      "📊 Found 5 Excel files:\n\n1. Budget.xlsx (2MB, modified 01/15/2024)\n2. Sales_Report.xlsx (1MB, modified 01/10/2024)",
    timeElapsed: 1000,
  },
];

function testConvert() {
  const results = [];

  console.log("🔄 🔄 🔄 CONVERT TO WORKFLOW RESULTS CALLED! 🔄 🔄 🔄");
  console.log("🔄 DEBUG: All steps to convert:", testSteps);
  console.log(
    "🔄 DEBUG: Completed steps:",
    testSteps.filter((s) => s.status === "completed")
  );

  // Convert each completed step to a result item
  for (const step of testSteps.filter((s) => s.status === "completed")) {
    console.log("🔄 Converting step to result:", step);

    // Extract app from step name (e.g., "Word: list" -> "word")
    const appMatch = step.step.match(/^([^:]+):/);
    const app = appMatch ? appMatch[1].toLowerCase() : "unknown";

    console.log("🔄 DEBUG: Extracted app:", app, "from step:", step.step);

    // Extract action from step name (e.g., "Word: list" -> "list")
    const actionMatch = step.step.match(/:(.+)$/);
    const action = actionMatch ? actionMatch[1].trim() : step.step;

    console.log("🔄 DEBUG: Extracted action:", action);
    console.log("🔄 DEBUG: Step result:", step.result);

    if (step.result && step.result.length > 0) {
      // Determine result type based on content
      let resultType = "data";
      let title = step.step;
      let description = step.result;

      console.log("🔄 DEBUG: Checking result patterns for:", step.result);
      console.log("🔄 DEBUG: Includes 'Found':", step.result.includes("Found"));
      console.log(
        "🔄 DEBUG: Includes 'documents':",
        step.result.includes("documents")
      );
      console.log("🔄 DEBUG: Includes 'files':", step.result.includes("files"));

      if (
        step.result.includes("Found") &&
        (step.result.includes("documents") || step.result.includes("files"))
      ) {
        console.log("🔄 DEBUG: Matched 'Found' pattern");
        // Extract file count and details
        const fileCountMatch = step.result.match(/Found (\d+)/);
        const fileCount = fileCountMatch ? fileCountMatch[1] : "multiple";

        results.push({
          type: resultType,
          app: app,
          title: `${fileCount} ${
            app.charAt(0).toUpperCase() + app.slice(1)
          } Files`,
          description: step.result,
          quickActions: [],
        });
      } else {
        console.log(
          "🔄 DEBUG: Pattern not matched, checking other patterns..."
        );
      }
    } else {
      console.log("🔄 DEBUG: Step has no result or empty result");
    }
  }

  console.log("✅ DEBUG: Final converted results:", results);
  console.log("✅ DEBUG: Total results count:", results.length);

  return results;
}

testConvert();
