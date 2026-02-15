import React from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../ui/Button';
import { AlertTriangle, CheckCircle, XCircle, FileJson, ShieldAlert } from 'lucide-react';

export const SafeModeBanner: React.FC = () => {
    const isSafeMode = useWorkspaceStore(state => state.isSafeMode);
    const previewData = useWorkspaceStore(state => state.previewData);
    const validationResults = useWorkspaceStore(state => state.validationResults);
    const commitWorkspace = useWorkspaceStore(state => state.commitWorkspace);
    const cancelLoad = useWorkspaceStore(state => state.cancelLoad);

    if (!isSafeMode || !previewData) return null;

    const hasWarnings = validationResults?.status === 'warn';
    const hasErrors = validationResults?.status === 'error';

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-start space-x-4">
                    <div className="p-3 bg-amber-100 rounded-full">
                        <ShieldAlert className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Safe Mode: Preview</h2>
                        <p className="text-slate-600 mt-1">
                            You are previewing a workspace file. No tools have been executed yet.
                            Review the details below before committing.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Metadata Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h3 className="text-xs font-semibold uppercase text-slate-500 mb-2">Workspace Name</h3>
                            <p className="font-medium text-slate-900 flex items-center">
                                <FileJson className="w-4 h-4 mr-2 text-slate-400" />
                                {previewData.metadata?.name || 'Untitled'}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h3 className="text-xs font-semibold uppercase text-slate-500 mb-2">Tools Included</h3>
                            <p className="font-medium text-slate-900">
                                {Object.keys(previewData.tools || {}).length} tools
                            </p>
                        </div>
                    </div>

                    {/* Validation Status */}
                    <div className={`p-4 rounded-lg border ${hasErrors ? 'bg-red-50 border-red-200' :
                            hasWarnings ? 'bg-orange-50 border-orange-200' :
                                'bg-green-50 border-green-200'
                        }`}>
                        <div className="flex items-center mb-2">
                            {hasErrors ? <XCircle className="w-5 h-5 text-red-600 mr-2" /> :
                                hasWarnings ? <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" /> :
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />}
                            <h3 className={`font-semibold ${hasErrors ? 'text-red-900' :
                                    hasWarnings ? 'text-orange-900' :
                                        'text-green-900'
                                }`}>
                                {hasErrors ? 'Validation Errors' :
                                    hasWarnings ? 'Integrity Warnings' :
                                        'Integrity Check Passed'}
                            </h3>
                        </div>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-1">
                            {validationResults?.issues?.map((issue, idx) => (
                                <li key={idx} className={`${hasErrors ? 'text-red-700' :
                                        hasWarnings ? 'text-orange-700' :
                                            'text-green-700'
                                    }`}>
                                    {issue.message}
                                </li>
                            ))}
                            {(!validationResults?.issues || validationResults.issues.length === 0) && (
                                <li className="text-green-700">Structure valid. Metadata present.</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-3">
                    <Button variant="outline" onClick={cancelLoad}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => commitWorkspace()}
                        className={hasErrors ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                        {hasErrors ? 'Load with Repair' : 'Load Workspace'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
