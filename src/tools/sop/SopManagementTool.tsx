
import React from 'react';
import { SopLibrary } from './SopLibrary';
import { ExportButton } from '../../components/ui/ExportButton';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { FileStack } from 'lucide-react';

export const SopManagementTool: React.FC = () => {
    const { tools } = useWorkspaceStore();
    const sopData = tools['sop'] || {};

    // Render content for PDF export
    const renderExportContent = () => (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">SOP Library Summary</h3>
            {sopData.title ? (
                <div className="p-4 border rounded">
                    <p className="font-medium">{sopData.title}</p>
                    <p className="text-sm text-slate-500">Status: Active</p>
                </div>
            ) : (
                <p className="text-slate-400 italic">No SOPs in library</p>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <FileStack className="w-8 h-8 text-purple-600" />
                        SOP Management
                    </h2>
                    <p className="text-slate-500 mt-1">Manage, review, and organize your SOP lifecycle.</p>
                </div>
                <ExportButton 
                    toolName="SOP Library" 
                    renderContent={renderExportContent} 
                />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <SopLibrary onCreateClick={() => {
                    // Could redirect to Creation tool not implemented yet in this simplified view
                    alert('Use the SOP Creation Wizard tool to add new SOPs.');
                }} />
            </div>
        </div>
    );
};
