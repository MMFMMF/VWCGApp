
import React from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, FileText, Globe } from 'lucide-react';
import type { TaxonomyItem } from './SopTaxonomy';

const TOOL_ID = 'sop';

interface Step {
    id: string;
    order: number;
    title: string;
    description: string;
}

interface Sop {
    id: string;
    metadata: {
        title: string;
        owner: string;
        departmentId: string;
        createdAt: string;
        status: 'draft' | 'active' | 'archived';
    };
    steps: Step[];
}

interface SopData {
    taxonomy: TaxonomyItem[];
    sops: Sop[];
}

interface SopLibraryProps {
    onCreateClick: () => void;
}

const EMPTY_DATA: SopData = { taxonomy: [], sops: [] };

export const SopLibrary: React.FC<SopLibraryProps> = ({ onCreateClick }) => {
    const { tools, updateToolData } = useWorkspaceStore();
    const data = (tools[TOOL_ID] as SopData) || EMPTY_DATA;
    const sops = data.sops || [];
    const taxonomy = data.taxonomy || [];

    const getDeptName = (id: string) => {
        return taxonomy.find(t => t.id === id)?.name || 'Unknown Dept';
    };

    const deleteSop = (id: string) => {
        if (!confirm('Are you sure you want to delete this SOP?')) return;
        updateToolData(TOOL_ID, {
            ...data,
            sops: sops.filter(s => s.id !== id)
        });
    };

    if (sops.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="bg-indigo-50 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">SOP Library is Empty</h3>
                <p className="text-slate-500 mb-8 max-w-md">
                    Start documenting your organizational processes. Create Standard Operating Procedures to ensure consistency and quality.
                </p>
                <Button onClick={onCreateClick} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First SOP
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sops.map(sop => (
                    <div key={sop.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <FileText className="w-6 h-6 text-indigo-600" />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${sop.metadata.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {sop.metadata.status}
                            </span>
                        </div>

                        <h4 className="font-bold text-slate-800 text-lg mb-1 truncate" title={sop.metadata.title}>
                            {sop.metadata.title}
                        </h4>

                        <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" />
                            {getDeptName(sop.metadata.departmentId)}
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                            <span className="text-slate-400">
                                {sop.steps.length} Steps
                            </span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => deleteSop(sop.id)} className="text-red-400 hover:text-red-500 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
