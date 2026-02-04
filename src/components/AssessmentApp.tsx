import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

/**
 * AssessmentApp - Main React component for the /app route
 *
 * This is the entry point for all assessment tools.
 * Uses React Router for client-side navigation between different tools.
 */

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
          Assessment Tools
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose an assessment tool to begin evaluating your business strategy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-display font-semibold text-gray-900 mb-3">
            Coming Soon
          </h2>
          <p className="text-gray-600 mb-4">
            Assessment tools will be available here.
          </p>
          <div className="text-sm text-gray-500">
            More tools coming in Phase 2
          </div>
        </div>
      </div>
    </div>
  );
};

const NotFound: React.FC = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
        Page Not Found
      </h1>
      <p className="text-gray-600 mb-6">
        The tool you're looking for doesn't exist yet.
      </p>
      <Link to="/app" className="btn-primary">
        Back to Tools
      </Link>
    </div>
  );
};

const AssessmentApp: React.FC = () => {
  return (
    <BrowserRouter basename="/app">
      <div className="min-h-[60vh]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default AssessmentApp;
