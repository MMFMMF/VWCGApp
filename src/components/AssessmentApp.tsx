/**
 * AssessmentApp - Astro mount wrapper for the React SPA
 *
 * Renders the full React SPA at /app/* with basename="/app".
 * Used by src/pages/app/[...tool].astro via client:only="react".
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useWorkspaceStore } from '../store/workspaceStore';
import { AppShell } from './layout/AppShell';
import { DashboardTool } from '../tools/dashboard/DashboardTool';
import { getTools } from '../registry/ToolRegistry';
import { PrintReport } from './print/PrintReport';
import { initializeRegistry } from '../registry/registry';
import { initializeValidation } from '../validation';
import { registerCharts } from '../lib/charts';

// Initialize on module load (mirrors main.tsx bootstrap)
initializeRegistry();
initializeValidation();
registerCharts();

function AssessmentApp() {
  const metadata = useWorkspaceStore(state => state.metadata);
  const resetWorkspace = useWorkspaceStore(state => state.resetWorkspace);

  useEffect(() => {
    if (!metadata?.id) {
      resetWorkspace();
    }
  }, [metadata?.id, resetWorkspace]);

  return (
    <Router basename="/app">
      <Routes>
        {/* Print routes — NO AppShell */}
        <Route path="/report/print/:reportType" element={<PrintReport />} />

        {/* App routes — WITH AppShell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardTool />} />
          {getTools().map(tool => (
            <Route key={tool.id} path={tool.path} element={<tool.component />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AssessmentApp;
