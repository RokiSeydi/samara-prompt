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
      let endpoint = "/me/drive/root/children";
      if (filter) {
        endpoint += `?$filter=${filter}`;
      }

      const response = await this.client.api(endpoint).get();
      return response.value || [];
    } catch (error) {
      console.error("Error getting files:", error);
      throw error;
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

      // Ensure proper file extension
      const fileName = name.endsWith(".docx") ? name : `${name}.docx`;

      console.log(`📝 Creating file with name: ${fileName}`);

      // Create an empty Word document using Graph API
      const file = await this.client.api("/me/drive/root/children").post({
        name: fileName,
        file: {
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
        "@microsoft.graph.conflictBehavior": "rename",
      });

      console.log(`✅ Word file shell created: ${file.name} (ID: ${file.id})`);

      try {
        // Use Microsoft Graph Word API to add content properly
        console.log(`� Adding content using Word API...`);

        // Split content into paragraphs
        const paragraphs = content
          .split("\n")
          .filter((p) => p.trim().length > 0);

        // Insert paragraphs using HTML format
        for (const paragraph of paragraphs) {
          if (paragraph.trim()) {
            // Word documents don't support the Excel workbook API - this was incorrect
            console.log(`📝 Creating Word content using HTML format...`);
            const htmlContent = this.generateWordHTMLContent(content);
            await this.client
              .api(`/me/drive/items/${file.id}/content`)
              .put(htmlContent);
            break; // Only need to do this once, not per paragraph
          }
        }

        console.log(`✅ Word document created with proper formatting`);
      } catch (wordApiError) {
        console.warn(
          `⚠️ Word API approach failed, trying RTF format:`,
          wordApiError
        );

        // Fallback: Create RTF content that Word can handle better
        const rtfContent = this.generateWordRTFContent(content);
        await this.client
          .api(`/me/drive/items/${file.id}/content`)
          .put(rtfContent);

        console.log(`✅ Word document created with RTF content (fallback)`);
      }

      console.log(`✅ Content uploaded successfully! File is ready.`);
      console.log(`🔗 File can be accessed at: ${file.webUrl}`);

      return file.id;
    } catch (error) {
      console.error("❌ Error creating Word document:", error);
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

  // Generate dummy financial data
  generateDummyFinancialData(): any[][] {
    const headers = ["Date", "Category", "Amount", "Description", "Status"];
    const data = [headers];

    const categories = [
      "Revenue",
      "Expenses",
      "Marketing",
      "Operations",
      "Salaries",
    ];
    const descriptions = [
      "Q4 Sales Revenue",
      "Office Rent",
      "Digital Marketing Campaign",
      "Software Licenses",
      "Employee Salaries",
      "Client Payment",
      "Utilities",
      "Travel Expenses",
      "Equipment Purchase",
    ];

    // Generate 20 rows of dummy data
    for (let i = 0; i < 20; i++) {
      const date = new Date(2024, 0, 1 + i * 5).toLocaleDateString();
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const amount = (Math.random() * 10000 + 1000).toFixed(2);
      const description =
        descriptions[Math.floor(Math.random() * descriptions.length)];
      const status = Math.random() > 0.2 ? "Approved" : "Pending";

      data.push([date, category, `$${amount}`, description, status]);
    }

    return data;
  }

  // ==================== EXCEL ANALYSIS & FORMULAS ====================

  async analyzeExcelData(fileId: string, columnName?: string): Promise<{
    statistics: {
      best: any;
      worst: any;
      average: number;
      sum: number;
      count: number;
      median: number;
    };
    data: any[][];
    columnIndex: number;
    columnName: string;
  } | null> {
    try {
      console.log(`📊 Analyzing Excel data in file: ${fileId}`);
      
      const workbook = await this.readExcelWorkbook(fileId);
      
      // Find the worksheet with the most data
      let targetWorksheet = workbook.worksheets[0];
      for (const ws of workbook.worksheets) {
        if (ws.data && ws.data.length > targetWorksheet.data.length) {
          targetWorksheet = ws;
        }
      }
      
      if (!targetWorksheet.data || targetWorksheet.data.length === 0) {
        console.log("No data found in Excel file");
        return null;
      }
      
      console.log(`📊 Analyzing worksheet: ${targetWorksheet.name} with ${targetWorksheet.data.length} rows`);
      
      // Get headers (first row)
      const headers = targetWorksheet.data[0] || [];
      const dataRows = targetWorksheet.data.slice(1); // Skip header row
      
      // Find the column to analyze
      let columnIndex = -1;
      let analysisColumnName = "Value";
      
      if (columnName) {
        // User specified a column name
        columnIndex = headers.findIndex(header => 
          header && header.toString().toLowerCase().includes(columnName.toLowerCase())
        );
        if (columnIndex >= 0) {
          analysisColumnName = headers[columnIndex].toString();
        }
      }
      
      // If no column specified or found, find the first numeric column
      if (columnIndex === -1) {
        for (let i = 0; i < headers.length; i++) {
          const columnValues = dataRows.map(row => row[i]).filter(val => val != null);
          const numericValues = columnValues.filter(val => !isNaN(Number(val)));
          
          if (numericValues.length > columnValues.length * 0.5) { // At least 50% numeric
            columnIndex = i;
            analysisColumnName = headers[i] ? headers[i].toString() : `Column ${i + 1}`;
            break;
          }
        }
      }
      
      if (columnIndex === -1) {
        console.log("No numeric column found for analysis");
        return null;
      }
      
      console.log(`📊 Analyzing column: ${analysisColumnName} (index ${columnIndex})`);
      
      // Extract numeric values from the target column
      const columnValues = dataRows
        .map(row => row[columnIndex])
        .filter(val => val != null && !isNaN(Number(val)))
        .map(val => Number(val));
      
      if (columnValues.length === 0) {
        console.log("No numeric values found in target column");
        return null;
      }
      
      console.log(`📊 Found ${columnValues.length} numeric values to analyze`);
      
      // Calculate statistics
      const sortedValues = [...columnValues].sort((a, b) => a - b);
      const sum = columnValues.reduce((acc, val) => acc + val, 0);
      const average = sum / columnValues.length;
      const median = sortedValues.length % 2 === 0
        ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
        : sortedValues[Math.floor(sortedValues.length / 2)];
      
      const statistics = {
        best: Math.max(...columnValues),
        worst: Math.min(...columnValues),
        average: Math.round(average * 100) / 100, // Round to 2 decimal places
        sum: Math.round(sum * 100) / 100,
        count: columnValues.length,
        median: Math.round(median * 100) / 100
      };
      
      console.log(`📊 Analysis complete:`, statistics);
      
      return {
        statistics,
        data: targetWorksheet.data,
        columnIndex,
        columnName: analysisColumnName
      };
      
    } catch (error) {
      console.error("Error analyzing Excel data:", error);
      return null;
    }
  }

  async analyzeExcelFilesInFolder(folderName: string, columnName?: string): Promise<{
    summary: {
      best: any;
      worst: any;
      average: number;
      totalFiles: number;
      processedFiles: number;
    };
    fileResults: Array<{
      fileName: string;
      statistics: any;
      columnName: string;
    }>;
  } | null> {
    try {
      console.log(`📊 Analyzing Excel files in folder: "${folderName}"`);
      
      const excelFiles = await this.getExcelFilesInFolder(folderName);
      if (excelFiles.length === 0) {
        console.log(`No Excel files found in folder "${folderName}"`);
        return null;
      }
      
      const fileResults: Array<{
        fileName: string;
        statistics: any;
        columnName: string;
      }> = [];
      
      const allValues: number[] = [];
      
      for (const file of excelFiles.slice(0, 10)) { // Limit to 10 files for performance
        try {
          console.log(`📊 Analyzing file: ${file.name}`);
          
          const analysis = await this.analyzeExcelData(file.id, columnName);
          if (analysis) {
            fileResults.push({
              fileName: file.name,
              statistics: analysis.statistics,
              columnName: analysis.columnName
            });
            
            // Collect all values for overall statistics
            const fileData = await this.readExcelWorkbook(file.id);
            for (const worksheet of fileData.worksheets) {
              if (worksheet.data && worksheet.data.length > 1) {
                const dataRows = worksheet.data.slice(1);
                const numericValues = dataRows
                  .map(row => row[analysis.columnIndex])
                  .filter(val => val != null && !isNaN(Number(val)))
                  .map(val => Number(val));
                allValues.push(...numericValues);
              }
            }
            
            console.log(`✅ Successfully analyzed: ${file.name}`);
          }
        } catch (error) {
          console.warn(`❌ Failed to analyze ${file.name}:`, error);
        }
      }
      
      if (fileResults.length === 0) {
        console.log("No files could be analyzed");
        return null;
      }
      
      // Calculate overall summary statistics
      const overallAverage = allValues.length > 0 
        ? allValues.reduce((acc, val) => acc + val, 0) / allValues.length 
        : 0;
      
      const summary = {
        best: allValues.length > 0 ? Math.max(...allValues) : 0,
        worst: allValues.length > 0 ? Math.min(...allValues) : 0,
        average: Math.round(overallAverage * 100) / 100,
        totalFiles: excelFiles.length,
        processedFiles: fileResults.length
      };
      
      console.log(`📊 Folder analysis complete:`, summary);
      
      return {
        summary,
        fileResults
      };
      
    } catch (error) {
      console.error(`Error analyzing Excel files in folder "${folderName}":`, error);
      return null;
    }
  }

  // ==================== FOLDER SEARCH OPERATIONS ====================

  async findFolderByName(folderName: string): Promise<any | null> {
    try {
      console.log(`📁 Searching for folder named: "${folderName}"`);
      
      // First, search in the root directory
      const rootFiles = await this.client.api("/me/drive/root/children").get();
      const folders = rootFiles.value.filter((item: any) => 
        item.folder && item.name.toLowerCase().includes(folderName.toLowerCase())
      );
      
      if (folders.length > 0) {
        console.log(`📁 Found folder in root: ${folders[0].name}`);
        return folders[0];
      }
      
      // If not found in root, search recursively
      console.log(`📁 Folder not found in root, searching subdirectories...`);
      const allFolders = await this.getAllFoldersRecursive();
      const matchingFolder = allFolders.find((folder: any) => 
        folder.name.toLowerCase().includes(folderName.toLowerCase())
      );
      
      if (matchingFolder) {
        console.log(`📁 Found folder: ${matchingFolder.name}`);
        return matchingFolder;
      }
      
      console.log(`📁 No folder found with name containing: "${folderName}"`);
      return null;
    } catch (error) {
      console.error(`Error searching for folder "${folderName}":`, error);
      return null;
    }
  }

  async getAllFoldersRecursive(path: string = "/me/drive/root/children"): Promise<any[]> {
    try {
      const response = await this.client.api(path).get();
      let allFolders: any[] = [];
      
      const items = response.value || [];
      
      for (const item of items) {
        if (item.folder) {
          allFolders.push(item);
          if (item.folder.childCount > 0) {
            try {
              const subFolders = await this.getAllFoldersRecursive(`/me/drive/items/${item.id}/children`);
              allFolders.push(...subFolders);
            } catch (error) {
              console.warn(`⚠️ Could not access subfolder ${item.name}:`, error.message);
            }
          }
        }
      }
      
      return allFolders;
    } catch (error) {
      console.error("Error in recursive folder search:", error);
      return [];
    }
  }

  async getFilesInFolder(folderId: string): Promise<any[]> {
    try {
      console.log(`📁 Getting files in folder ID: ${folderId}`);
      const response = await this.client.api(`/me/drive/items/${folderId}/children`).get();
      const files = response.value.filter((item: any) => item.file) || [];
      
      console.log(`📁 Found ${files.length} files in folder`);
      return files;
    } catch (error) {
      console.error(`Error getting files in folder ${folderId}:`, error);
      throw error;
    }
  }

  async getExcelFilesInFolder(folderName: string): Promise<any[]> {
    try {
      console.log(`📊 Getting Excel files in folder: "${folderName}"`);
      
      const folder = await this.findFolderByName(folderName);
      if (!folder) {
        console.log(`📁 Folder "${folderName}" not found`);
        return [];
      }
      
      const allFiles = await this.getFilesInFolder(folder.id);
      const excelFiles = allFiles.filter(file => 
        file.name && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))
      );
      
      console.log(`📊 Found ${excelFiles.length} Excel files in folder "${folder.name}"`);
      return excelFiles;
    } catch (error) {
      console.error(`Error getting Excel files in folder "${folderName}":`, error);
      return [];
    }
  }

  async getAllFilesInFolder(folderName: string): Promise<any[]> {
    try {
      console.log(`📁 Getting all files in folder: "${folderName}"`);
      
      const folder = await this.findFolderByName(folderName);
      if (!folder) {
        console.log(`📁 Folder "${folderName}" not found`);
        return [];
      }
      
      const files = await this.getFilesInFolder(folder.id);
      console.log(`📁 Found ${files.length} files in folder "${folder.name}"`);
      return files;
    } catch (error) {
      console.error(`Error getting files in folder "${folderName}":`, error);
      return [];
    }
  }

  // ==================== FILE INFO OPERATIONS ====================

  async getFileInfo(fileId: string): Promise<any> {
    try {
      return await this.client.api(`/me/drive/items/${fileId}`).get();
    } catch (error) {
      console.error(`Error getting file info for ${fileId}:`, error);
      throw error;
    }
  }
}
