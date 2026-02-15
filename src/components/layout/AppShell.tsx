import React, { useRef } from 'react';
import { useWorkspaceStore, LOGIC_VERSION } from '../../store/workspaceStore';
import { getTools } from '../../registry/ToolRegistry';
import { saveWorkspaceToFile, loadWorkspaceFromFile } from '../../utils/fileSystem';
import { Button } from '../ui/Button';
import { LayoutDashboard, Save, Upload } from 'lucide-react';
import { SafeModeBanner } from './SafeModeBanner';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { StrategicHealthWidget } from '../dashboard/StrategicHealthWidget';

export const AppShell: React.FC = () => {
    const metadata = useWorkspaceStore(state => state.metadata);
    const exportState = useWorkspaceStore(state => state.exportState);
    const loadWorkspace = useWorkspaceStore(state => state.loadWorkspace);

    // Logic Version Controls
    const recomputeLogic = useWorkspaceStore(state => state.recomputeLogic);
    const logicVersion = useWorkspaceStore(state => state.metadata.computed_under_logic_version);
    const isLogicOutdated = logicVersion !== LOGIC_VERSION;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        try {
            const data = exportState();
            saveWorkspaceToFile(data, metadata.name || 'workspace');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const data = await loadWorkspaceFromFile(file);
                loadWorkspace(data);
            } catch (err) {
                console.error('Failed to load workspace', err);
                alert('Failed to load workspace file.');
            }
        }
        // reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-50 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-tight text-white">VWCG Unified</h1>
                    <p className="text-xs text-slate-400 mt-1">v{useWorkspaceStore(s => s.version)}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavLink
                        to="/"
                        className={({ isActive }) => cn(
                            "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Dashboard
                    </NavLink>

                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tools</p>
                    </div>

                    {getTools().map(tool => (
                        <NavLink
                            key={tool.id}
                            to={tool.path}
                            className={({ isActive }) => cn(
                                "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <tool.icon className="mr-3 h-5 w-5" />
                            {tool.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="mt-auto">
                    <StrategicHealthWidget variant="sidebar" />
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center space-x-3 text-slate-400">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                <span className="text-xs font-medium">U</span>
                            </div>
                            <div className="text-xs">
                                <p className="text-slate-300 font-medium">User Workspace</p>
                                <p>v1.1 Hardened</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Safe Mode Overlay */}
            <SafeModeBanner />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <h2 className="text-lg font-semibold text-slate-800">{metadata.name}</h2>

                    <div className="flex items-center space-x-4">
                        {isLogicOutdated && (
                            <div className="flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium animate-pulse">
                                <span className="mr-2">Logic Outdated ({logicVersion || 'v1.0'})</span>
                                <Button size="sm" variant="outline" onClick={recomputeLogic} className="h-6 text-xs bg-white border-amber-300 hover:bg-amber-50">
                                    Upgrade to {LOGIC_VERSION}
                                </Button>
                            </div>
                        )}
                        <input
                            type="file"
                            // ... existing inputs
                            accept=".vwcg,.json"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Button variant="outline" size="sm" onClick={handleLoadClick}>
                            <Upload className="mr-2 h-4 w-4" />
                            Load
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Workspace
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
