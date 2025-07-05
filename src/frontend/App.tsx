import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import HomePage from './HomePage';
import GreenthumbApp from './GreenthumbApp';

const queryClient = new QueryClient();

const App: React.FC = () => {
  // Debug: Check environment variable loading
  console.log('Environment check:', {
    VITE_PRIVY_APP_ID: import.meta.env.VITE_PRIVY_APP_ID,
    length: import.meta.env.VITE_PRIVY_APP_ID?.length,
    type: typeof import.meta.env.VITE_PRIVY_APP_ID
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider appId={import.meta.env.VITE_PRIVY_APP_ID!}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<GreenthumbApp />} />
          </Routes>
        </Router>
      </PrivyProvider>
    </QueryClientProvider>
  );
};

export default App;