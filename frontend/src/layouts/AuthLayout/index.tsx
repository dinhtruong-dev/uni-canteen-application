import React from 'react';
import { ToastContainer } from '../../components/common/ToastContainer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-orange-100">
        {children}
      </div>
      <ToastContainer />
    </div>
  );
};
