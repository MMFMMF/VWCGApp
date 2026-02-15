
import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { VisionBoard } from './VisionBoard';
import { Button } from '../../components/ui/Button';
import { ExportButton } from '../../components/ui/ExportButton';
import { Plus, Trash2, Target, Gem } from 'lucide-react';

const TOOL_ID = 'vision-canvas';

interface Pillar {
    id: string;
    title: string;
    kpi: string;
}

interface CoreValue {
    id: string;
    text: string;
}

interface VisionData {
    northStar: string;
    pillars: Pillar[];
    values: CoreValue[];
}

const EMPTY_DATA: VisionData = {
    northStar: '',
    pillars: [],
    values: []
};

export const VisionCanvasTool: React.FC = () => {
    const { tools, updateToolData } = useWorkspaceStore();
    const data = (tools[TOOL_ID] as VisionData) || EMPTY_DATA;

    // Temporary state for inputs
    const [pillarInput, setPillarInput] = useState('');
    const [kpiInput, setKpiInput] = useState('');
    const [valueInput, setValueInput] = useState('');

    const updateData = (newData: Partial<VisionData>) => {
        updateToolData(TOOL_ID, { ...data, ...newData });
    };

    const addPillar = () => {
        if (!pillarInput.trim()) return;
        if (data.pillars.length >= 6) {
            alert("Maximum 6 pillars allowed per MVP spec.");
            return;
        }
        const newPillar: Pillar = {
            id: crypto.randomUUID(),
            title: pillarInput,
            kpi: kpiInput
        };
        updateData({ pillars: [...data.pillars, newPillar] });
        setPillarInput('');
        setKpiInput('');
    };

    const removePillar = (id: string) => {
        updateData({ pillars: data.pillars.filter(p => p.id !== id) });
    };

    const addValue = () => {
        if (!valueInput.trim()) return;
        const newValue: CoreValue = {
            id: crypto.randomUUID(),
            text: valueInput
        };
        updateData({ values: [...data.values, newValue] });
        setValueInput('');
    };

    const removeValue = (id: string) => {
        updateData({ values: data.values.filter(v => v.id !== id) });
    };

    // Render content for PDF export
    const renderExportContent = () => (
        <VisionBoard data={data} />
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Target className="w-8 h-8 text-cyan-600" />
                        Vision Canvas
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Define your North Star, strategic pillars, and core values.
                    </p>
                </div>
                <ExportButton 
                    toolName="Vision Canvas" 
                    renderContent={renderExportContent} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Column */}
                <div className="space-y-6 lg:col-span-1">

                    {/* North Star Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">North Star Metric</h3>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Metric Statement</label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none resize-none h-24"
                                placeholder="e.g., $10M ARR by 2026..."
                                value={data.northStar}
                                onChange={(e) => updateData({ northStar: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Pillars Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Strategic Pillars</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <input
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                                    placeholder="Pillar Name (e.g., Global Expansion)"
                                    value={pillarInput}
                                    onChange={(e) => setPillarInput(e.target.value)}
                                />
                                <input
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                                    placeholder="Key Result / KPI"
                                    value={kpiInput}
                                    onChange={(e) => setKpiInput(e.target.value)}
                                />
                                <Button onClick={addPillar} size="sm" className="w-full bg-slate-800 hover:bg-slate-900 text-white">
                                    <Plus className="w-4 h-4 mr-2" /> Add Pillar
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {data.pillars.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 group">
                                        <div className="overflow-hidden">
                                            <div className="font-medium text-sm truncate">{p.title}</div>
                                            <div className="text-xs text-slate-400 truncate">{p.kpi}</div>
                                        </div>
                                        <button onClick={() => removePillar(p.id)} className="text-slate-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Values Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Gem className="w-4 h-4 text-purple-500" /> Core Values
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                                    placeholder="Value (e.g., Radical Transparency)"
                                    value={valueInput}
                                    onChange={(e) => setValueInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addValue()}
                                />
                                <Button onClick={addValue} size="sm" className="bg-slate-800 hover:bg-slate-900 text-white">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {data.values.map(v => (
                                    <span key={v.id} className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs border border-purple-100">
                                        {v.text}
                                        <button onClick={() => removeValue(v.id)} className="ml-2 hover:text-purple-900">
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Visualization Column */}
                <div className="lg:col-span-2">
                    <VisionBoard data={data} />
                </div>
            </div>
        </div>
    );
};
