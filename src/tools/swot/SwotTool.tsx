
import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { SwotMatrix } from './SwotMatrix';
import type { SwotData, QuadrantType, SwotItem } from './SwotMatrix';
import { Button } from '../../components/ui/Button';
import { ExportButton } from '../../components/ui/ExportButton';
import { Plus, Trash2, Grip } from 'lucide-react';

const TOOL_ID = 'swot';

const EMPTY_DATA: SwotData = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
};

const QUADRANTS: { id: QuadrantType; label: string; color: string }[] = [
    { id: 'strengths', label: 'Strengths', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'weaknesses', label: 'Weaknesses', color: 'bg-rose-100 text-rose-800' },
    { id: 'opportunities', label: 'Opportunities', color: 'bg-blue-100 text-blue-800' },
    { id: 'threats', label: 'Threats', color: 'bg-amber-100 text-amber-800' }
];

export const SwotTool: React.FC = () => {
    const { tools, updateToolData } = useWorkspaceStore();
    const data = (tools[TOOL_ID] as SwotData) || EMPTY_DATA;

    // Local form state
    const [activeQuadrant, setActiveQuadrant] = useState<QuadrantType>('strengths');
    const [textInput, setTextInput] = useState('');
    const [confidence, setConfidence] = useState(3);

    const activeQuadInfo = QUADRANTS.find(q => q.id === activeQuadrant)!;

    const addItem = () => {
        if (!textInput.trim()) return;

        const newItem: SwotItem = {
            id: crypto.randomUUID(),
            text: textInput,
            confidence
        };

        const currentList = data[activeQuadrant] || [];
        const updatedList = [...currentList, newItem];

        updateToolData(TOOL_ID, {
            ...data,
            [activeQuadrant]: updatedList
        });

        setTextInput('');
        setConfidence(3);
    };

    const removeItem = (quadrant: QuadrantType, id: string) => {
        const currentList = data[quadrant] || [];
        // Safely filtering
        const updatedList = currentList.filter(item => item.id !== id);

        updateToolData(TOOL_ID, {
            ...data,
            [quadrant]: updatedList
        });
    };

    // Render content for PDF export
    const renderExportContent = () => (
        <div className="h-[500px]">
            <SwotMatrix data={data} />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Grip className="w-8 h-8 text-indigo-600" />
                        SWOT Analysis
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Identify internal strengths & weaknesses, and external opportunities & threats.
                    </p>
                </div>
                <ExportButton 
                    toolName="SWOT Analysis" 
                    renderContent={renderExportContent} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Panel */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 h-fit">
                    <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        Add Item
                    </h3>

                    {/* Quadrant Selector */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {QUADRANTS.map(q => (
                            <button
                                key={q.id}
                                onClick={() => setActiveQuadrant(q.id)}
                                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${activeQuadrant === q.id
                                    ? q.color + ' ring-2 ring-offset-2 ring-indigo-500'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {q.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                                placeholder={`Describe a ${activeQuadInfo.label.slice(0, -1)}...`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        addItem();
                                    }
                                }}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-600">Confidence / Impact</label>
                                <span className="text-xs font-bold text-indigo-600">{confidence}/5</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={confidence}
                                onChange={(e) => setConfidence(parseInt(e.target.value))}
                                className="w-full accent-indigo-600"
                            />
                        </div>

                        <Button onClick={addItem} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            Add to {activeQuadInfo.label}
                        </Button>
                    </div>

                    {/* Mini List of Active Quadrant */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            Current {activeQuadInfo.label}
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {(data[activeQuadrant] || []).length === 0 && (
                                <p className="text-xs text-slate-400 italic">No items yet.</p>
                            )}
                            {(data[activeQuadrant] || []).map(item => (
                                <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100 text-sm group">
                                    <span className="truncate flex-1 mr-2">{item.text}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-slate-400">c:{item.confidence}</span>
                                        <button
                                            onClick={() => removeItem(activeQuadrant, item.id)}
                                            className="text-slate-300 hover:text-red-500"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Visualization Panel */}
                <div className="lg:col-span-2">
                    <SwotMatrix data={data} />
                </div>
            </div>
        </div>
    );
};
