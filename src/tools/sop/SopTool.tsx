
import React, { useState } from 'react';
import { FileText, GitBranch, Plus, Library } from 'lucide-react';
import { SopLibrary } from './SopLibrary';
import { SopTaxonomy } from './SopTaxonomy';
import { SopWizard } from './SopWizard';

export type SopTab = 'library' | 'taxonomy' | 'create';

export const SopTool: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SopTab>('library');

    const renderContent = () => {
        switch (activeTab) {
            case 'library':
                return <SopLibrary onCreateClick={() => setActiveTab('create')} />;
            case 'taxonomy':
                return <SopTaxonomy />;
            case 'create':
                return <SopWizard onCancel={() => setActiveTab('library')} onSave={() => setActiveTab('library')} />;
            default:
                return <SopLibrary onCreateClick={() => setActiveTab('create')} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-8 h-8 text-indigo-600" />
                        SOP Management Suite
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Define processes, manage standard operating procedures, and organize taxonomy.
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'library' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Library className="w-4 h-4" /> Library
                    </button>
                    <button
                        onClick={() => setActiveTab('taxonomy')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'taxonomy' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <GitBranch className="w-4 h-4" /> Process Map
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'create' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Plus className="w-4 h-4" /> Create SOP
                    </button>
                </div>
            </div>

            <div className="min-h-[600px]">
                {renderContent()}
            </div>
        </div>
    );
};
