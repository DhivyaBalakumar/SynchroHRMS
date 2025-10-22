import React from 'react';
import ErrorBoundary from '@/lib/errorBoundary';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ children }) => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Additional error handling logic can be added here
        console.error('Application Error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWrapper;
