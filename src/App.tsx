import { useEffect } from 'react';
import { useWorkspaceStore } from './store/workspaceStore';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardTool } from './tools/dashboard/DashboardTool';
import { getTools } from './registry/ToolRegistry';
import { PrintReport } from './components/print/PrintReport';

function App() {
  const metadata = useWorkspaceStore(state => state.metadata);
  const resetWorkspace = useWorkspaceStore(state => state.resetWorkspace);

  useEffect(() => {
    // Only initialize a fresh workspace if no data exists (first load ever)
    // If persist middleware has loaded saved data, metadata.id will already be set
    if (!metadata?.id) {
      resetWorkspace();
    }
  }, [metadata?.id, resetWorkspace]);

  return (
    <Router>
      <Routes>
        {/* Print routes — NO AppShell (for clean PDF generation) */}
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

export default App;
