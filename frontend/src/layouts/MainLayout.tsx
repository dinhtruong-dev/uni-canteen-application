import React from 'react';
import { Navbar } from '../components/Navbar';
import { ToastContainer } from '../components/ToastContainer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 sm:pb-0">
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 pb-10">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
};
