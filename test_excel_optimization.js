// Test script for Excel optimization workflow
import { realExcelProcessor } from "./src/services/realExcelProcessor.js";
import fs from "fs";

async function testExcelOptimization() {
  try {
    console.log("🧪 Testing Excel Optimization Workflow...");

    // Check if sample file exists
    if (!fs.existsSync("./sample_transportation_roster.xlsx")) {
      console.error(
        "❌ Sample Excel file not found. Please run create_sample_excel.py first."
      );
      return;
    }

    console.log("✅ Sample Excel file found");

    // Read the file as a buffer
    const fileBuffer = fs.readFileSync("./sample_transportation_roster.xlsx");

    // Create a File-like object for testing
    const file = new File([fileBuffer], "sample_transportation_roster.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    console.log("📊 Parsing Excel file...");
    const parsedData = await realExcelProcessor.parseExcelFile(file);

    console.log(`✅ Parsed data:`);
    console.log(`  - Drivers: ${parsedData.drivers.length}`);
    console.log(`  - Vehicles: ${parsedData.vehicles.length}`);
    console.log(`  - Routes: ${parsedData.routes.length}`);

    console.log("🔄 Running optimization...");
    const optimizationResult = await realExcelProcessor.optimizeRoster(
      parsedData.drivers,
      parsedData.vehicles,
      parsedData.routes
    );

    console.log("✅ Optimization completed!");
    console.log(`📈 Results:`);
    console.log(
      `  - Cost savings: $${optimizationResult.metrics.cost_savings.toFixed(2)}`
    );
    console.log(
      `  - Efficiency improvement: ${optimizationResult.metrics.efficiency_improvement.toFixed(
        1
      )}%`
    );
    console.log(
      `  - Conflicts resolved: ${optimizationResult.metrics.conflicts_resolved}`
    );
    console.log(`  - Changes made: ${optimizationResult.changes.length}`);

    if (optimizationResult.changes.length > 0) {
      console.log("\n📋 Key changes:");
      optimizationResult.changes.slice(0, 3).forEach((change, i) => {
        console.log(`  ${i + 1}. ${change.description}`);
      });
    }

    if (optimizationResult.warnings.length > 0) {
      console.log("\n⚠️ Warnings:");
      optimizationResult.warnings.slice(0, 2).forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
    }

    console.log(
      "\n🎉 Excel optimization workflow test completed successfully!"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  }
}

// Run the test
testExcelOptimization();
