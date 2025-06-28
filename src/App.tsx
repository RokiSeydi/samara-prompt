import React from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { msalConfig } from './config/msalConfig';
import { SimplifiedApp } from './components/SimplifiedApp';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <FluentProvider theme={webLightTheme}>
        <SimplifiedApp />
      </FluentProvider>
    </MsalProvider>
  );
}

export default App;