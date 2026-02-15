
import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../../components/ui/Button';
import { Save, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { TaxonomyItem } from './SopTaxonomy';

const TOOL_ID = 'sop';

interface Step {
    id: string;
    order: number;
    title: string;
    description: string;
    roleId?: string;
}

interface SopWizardProps {
    onCancel: () => void;
    onSave: () => void;
}

export const SopWizard: React.FC<SopWizardProps> = ({ onCancel, onSave }) => {
    const { tools, updateToolData } = useWorkspaceStore();
    const taxonomy = (tools[TOOL_ID]?.taxonomy as TaxonomyItem[]) || [];

    const [currentStep, setCurrentStep] = useState(1);

    // Form State
    const [title, setTitle] = useState('');
    const [owner, setOwner] = useState('');
    const [deptId, setDeptId] = useState('');
    const [steps, setSteps] = useState<Step[]>([]);

    // Step Editor State
    const [newStepTitle, setNewStepTitle] = useState('');
    const [newStepDesc, setNewStepDesc] = useState('');

    const departments = taxonomy.filter(t => t.type === 'dept');


    const handleSave = () => {
        if (!title.trim() || steps.length === 0) return;

        const newSop = {
            id: crypto.randomUUID(),
            metadata: {
                title,
                owner,
                departmentId: deptId,
                createdAt: new Date().toISOString(),
                status: 'draft'
            },
            steps
        };

        const currentSops = tools[TOOL_ID]?.sops || [];
        updateToolData(TOOL_ID, {
            ...tools[TOOL_ID],
            sops: [...currentSops, newSop]
        });

        onSave();
    };

    const addStep = () => {
        if (!newStepTitle.trim()) return;
        const step: Step = {
            id: crypto.randomUUID(),
            order: steps.length + 1,
            title: newStepTitle,
            description: newStepDesc
        };
        setSteps([...steps, step]);
        setNewStepTitle('');
        setNewStepDesc('');
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Wizard Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {currentStep}
                    </span>
                    {currentStep === 1 ? 'SOP Metadata' : currentStep === 2 ? 'Process Steps' : 'Review & Save'}
                </h3>
                <div className="flex gap-2">
                    <div className={`h-2 w-12 rounded-full ${currentStep >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <div className={`h-2 w-12 rounded-full ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <div className={`h-2 w-12 rounded-full ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                {currentStep === 1 && (
                    <div className="max-w-xl mx-auto space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SOP Title *</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Annual Budget Approval"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Process Owner</label>
                            <input
                                value={owner}
                                onChange={e => setOwner(e.target.value)}
                                className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Jane Doe, VP Finance"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                            <select
                                value={deptId}
                                onChange={e => setDeptId(e.target.value)}
                                className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select a Department...</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                            {departments.length === 0 && (
                                <p className="text-xs text-orange-500 mt-1">
                                    No departments found. Go to "Process Map" to add one.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                        {/* Step Form */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800">Add Process Step</h4>
                            <input
                                value={newStepTitle}
                                onChange={e => setNewStepTitle(e.target.value)}
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Step Title (e.g., Submit Request)"
                            />
                            <textarea
                                value={newStepDesc}
                                onChange={e => setNewStepDesc(e.target.value)}
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                                placeholder="Detailed description of the action..."
                            />
                            <Button onClick={addStep} disabled={!newStepTitle} className="w-full bg-slate-800 hover:bg-slate-900 text-white">
                                <Check className="w-4 h-4 mr-2" /> Add Step
                            </Button>
                        </div>

                        {/* Step List */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-y-auto max-h-[400px]">
                            <h4 className="font-semibold text-slate-800 mb-4 sticky top-0 bg-slate-50">Process Flow ({steps.length})</h4>
                            {steps.length === 0 ? (
                                <p className="text-slate-400 italic text-center py-8">No steps added yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {steps.map((step, idx) => (
                                        <div key={step.id} className="relative flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
                                                    {idx + 1}
                                                </div>
                                                {idx < steps.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                                            </div>
                                            <div className="flex-1 bg-white p-3 rounded border border-slate-200 shadow-sm mb-2">
                                                <div className="font-medium text-slate-800">{step.title}</div>
                                                <div className="text-xs text-slate-500 mt-1">{step.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-emerald-50 text-emerald-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Save className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready to Save?</h3>
                        <p className="text-slate-500 mb-8">
                            You are about to create <span className="font-semibold text-slate-900">"{title}"</span> with {steps.length} steps.
                        </p>

                        <div className="bg-slate-50 p-6 rounded-lg text-left border border-slate-200 inline-block w-full text-sm space-y-2 mb-8">
                            <div className="flex justify-between"><span className="text-slate-500">Owner:</span> <span className="font-medium">{owner || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Department:</span> <span className="font-medium">{departments.find(d => d.id === deptId)?.name || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Creation Date:</span> <span className="font-medium">{new Date().toLocaleDateString()}</span></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
                <Button variant="ghost" onClick={currentStep === 1 ? onCancel : () => setCurrentStep(prev => prev - 1)}>
                    {currentStep === 1 ? 'Cancel' : <><ArrowLeft className="w-4 h-4 mr-2" /> Back</>}
                </Button>

                {currentStep < 3 ? (
                    <Button
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        disabled={currentStep === 1 && !title.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Create SOP <Check className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
};
