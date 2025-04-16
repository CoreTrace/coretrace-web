import React from 'react';

const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-editor-toolbar p-4 rounded-md shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-editor-accent"></div>
        <div className="mt-2 text-sm text-gray-300">{message}</div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
