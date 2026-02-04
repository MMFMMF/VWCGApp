/**
 * AssessmentApp - Main React component for the /app route
 *
 * Dynamically generates routes from the tool registry.
 * Provides dashboard for tool selection and individual tool views.
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { toolRegistry } from '../lib/tools';
import { ToolWrapper } from './ToolWrapper';

/**
 * Dashboard - Shows all available tools
 */
function Dashboard() {
  const tools = toolRegistry.getSorted();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">VWCGApp Dashboard</h1>

      {tools.length === 0 ? (
        <div className="card">
          <p className="text-gray-600">
            No tools registered yet. Tools will appear here when they are added to the registry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.metadata.id}
              to={`/tools/${tool.metadata.id}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{tool.metadata.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{tool.metadata.description}</p>
              {tool.metadata.estimatedTime && (
                <span className="text-xs text-gray-500">
                  {tool.metadata.estimatedTime} min
                </span>
              )}
              <span className="text-xs text-gray-500 ml-2 px-2 py-1 bg-gray-100 rounded">
                {tool.metadata.category}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ToolView - Renders a specific tool
 */
function ToolView({ toolId }: { toolId: string }) {
  const tool = toolRegistry.get(toolId);

  if (!tool) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Tool Not Found</h1>
        <p className="text-gray-600 mb-4">
          The tool "{toolId}" does not exist.
        </p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToolWrapper tool={tool} />
    </div>
  );
}

/**
 * Main AssessmentApp component with dynamic routing
 */
const AssessmentApp: React.FC = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const tools = toolRegistry.getSorted();

  // Wait for Zustand store hydration
  useEffect(() => {
    // Small delay to ensure localStorage has been read
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter basename="/app">
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Dashboard route */}
          <Route path="/" element={<Dashboard />} />

          {/* Dynamic routes from registry */}
          {tools.map((tool) => (
            <Route
              key={tool.metadata.id}
              path={`/tools/${tool.metadata.id}`}
              element={<ToolView toolId={tool.metadata.id} />}
            />
          ))}

          {/* Catch-all for unknown tool routes */}
          <Route path="/tools/*" element={<Navigate to="/" replace />} />

          {/* Future routes */}
          <Route path="/report" element={<div className="p-6">Report Center (Coming Soon)</div>} />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default AssessmentApp;
