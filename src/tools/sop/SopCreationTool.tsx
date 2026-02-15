
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { ExportButton } from '../../components/ui/ExportButton';
import { PenTool, ChevronRight, CheckCircle, Save, AlertCircle } from 'lucide-react';

// Required Blocks as per spec: Purpose, Scope, Roles, Steps, QC, Metrics
const STEPS = [
    { id: 'purpose', label: '1. Purpose & Scope', desc: 'Why does this process exist and what does it cover?' },
    { id: 'roles', label: '2. Roles & Resp.', desc: 'Who is involved and what are they responsible for?' },
    { id: 'steps', label: '3. Procedure Steps', desc: 'Detailed, sequential action steps.' },
    { id: 'qc', label: '4. Quality Control', desc: 'How do we verify correct execution?' },
    { id: 'metrics', label: '5. Metrics / KPI', desc: 'How do we measure success?' }
];

export const SopCreationTool: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, string>>({
        title: '',
        purpose: '',
        roles: '',
        steps: '',
        qc: '',
        metrics: ''
    });

    const handleChange = (field: string, val: string) => {
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    const isStepComplete = (stepIndex: number) => {
        const stepId = STEPS[stepIndex].id;
        return !!formData[stepId] && formData[stepId].length > 10; // Basic validation length
    };

    const canProceed = isStepComplete(currentStep);

    // Render content for PDF export
    const renderExportContent = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">{formData.title || 'Untitled SOP'}</h3>
            {STEPS.map(step => (
                <div key={step.id} className="border-b pb-4">
                    <h4 className="font-semibold text-slate-700">{step.label}</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{formData[step.id] || 'Not completed'}</p>
                </div>
            ))}
        </div>
    );

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <PenTool className="w-8 h-8 text-emerald-600" />
                        SOP Creation Wizard
                    </h2>
                    <p className="text-slate-500 mt-1">Build standard operating procedures with enforced quality blocks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton 
                        toolName="SOP Document" 
                        renderContent={renderExportContent} 
                    />
                    <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded border border-slate-200 shadow-sm">
                        {STEPS[currentStep].label} ({currentStep + 1}/{STEPS.length})
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
                {/* Stepper Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    {STEPS.map((step, idx) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(idx)}
                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between group ${currentStep === idx
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <div>
                                <div className="font-semibold text-sm">{step.label}</div>
                                <div className="text-xs opacity-70 truncate max-w-[150px]">{step.desc}</div>
                            </div>
                            {formData[step.id]?.length > 10 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </button>
                    ))}
                </div>

                {/* Form Area */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col">
                    <div className="mb-6 pb-6 border-b border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{STEPS[currentStep].label}</h3>
                        <p className="text-slate-500">{STEPS[currentStep].desc}</p>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">SOP Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => handleChange('title', e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="e.g. Client Onboarding Process"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex-1 flex flex-col">
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                {currentStep === 0 ? 'Purpose & Scope Definition' : 'Content'}
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                                value={formData[STEPS[currentStep].id]}
                                onChange={e => handleChange(STEPS[currentStep].id, e.target.value)}
                                className="flex-1 w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-mono text-sm leading-relaxed"
                                placeholder={`Enter detail for ${STEPS[currentStep].label}...`}
                            />
                            {!isStepComplete(currentStep) && (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Minimum content length required to proceed.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                        <Button
                            variant="secondary"
                            disabled={currentStep === 0}
                            onClick={() => setCurrentStep(curr => curr - 1)}
                        >
                            Back
                        </Button>

                        {currentStep < STEPS.length - 1 ? (
                            <Button
                                disabled={!canProceed}
                                onClick={() => setCurrentStep(curr => curr + 1)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                Next Step <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                disabled={!Object.keys(formData).every(k => formData[k]?.length > 10)}
                                onClick={() => alert('SOP Saved! (Mock)')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Save className="w-4 h-4 mr-2" /> Save Complete SOP
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
