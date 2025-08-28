import React from 'react';

interface SpreadsheetViewerProps {
  url: string;
  onBack: () => void;
}

const SpreadsheetViewer: React.FC<SpreadsheetViewerProps> = ({ url, onBack }) => {
  return (
    <div className="w-screen h-screen relative">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-all flex items-center"
        aria-label="Back to report selection"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        뒤로가기
      </button>
      <iframe
        src={url}
        className="w-full h-full border-0"
        title="Google Sheet Viewer"
        allow="fullscreen"
      >
        Loading spreadsheet...
      </iframe>
    </div>
  );
};

export default SpreadsheetViewer;