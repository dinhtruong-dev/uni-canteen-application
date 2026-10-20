import React from 'react';
import { AppProvider } from './store/AppContext';
import { MainLayout } from './layouts/MainLayout/index';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </AppProvider>
  );
};

export default App;
