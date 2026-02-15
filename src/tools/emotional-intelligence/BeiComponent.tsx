import React from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { BeiTrendChart } from './BeiTrendChart';
import { ExportButton } from '../../components/ui/ExportButton';
import { HeartHandshake } from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export const BeiComponent: React.FC = () => {
    const { tools } = useWorkspaceStore();
    const currentEntries = tools['bei']?.entries || [];

    // Render content for PDF export
    const renderExportContent = () => (
        <div className="h-[400px]">
            {currentEntries.length > 0 ? (
                <BeiTrendChart entries={currentEntries} />
            ) : (
                <div className="p-4 text-center text-gray-500">No entries to display.</div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <HeartHandshake className="w-7 h-7 text-pink-600" />
                        Business Emotional Intelligence
                    </h2>
                    <p className="text-slate-500">Track emotional intelligence metrics over time.</p>
                </div>
                <ExportButton 
                    toolName="Business Emotional Intelligence" 
                    renderContent={renderExportContent} 
                />
            </div>

            {/* Main Chart */}
            {currentEntries.length > 0 ? (
                <ErrorBoundary>
                    <BeiTrendChart entries={currentEntries} />
                </ErrorBoundary>
            ) : (
                <div className="p-4 text-center text-gray-500">No entries to display chart.</div>
            )}
        </div>
    );
};
