import { Client } from "@microsoft/microsoft-graph-client";

// Custom authentication provider for MSAL
class MsalAuthProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken;
  }
}

export interface ExcelWorkbook {
  id: string;
  name: string;
  worksheets: ExcelWorksheet[];
}

export interface ExcelWorksheet {
  id: string;
  name: string;
  data: any[][];
}

export interface WordDocument {
  id: string;
  name: string;
  content: string;
}

export interface PowerPointPresentation {
  id: string;
  name: string;
  slides: PowerPointSlide[];
}

export interface PowerPointSlide {
  id: string;
  title: string;
  content: string;
}

export class GraphApiService {
  private client: Client;

  constructor(accessToken: string) {
    const authProvider = new MsalAuthProvider(accessToken);
    this.client = Client.initWithMiddleware({ authProvider });
  }

  // ==================== FILE OPERATIONS ====================

  async getFiles(filter?: string): Promise<any[]> {
    try {
      console.log("🔍 DEBUG: Getting files with filter:", filter);

      // Strategy 1: Try with filter first
      if (filter) {
        try {
          const endpoint = `/me/drive/root/children?$top=50&$filter=${encodeURIComponent(
            filter
          )}`;
          console.log("🔍 DEBUG: Trying filtered endpoint:", endpoint);

          const response = await this.client.api(endpoint).get();
          console.log(
            "✅ DEBUG: Filtered response success:",
            response.value?.length || 0,
            "files"
          );
          return response.value || [];
        } catch (filterError) {
          console.warn(
            "⚠️ Filtered search failed, trying unfiltered:",
            filterError.message
          );
        }
      }

      // Strategy 2: Get all files and filter manually
      console.log("🔍 DEBUG: Trying unfiltered approach...");
      const response = await this.client
        .api("/me/drive/root/children?$top=50")
        .get();
      console.log(
        "✅ DEBUG: Unfiltered response:",
        response.value?.length || 0,
        "total files"
      );

      const allFiles = response.value || [];

      if (!filter) {
        return allFiles;
      }

      // Apply manual filtering
      let filteredFiles = [];
      if (filter.includes("endswith(name,'.xlsx')")) {
        filteredFiles = allFiles.filter(
          (file) =>
            file.name?.toLowerCase().endsWith(".xlsx") ||
            file.name?.toLowerCase().endsWith(".xls")
        );
        console.log(
          "✅ DEBUG: Manually filtered Excel files:",
          filteredFiles.length
        );
      } else if (filter.includes("endswith(name,'.docx')")) {
        filteredFiles = allFiles.filter(
          (file) =>
            file.name?.toLowerCase().endsWith(".docx") ||
            file.name?.toLowerCase().endsWith(".doc")
        );
        console.log(
          "✅ DEBUG: Manually filtered Word files:",
          filteredFiles.length
        );
      } else if (filter.includes("endswith(name,'.pptx')")) {
        filteredFiles = allFiles.filter(
          (file) =>
            file.name?.toLowerCase().endsWith(".pptx") ||
            file.name?.toLowerCase().endsWith(".ppt")
        );
        console.log(
          "✅ DEBUG: Manually filtered PowerPoint files:",
          filteredFiles.length
        );
      } else {
        filteredFiles = allFiles;
      }

      return filteredFiles;
    } catch (error) {
      console.error("❌ Error getting files:", error);
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        status: error.status,
      });

      // Return empty array instead of throwing for better user experience
      console.log("⚠️ Returning empty array due to file access error");
      return [];
    }
  }

  async getExcelFiles(): Promise<any[]> {
    return this.getFiles("endswith(name,'.xlsx') or endswith(name,'.xls')");
  }

  async getWordFiles(): Promise<any[]> {
    return this.getFiles("endswith(name,'.docx') or endswith(name,'.doc')");
  }

  async getPowerPointFiles(): Promise<any[]> {
    return this.getFiles("endswith(name,'.pptx') or endswith(name,'.ppt')");
  }

  // ==================== EXCEL OPERATIONS ====================

  async readExcelWorkbook(fileId: string): Promise<ExcelWorkbook> {
    try {
      // Get file info first
      const file = await this.client.api(`/me/drive/items/${fileId}`).get();

      // Get worksheets
      const worksheetsResponse = await this.client
        .api(`/me/drive/items/${fileId}/workbook/worksheets`)
        .get();
      const worksheets: ExcelWorksheet[] = [];

      for (const ws of worksheetsResponse.value) {
        try {
          // Get used range for each worksheet
          const range = await this.client
            .api(
              `/me/drive/items/${fileId}/workbook/worksheets/${ws.id}/usedRange`
            )
            .get();

          worksheets.push({
            id: ws.id,
            name: ws.name,
            data: range.values || [],
          });
        } catch (error) {
          console.warn(`Could not read worksheet ${ws.name}:`, error);
          worksheets.push({
            id: ws.id,
            name: ws.name,
            data: [],
          });
        }
      }

      return {
        id: fileId,
        name: file.name || "Unknown",
        worksheets,
      };
    } catch (error) {
      console.error("Error reading Excel workbook:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        status: error.status,
        fileId,
      });

      // Add more specific error information
      if (error.status === 423 || error.code === "notAllowed") {
        const enhancedError = new Error(
          `File is locked or in use: ${error.message}`
        ) as any;
        enhancedError.code = "Locked";
        enhancedError.status = 423;
        throw enhancedError;
      }

      throw error;
    }
  }

  async createExcelWorkbook(
    name: string,
    data: { sheetName: string; data: any[][] }[]
  ): Promise<string> {
    try {
      console.log(`📊 Creating Excel workbook: ${name}`);
      console.log(`📊 Data sheets to create:`, data.length);

      // Ensure proper file extension
      const fileName = name.endsWith(".xlsx") ? name : `${name}.xlsx`;

      // Create an empty Excel file first using Graph API
      const file = await this.client.api("/me/drive/root/children").post({
        name: fileName,
        file: {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        "@microsoft.graph.conflictBehavior": "rename",
      });

      console.log(`✅ Excel file shell created: ${file.name} (ID: ${file.id})`);

      // Now create a proper Excel workbook using the Excel API
      try {
        // Create a session for the workbook
        const session = await this.client
          .api(`/me/drive/items/${file.id}/workbook/createSession`)
          .post({
            persistChanges: true,
          });

        console.log(`📊 Excel session created: ${session.id}`);

        // Add headers for session requests
        const sessionHeaders = {
          "workbook-session-id": session.id,
        };

        // Process each data sheet
        for (let i = 0; i < data.length; i++) {
          const sheet = data[i];
          let worksheetName = sheet.sheetName || `Sheet${i + 1}`;

          // Excel worksheet names have restrictions - remove invalid characters
          worksheetName = worksheetName
            .replace(/[\\\/\?\*\[\]]/g, "_")
            .substring(0, 31);

          console.log(`📊 Creating worksheet: ${worksheetName}`);

          // Create or get the worksheet
          let worksheet;
          if (i === 0) {
            // Rename the default sheet
            worksheet = await this.client
              .api(`/me/drive/items/${file.id}/workbook/worksheets/Sheet1`)
              .headers(sessionHeaders)
              .patch({
                name: worksheetName,
              });
          } else {
            // Add a new worksheet
            worksheet = await this.client
              .api(`/me/drive/items/${file.id}/workbook/worksheets`)
              .headers(sessionHeaders)
              .post({
                name: worksheetName,
              });
          }

          // Add data to the worksheet if we have any
          if (sheet.data && sheet.data.length > 0) {
            const rows = sheet.data.length;
            const cols = Math.max(...sheet.data.map((row) => row.length));

            // Convert the range to Excel format (e.g., A1:D10)
            const endCol = String.fromCharCode(65 + cols - 1); // A, B, C, etc.
            const range = `A1:${endCol}${rows}`;

            console.log(`📊 Adding data to range ${range} in ${worksheetName}`);

            // Update the range with data
            await this.client
              .api(
                `/me/drive/items/${file.id}/workbook/worksheets/${worksheet.id}/range(address='${range}')`
              )
              .headers(sessionHeaders)
              .patch({
                values: sheet.data,
              });

            // Auto-fit columns for better display
            await this.client
              .api(
                `/me/drive/items/${file.id}/workbook/worksheets/${worksheet.id}/range(address='${range}')/format/autofitColumns`
              )
              .headers(sessionHeaders)
              .post({});
          }
        }

        // Close the session
        await this.client
          .api(`/me/drive/items/${file.id}/workbook/closeSession`)
          .headers(sessionHeaders)
          .post({});

        console.log(
          `✅ Excel workbook created successfully with ${data.length} sheets`
        );
      } catch (excelError) {
        console.warn(
          `⚠️ Excel API failed, creating simple workbook:`,
          excelError
        );

        // Fallback: Create a simple CSV file that Excel can open
        const csvContent = this.generateCSVContent(data);
        await this.client
          .api(`/me/drive/items/${file.id}/content`)
          .put(csvContent);
      }

      return file.id;
    } catch (error) {
      console.error("❌ Error creating Excel workbook:", error);
      throw error;
    }
  }

  async createWordDocument(name: string, content: string): Promise<string> {
    try {
      console.log(`📝 Creating Word document: ${name}`);
      console.log(`📝 Content length: ${content.length} characters`);

      // Ensure proper file extension - but create as .txt for now to ensure it works
      const baseFileName = name.endsWith(".docx")
        ? name.replace(".docx", "")
        : name;
      const fileName = `${baseFileName}.txt`; // Create as text file that's guaranteed to work

      console.log(`📝 Creating text file with name: ${fileName}`);

      // Create the text content with proper formatting
      const formattedContent = this.formatContentForTextFile(content);

      // Create the file directly with content
      const file = await this.client.api("/me/drive/root/children").post({
        name: fileName,
        file: {},
        "@microsoft.graph.conflictBehavior": "rename",
      });

      console.log(`✅ Text file shell created: ${file.name} (ID: ${file.id})`);

      // Upload the content using browser-compatible method
      // Convert string to Uint8Array (browser equivalent of Buffer)
      const encoder = new TextEncoder();
      const textData = encoder.encode(formattedContent);

      await this.client.api(`/me/drive/items/${file.id}/content`).put(textData);

      console.log(`✅ Document created successfully as text file`);
      console.log(
        `📝 Note: Created as .txt file for reliability - can be opened in Word or converted`
      );
      console.log(`🔗 File can be accessed at: ${file.webUrl}`);

      return file.id;
    } catch (error) {
      console.error("❌ Error creating document:", error);
      throw error;
    }
  }

  async findExcelFileWithData(
    searchTerm?: string
  ): Promise<{ file: any; data: any[][] } | null> {
    try {
      const excelFiles = await this.getExcelFiles();

      if (excelFiles.length === 0) {
        console.log("No Excel files found");
        return null;
      }

      // If searching for specific term, filter files
      let targetFiles = excelFiles;
      if (searchTerm) {
        targetFiles = excelFiles.filter((file) =>
          file.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // If no specific files found, use the most recent Excel file
      if (targetFiles.length === 0) {
        targetFiles = [excelFiles[0]]; // Most recent file
      }

      // Try to read data from the first available file
      for (const file of targetFiles) {
        try {
          const workbook = await this.readExcelWorkbook(file.id);

          // Find worksheet with data
          for (const worksheet of workbook.worksheets) {
            if (worksheet.data && worksheet.data.length > 0) {
              console.log(
                `📊 Found data in ${file.name}, worksheet: ${worksheet.name}`
              );
              return {
                file: file,
                data: worksheet.data,
              };
            }
          }
        } catch (error) {
          console.warn(`Could not read ${file.name}:`, error);
        }
      }

      console.log("No Excel files with readable data found");
      return null;
    } catch (error) {
      console.error("Error finding Excel file with data:", error);
      return null;
    }
  }

  // ==================== EMAIL OPERATIONS ====================

  async sendEmail(
    to: string[],
    subject: string,
    body: string,
    attachments?: string[]
  ): Promise<void> {
    try {
      const message: any = {
        subject: subject,
        body: {
          contentType: "HTML",
          content: body,
        },
        toRecipients: to.map((email) => ({
          emailAddress: { address: email },
        })),
      };

      if (attachments && attachments.length > 0) {
        message.attachments = [];
        for (const fileId of attachments) {
          try {
            const file = await this.client
              .api(`/me/drive/items/${fileId}`)
              .get();
            const content = await this.client
              .api(`/me/drive/items/${fileId}/content`)
              .get();

            message.attachments.push({
              "@odata.type": "#microsoft.graph.fileAttachment",
              name: file.name,
              contentBytes: content,
            });
          } catch (error) {
            console.warn(`Could not attach file ${fileId}:`, error);
          }
        }
      }

      await this.client.api("/me/sendMail").post({ message });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  // ==================== CALENDAR OPERATIONS ====================

  async createMeeting(
    subject: string,
    start: Date,
    end: Date,
    attendees: string[],
    body?: string
  ): Promise<string> {
    try {
      const event = await this.client.api("/me/events").post({
        subject: subject,
        body: {
          contentType: "HTML",
          content: body || "",
        },
        start: {
          dateTime: start.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: "UTC",
        },
        attendees: attendees.map((email) => ({
          emailAddress: { address: email },
          type: "required",
        })),
        isOnlineMeeting: true,
        onlineMeetingProvider: "teamsForBusiness",
      });

      return event.id;
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  private generateCSVContent(
    data: { sheetName: string; data: any[][] }[]
  ): string {
    // Generate CSV content that Excel can properly open
    let content = "";

    // For multiple sheets, we'll put all data in one CSV with sheet separators
    for (let i = 0; i < data.length; i++) {
      const sheet = data[i];

      if (i > 0) content += "\n\n"; // Separator between sheets

      if (data.length > 1) {
        content += `"=== ${sheet.sheetName} ==="\n`;
      }

      for (const row of sheet.data) {
        // Properly escape CSV values
        const csvRow = row
          .map((cell) => {
            const cellStr = String(cell || "");
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (
              cellStr.includes(",") ||
              cellStr.includes('"') ||
              cellStr.includes("\n")
            ) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",");

        content += csvRow + "\n";
      }
    }

    return content;
  }

  private generateExcelContent(
    data: { sheetName: string; data: any[][] }[]
  ): string {
    // Legacy method - keeping for compatibility but not used
    let content = "";

    for (const sheet of data) {
      content += `Sheet: ${sheet.sheetName}\n`;
      for (const row of sheet.data) {
        content += row.join("\t") + "\n";
      }
      content += "\n";
    }

    return content;
  }

  private generateWordRTFContent(content: string): string {
    // Generate RTF (Rich Text Format) content that Word can handle better
    const paragraphs = content.split("\n").filter((p) => p.trim().length > 0);

    let rtfContent = "{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}";
    rtfContent += "{\\colortbl;\\red0\\green0\\blue0;}";
    rtfContent += "\\f0\\fs24"; // Font 0, size 12pt (24 half-points)

    for (const paragraph of paragraphs) {
      const escapedText = paragraph
        .replace(/\\/g, "\\\\")
        .replace(/{/g, "\\{")
        .replace(/}/g, "\\}");

      // Check if it looks like a header (ALL CAPS or ends with colon)
      if (paragraph.toUpperCase() === paragraph || paragraph.endsWith(":")) {
        rtfContent += `\\par\\b ${escapedText}\\b0\\par`;
      } else {
        rtfContent += `\\par ${escapedText}`;
      }
    }

    rtfContent += "}";
    return rtfContent;
  }

  private generateWordHTMLContent(content: string): string {
    // Convert plain text content to HTML that Word Online can edit properly
    const paragraphs = content.split("\n").filter((p) => p.trim().length > 0);

    let htmlContent = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Document</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
      <w:DoNotPromptForConvert/>
      <w:DoNotShowInsertionsAndDeletions/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.4; margin: 1in; }
    h1 { font-size: 18pt; font-weight: bold; margin-bottom: 12pt; color: #2B579A; }
    h2 { font-size: 14pt; font-weight: bold; margin-bottom: 10pt; color: #2B579A; }
    h3 { font-size: 12pt; font-weight: bold; margin-bottom: 8pt; color: #2B579A; }
    p { margin-bottom: 6pt; }
    .header { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 20pt; }
  </style>
</head>
<body>`;

    // Process content and convert to proper HTML
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim();

      // Detect headers and format accordingly
      if (paragraph.endsWith(":") || paragraph.toUpperCase() === paragraph) {
        // Likely a header
        if (i === 0) {
          htmlContent += `  <div class="header">${this.escapeHtml(
            paragraph
          )}</div>\n`;
        } else if (paragraph.length < 50) {
          htmlContent += `  <h2>${this.escapeHtml(paragraph)}</h2>\n`;
        } else {
          htmlContent += `  <h3>${this.escapeHtml(paragraph)}</h3>\n`;
        }
      } else {
        // Regular paragraph
        htmlContent += `  <p>${this.escapeHtml(paragraph)}</p>\n`;
      }
    }

    htmlContent += `
</body>
</html>`;

    return htmlContent;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private generateWordPlainTextContent(content: string): string {
    // Generate plain text with proper formatting for Word import
    const paragraphs = content.split("\n").filter((p) => p.trim().length > 0);

    let formattedContent = "";

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (trimmed) {
        // Add proper line endings that Word recognizes
        formattedContent += trimmed + "\r\n\r\n";
      }
    }

    return formattedContent;
  }

  private generateWordDocxContent(content: string): Buffer {
    // Generate a minimal but properly formatted DOCX file
    // This creates a basic Open XML document that Word Online will recognize as editable

    const paragraphs = content.split("\n").filter((p) => p.trim().length > 0);

    // Create the document XML content
    let documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>`;

    // Add each paragraph
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        // Escape XML special characters
        const escapedText = paragraph
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

        // Check if it looks like a header
        if (paragraph.toUpperCase() === paragraph || paragraph.endsWith(":")) {
          documentXml += `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>${escapedText}</w:t>
      </w:r>
    </w:p>`;
        } else {
          documentXml += `
    <w:p>
      <w:r>
        <w:t>${escapedText}</w:t>
      </w:r>
    </w:p>`;
        }
      }
    }

    documentXml += `
  </w:body>
</w:document>`;

    // For now, return the XML as a buffer (this is a simplified approach)
    // In a real implementation, you'd create a proper ZIP file with all DOCX components
    return Buffer.from(documentXml, "utf-8");
  }

  // Generate dummy financial data with file-specific variations
  generateDummyFinancialData(fileNumber?: number): any[][] {
    const headers = ["Date", "Category", "Amount", "Description", "Status"];
    const data = [headers];

    // Create different data sets based on file number for better merge testing
    const fileVariations = {
      1: {
        categories: ["Q1 Revenue", "Sales", "Commission", "Bonuses", "Refunds"],
        descriptions: [
          "January Sales Target",
          "February Online Revenue",
          "March Commission Payment",
          "Customer Refund Processing",
          "Quarterly Bonus Distribution",
          "Online Store Sales",
          "Retail Store Revenue",
          "Wholesale Contract",
          "Service Fee Income",
          "Product Return Credit",
        ],
        baseAmount: 5000,
        dateOffset: 0,
        multiplier: 1.0,
      },
      2: {
        categories: [
          "Q2 Expenses",
          "Operations",
          "Marketing",
          "Office",
          "Travel",
        ],
        descriptions: [
          "Office Rent April",
          "Marketing Campaign May",
          "June Operations Cost",
          "Business Travel Expense",
          "Office Supplies Purchase",
          "Software License Renewal",
          "Utility Bills Payment",
          "Insurance Premium",
          "Equipment Maintenance",
          "Staff Training Program",
        ],
        baseAmount: 3000,
        dateOffset: 90,
        multiplier: 0.7,
      },
      3: {
        categories: [
          "Q3 Analysis",
          "Investments",
          "Assets",
          "Depreciation",
          "Capital",
        ],
        descriptions: [
          "July Investment Portfolio",
          "August Asset Acquisition",
          "September Capital Gains",
          "Equipment Depreciation",
          "Stock Market Investment",
          "Real Estate Purchase",
          "Technology Infrastructure",
          "Market Growth Analysis",
          "Capital Equipment Lease",
          "Investment Returns",
        ],
        baseAmount: 8000,
        dateOffset: 180,
        multiplier: 1.5,
      },
    };

    // Default to variation 1 if no file number specified, or cycle through variations
    const variationKey = fileNumber ? ((fileNumber - 1) % 3) + 1 : 1;
    const variation = fileVariations[variationKey];

    // Generate 25 rows of file-specific dummy data with more variance
    for (let i = 0; i < 25; i++) {
      const date = new Date(
        2024,
        0,
        1 + variation.dateOffset + i * 4
      ).toLocaleDateString();
      const category =
        variation.categories[
          Math.floor(Math.random() * variation.categories.length)
        ];
      const baseAmount =
        Math.random() * variation.baseAmount * variation.multiplier + 200;
      const amount = baseAmount.toFixed(2);
      const description =
        variation.descriptions[
          Math.floor(Math.random() * variation.descriptions.length)
        ];
      const status = Math.random() > 0.2 ? "Approved" : "Pending";

      data.push([date, category, `$${amount}`, description, status]);
    }

    // Add a unique summary row to make files easily distinguishable
    data.push(["", "", "", "", ""]);
    data.push([
      "SUMMARY",
      `File Type ${variationKey}`,
      `Total Records: ${data.length - 2}`,
      `Generated: ${new Date().toISOString().split("T")[0]}`,
      "Complete",
    ]);

    return data;
  }

  // Placeholder methods for missing functionality
  async mergeExcelFiles(
    fileIds: string[],
    outputName: string
  ): Promise<string> {
    console.log(`📊 Merging ${fileIds.length} Excel files into ${outputName}`);
    // Create a simple merged file for demo purposes
    const dummyData = [
      ["File", "Sheet", "Rows", "Columns"],
      ["Budget1.xlsx", "Summary", "50", "10"],
      ["Budget2.xlsx", "Details", "30", "8"],
      ["Budget3.xlsx", "Analysis", "25", "12"],
    ];

    return await this.createExcelWorkbook(outputName, [
      { sheetName: "Merged Data", data: dummyData },
    ]);
  }

  async calculateExcelMetrics(fileId: string): Promise<any> {
    console.log(`📈 Calculating metrics for file ${fileId}`);
    return {
      totalRows: 100,
      totalColumns: 10,
      numericColumns: 5,
      averageValue: 1250.75,
      sumTotal: 125075,
      trend: "increasing",
    };
  }

  async readWordDocument(fileId: string): Promise<string> {
    console.log(`📖 Reading Word document ${fileId}`);
    // Return dummy content for demo
    return "This is a sample Word document content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  }

  async createPowerPointPresentation(
    name: string,
    slides: any[]
  ): Promise<string> {
    console.log(`📊 Creating PowerPoint presentation: ${name}`);

    // Create a simple PowerPoint file for demo purposes
    const fileName = name.endsWith(".pptx") ? name : `${name}.pptx`;

    const file = await this.client.api("/me/drive/root/children").post({
      name: fileName,
      file: {
        mimeType:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
      "@microsoft.graph.conflictBehavior": "rename",
    });

    console.log(
      `✅ PowerPoint presentation created: ${file.name} (ID: ${file.id})`
    );
    return file.id;
  }

  // Helper method to format content for text files
  private formatContentForTextFile(content: string): string {
    // Add a header to the text file
    const header = `=== AI Generated Report ===\nGenerated on: ${new Date().toLocaleString()}\n\n`;

    // Format the content with proper line breaks
    const formattedContent = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n\n");

    return header + formattedContent + "\n\n=== End of Report ===";
  }

  async getFileInfo(fileId: string): Promise<any> {
    try {
      return await this.client.api(`/me/drive/items/${fileId}`).get();
    } catch (error) {
      console.error(`Error getting file info for ${fileId}:`, error);
      throw error;
    }
  }

  async findRosterExcelFiles(): Promise<any[]> {
    try {
      console.log("🔍 Looking for roster-specific Excel files...");

      // Get all Excel files first
      const allExcelFiles = await this.getExcelFiles();
      console.log(`📊 Found ${allExcelFiles.length} total Excel files`);

      // Define roster-related keywords to search for
      const rosterKeywords = [
        "roster",
        "driver",
        "schedule",
        "shift",
        "rota",
        "staff",
        "crew",
        "allocation",
        "assignment",
        "timetable",
        "duty",
        "weekly",
        "daily",
        "coverage",
        "manning",
        "personnel",
      ];

      // Filter files by name containing roster-related keywords
      const rosterFiles = allExcelFiles.filter((file) => {
        const fileName = file.name.toLowerCase();
        return rosterKeywords.some((keyword) => fileName.includes(keyword));
      });

      console.log(`🔍 Found ${rosterFiles.length} roster-related Excel files:`);
      rosterFiles.forEach((file) => {
        console.log(`  - ${file.name} (${file.id})`);
      });

      // Sort by last modified date (most recent first)
      rosterFiles.sort((a, b) => {
        const dateA = new Date(a.lastModifiedDateTime || 0);
        const dateB = new Date(b.lastModifiedDateTime || 0);
        return dateB.getTime() - dateA.getTime();
      });

      return rosterFiles;
    } catch (error) {
      console.error("❌ Error finding roster Excel files:", error);
      return [];
    }
  }

  async findFilesByKeywords(keywords: string[]): Promise<any[]> {
    try {
      console.log("🔍 Searching for files with keywords:", keywords);

      const allFiles = await this.getFiles();
      console.log(`📁 Found ${allFiles.length} total files`);

      const matchingFiles = allFiles.filter((file) => {
        const fileName = file.name.toLowerCase();
        return keywords.some((keyword) =>
          fileName.toLowerCase().includes(keyword.toLowerCase())
        );
      });

      console.log(`🔍 Found ${matchingFiles.length} files matching keywords`);
      matchingFiles.forEach((file) => {
        console.log(`  - ${file.name}`);
      });

      return matchingFiles;
    } catch (error) {
      console.error("❌ Error searching files by keywords:", error);
      return [];
    }
  }
}
