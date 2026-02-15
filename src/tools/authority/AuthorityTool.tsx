
import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../../components/ui/Button';
import { Shield, Swords, BookMarked, Trash2, Plus } from 'lucide-react';

const TOOL_ID = 'authority-tracker';

interface AuthorityItem {
    id: string;
    text: string;
    description?: string; // Optional context
}

interface AuthorityData {
    competitors: AuthorityItem[];
    moats: AuthorityItem[];
    vocabulary: AuthorityItem[];
}

const DEFAULT_DATA: AuthorityData = {
    competitors: [],
    moats: [],
    vocabulary: []
};

export const AuthorityTool: React.FC = () => {
    const { tools, updateToolData } = useWorkspaceStore();
    const data = (tools[TOOL_ID] as AuthorityData) || DEFAULT_DATA;

    // Inputs state
    const [compInput, setCompInput] = useState('');
    const [moatInput, setMoatInput] = useState('');
    const [vocabInput, setVocabInput] = useState('');

    const addItem = (type: keyof AuthorityData, text: string, setText: (s: string) => void) => {
        if (!text.trim()) return;
        const newItem: AuthorityItem = {
            id: crypto.randomUUID(),
            text: text.trim()
        };
        updateToolData(TOOL_ID, {
            ...data,
            [type]: [...data[type], newItem]
        });
        setText('');
    };

    const removeItem = (type: keyof AuthorityData, id: string) => {
        updateToolData(TOOL_ID, {
            ...data,
            [type]: data[type].filter(i => i.id !== id)
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="w-8 h-8 text-indigo-600" />
                    Authority Tracker
                </h2>
                <p className="text-slate-500 mt-1">
                    Map your competitive landscape, strategic advantages, and niche vocabulary.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Competitors */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 rounded-t-xl">
                        <Swords className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-slate-700">Competitors</h3>
                        <span className="ml-auto bg-white px-2 py-0.5 rounded text-xs border border-slate-200">{data.competitors.length}</span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-2">
                        {data.competitors.length === 0 && (
                            <div className="text-center text-slate-400 mt-10 text-sm">No competitors listed.</div>
                        )}
                        {data.competitors.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                <span className="font-medium text-slate-700">{item.text}</span>
                                <button onClick={() => removeItem('competitors', item.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add competitor..."
                                value={compInput}
                                onChange={e => setCompInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addItem('competitors', compInput, setCompInput)}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                            <Button size="sm" onClick={() => addItem('competitors', compInput, setCompInput)} disabled={!compInput.trim()}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Strategic Moats */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 rounded-t-xl">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-bold text-slate-700">Strategic Moats</h3>
                        <span className="ml-auto bg-white px-2 py-0.5 rounded text-xs border border-slate-200">{data.moats.length}</span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-2">
                        {data.moats.length === 0 && (
                            <div className="text-center text-slate-400 mt-10 text-sm">No moats defined.</div>
                        )}
                        {data.moats.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                <span className="font-medium text-slate-700">{item.text}</span>
                                <button onClick={() => removeItem('moats', item.id)} className="text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add moat..."
                                value={moatInput}
                                onChange={e => setMoatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addItem('moats', moatInput, setMoatInput)}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                            <Button size="sm" onClick={() => addItem('moats', moatInput, setMoatInput)} disabled={!moatInput.trim()}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Niche Vocabulary */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 rounded-t-xl">
                        <BookMarked className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-bold text-slate-700">Vocabulary</h3>
                        <span className="ml-auto bg-white px-2 py-0.5 rounded text-xs border border-slate-200">{data.vocabulary.length}</span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-2">
                        {data.vocabulary.length === 0 && (
                            <div className="text-center text-slate-400 mt-10 text-sm">No terms added.</div>
                        )}
                        {data.vocabulary.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                <span className="font-medium text-slate-700">{item.text}</span>
                                <button onClick={() => removeItem('vocabulary', item.id)} className="text-slate-400 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add term..."
                                value={vocabInput}
                                onChange={e => setVocabInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addItem('vocabulary', vocabInput, setVocabInput)}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                            <Button size="sm" onClick={() => addItem('vocabulary', vocabInput, setVocabInput)} disabled={!vocabInput.trim()}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
