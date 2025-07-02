<<<<<<< HEAD
import { Configuration, PopupRequest, LogLevel } from "@azure/msal-browser";
=======
import type { Configuration, PopupRequest } from "@azure/msal-browser";
import { LogLevel } from "@azure/msal-browser";
>>>>>>> d7fea82 (🚀 Major Enhancement: Real Excel Data Processing, Folder Search & Statistical Analysis)

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: "52c720d1-0e02-45a4-a8e2-792a500c8fab", // Replace with your Azure AD app registration client ID
    authority:
      "https://login.microsoftonline.com/805f4fd4-5f9a-4d09-ba5b-89f0bd790eb1",
    redirectUri: window.location.origin, // Automatically uses current domain
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          console.log(`MSAL ${level}: ${message}`);
        }
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
    },
  },
};

// Enhanced scopes for full Microsoft Graph access
export const loginRequest: PopupRequest = {
  scopes: [
    "User.Read",
    "Files.Read",
    "Files.ReadWrite",
    "Sites.Read.All",
    "Sites.ReadWrite.All",
    "Mail.Send",
    "Mail.ReadWrite",
    "Calendars.ReadWrite",
    "Tasks.ReadWrite",
    // "Group.ReadWrite.All", cant have access to this for now!
    "offline_access",
  ],
};

// Graph API configuration
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphFilesEndpoint: "https://graph.microsoft.com/v1.0/me/drive/root/children",
  graphMailEndpoint: "https://graph.microsoft.com/v1.0/me/sendMail",
  graphCalendarEndpoint: "https://graph.microsoft.com/v1.0/me/events",
  graphTasksEndpoint: "https://graph.microsoft.com/v1.0/me/todo/lists",
};
