
import React, { useState } from 'react';
import { SopLibrary } from './SopLibrary';
import { SopWizard } from './SopWizard';
import { Plus, List } from 'lucide-react';

export const SopManagerTool: React.FC = () => {
    const [view, setView] = useState<'library' | 'create'>('library');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">SOP Management</h2>
                    <p className="text-slate-500 mt-1">Create, review, and manage your Standard Operating Procedures.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-md">
                    <button
                        onClick={() => setView('library')}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${view === 'library' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <List className="w-4 h-4" /> Library
                    </button>
                    <button
                        onClick={() => setView('create')}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${view === 'create' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Plus className="w-4 h-4" /> Create New
                    </button>
                </div>
            </div>

            {view === 'library' ? (
                <SopLibrary onCreateClick={() => setView('create')} />
            ) : (
                <SopWizard onCancel={() => setView('library')} onSave={() => setView('library')} />
            )}
        </div>
    );
};
