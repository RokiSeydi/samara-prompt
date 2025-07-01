import React from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { msalConfig } from './config/msalConfig';
import { SimplifiedApp } from './components/SimplifiedApp';
import { TransportationDemo } from './components/TransportationDemo';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  // Check if we're in demo mode via URL parameter or environment
  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.get('demo') === 'transportation' || 
                     window.location.pathname.includes('/demo') ||
                     process.env.NODE_ENV === 'development' && urlParams.get('demo') !== null;

  return (
    <MsalProvider instance={msalInstance}>
      <FluentProvider theme={webLightTheme}>
        {isDemoMode ? <TransportationDemo /> : <SimplifiedApp />}
      </FluentProvider>
    </MsalProvider>
  );
}

export default App;