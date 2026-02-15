
import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { AdvisorResults } from './AdvisorResults';
import { QUESTIONS, CATEGORIES } from './questions';
import { Button } from '../../components/ui/Button';
import { ExportButton } from '../../components/ui/ExportButton';
import { CheckCircle, PieChart, ClipboardCheck, AlertTriangle, ListTodo, Calculator, BarChart2, Plus, Trash2 } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TOOL_ID = 'advisor-readiness';

// --- Sub-Components ---

// 1. ROI Section (Unchanged logic, just keeping it robust)
const RoiSection = () => {
    const [revenue, setRevenue] = useState(1000000);
    const [margin, setMargin] = useState(20);
    const [multiplier, setMultiplier] = useState(4);

    const currentValuation = revenue * (margin / 100) * multiplier;
    const scenarios = [
        { label: 'Worst Case', growth: 1.05, color: 'rgba(100, 116, 139, 0.7)' },
        { label: 'Likely Case', growth: 1.20, color: 'rgba(59, 130, 246, 0.7)' },
        { label: 'Best Case', growth: 1.50, color: 'rgba(168, 85, 247, 0.7)' }
    ];

    const chartData = {
        labels: ['Current', ...scenarios.map(s => s.label)],
        datasets: [{
            label: 'Valuation ($)',
            data: [currentValuation, ...scenarios.map(s => currentValuation * s.growth)],
            backgroundColor: ['rgba(148, 163, 184, 0.5)', ...scenarios.map(s => s.color)],
        }]
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Input grouping for clearer UI */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Revenue ($)</label>
                        <input type="number" value={revenue} onChange={e => setRevenue(Number(e.target.value))} className="w-full mt-1 p-2 border rounded" />
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Margin (%)</label>
                        <input type="number" value={margin} onChange={e => setMargin(Number(e.target.value))} className="w-full mt-1 p-2 border rounded" />
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Multiple (x)</label>
                        <input type="number" value={multiplier} onChange={e => setMultiplier(Number(e.target.value))} className="w-full mt-1 p-2 border rounded" />
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4">Valuation Projection</h3>
                <div className="h-[300px]">
                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
            </div>
        </div>
    );
};

// 2. Risk Register Component
interface RiskItem { id: string; name: string; impact: 'High' | 'Medium' | 'Low'; }
const RiskSection = () => {
    const [risks, setRisks] = useState<RiskItem[]>([
        { id: '1', name: 'Executive Misalignment', impact: 'High' },
        { id: '2', name: 'Legacy Tech Debt', impact: 'Medium' }
    ]);
    const [newRisk, setNewRisk] = useState('');

    const addRisk = () => {
        if (!newRisk) return;
        setRisks([...risks, { id: crypto.randomUUID(), name: newRisk, impact: 'Medium' }]);
        setNewRisk('');
    };

    const removeRisk = (id: string) => setRisks(risks.filter(r => r.id !== id));

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-amber-500 w-5 h-5" /> Risk Register
            </h3>
            <div className="flex gap-2 mb-4">
                <input
                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                    placeholder="New risk..."
                    value={newRisk}
                    onChange={e => setNewRisk(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addRisk()}
                />
                <Button size="sm" onClick={addRisk}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[300px]">
                {risks.map(r => (
                    <div key={r.id} className="p-3 bg-slate-50 border border-slate-100 rounded flex justify-between items-center group">
                        <span className="text-sm font-medium text-slate-700">{r.name}</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${r.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{r.impact}</span>
                            <button onClick={() => removeRisk(r.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. Impact Analysis Component
interface Initiative { id: string; name: string; impact: number; }
const ImpactSection = () => {
    const [initiatives, setInitiatives] = useState<Initiative[]>([
        { id: '1', name: 'Sales Optimization', impact: 85 },
        { id: '2', name: 'Ops Automation', impact: 65 },
        { id: '3', name: 'Tech Upgrade', impact: 45 }
    ]);
    const [newInit, setNewInit] = useState('');

    const addInit = () => {
        if (!newInit) return;
        setInitiatives([...initiatives, { id: crypto.randomUUID(), name: newInit, impact: 50 }]);
        setNewInit('');
    };

    const chartData = {
        labels: initiatives.map(i => i.name),
        datasets: [{
            label: 'Impact Score',
            data: initiatives.map(i => i.impact),
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1
        }]
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart2 className="text-indigo-500 w-5 h-5" /> Impact Analysis
            </h3>
            <div className="flex gap-2 mb-4">
                <input
                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                    placeholder="New initiative..."
                    value={newInit}
                    onChange={e => setNewInit(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addInit()}
                />
                <Button size="sm" onClick={addInit}><Plus className="w-4 h-4" /></Button>
            </div>

            <div className="flex-1 min-h-[200px]">
                <Bar
                    data={chartData}
                    options={{
                        indexAxis: 'y' as const,
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { x: { max: 100 } }
                    }}
                />
            </div>
        </div>
    );
};


// --- Main Tool ---

interface AdvisorData {
    answers: Record<string, number>;
}

const EMPTY_DATA: AdvisorData = { answers: {} };

export const AdvisorTool: React.FC = () => {
    const { tools, updateToolData } = useWorkspaceStore();
    const data = (tools[TOOL_ID] as AdvisorData) || EMPTY_DATA;
    const answers = data.answers || {};
    const [activeTab, setActiveTab] = useState<'assessment' | 'results' | 'roi' | 'planning'>('assessment');

    const questionsByCategory = CATEGORIES.map(cat => ({
        ...cat,
        questions: QUESTIONS.filter(q => q.category === cat.id)
    }));
    const totalQuestions = QUESTIONS.length;
    const answeredCount = Object.keys(answers).length;
    const progress = Math.round((answeredCount / totalQuestions) * 100);

    const handleAnswer = (qId: string, score: number) => {
        updateToolData(TOOL_ID, { ...data, answers: { ...answers, [qId]: score } });
    };

    const autoFill = () => {
        const demoAnswers: Record<string, number> = {};
        QUESTIONS.forEach(q => { demoAnswers[q.id] = Math.floor(Math.random() * 3) + 3; });
        updateToolData(TOOL_ID, { ...data, answers: demoAnswers });
    };

    const scores: Record<string, number> = {};
    const maxScores: Record<string, number> = {};
    CATEGORIES.forEach(cat => {
        const catQuestions = QUESTIONS.filter(q => q.category === cat.id);
        scores[cat.id] = catQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
        maxScores[cat.id] = catQuestions.length * 5;
    });

    // Render content for PDF export
    const renderExportContent = () => (
        <div className="h-[500px]">
            <AdvisorResults scores={scores} maxScores={maxScores} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardCheck className="w-8 h-8 text-indigo-600" />
                        Advisor Readiness
                    </h2>
                    <p className="text-slate-500 mt-1">Diagnostic, Valuation, and Strategic Impact.</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton 
                        toolName="Advisor Readiness" 
                        renderContent={renderExportContent} 
                    />
                    <div className="flex bg-slate-100 p-1 rounded-md overflow-x-auto">
                        {[
                            { id: 'assessment', label: 'Diagnostic', icon: CheckCircle },
                            { id: 'results', label: 'Analysis', icon: PieChart },
                            { id: 'roi', label: 'ROI & Value', icon: Calculator },
                            { id: 'planning', label: 'Impact & Risks', icon: ListTodo },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {activeTab === 'assessment' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex justify-between items-center">
                        <p className="text-indigo-800 text-sm">Rate each statement (1-5). Progress: {progress}%</p>
                        <Button variant="ghost" size="sm" onClick={autoFill} className="text-indigo-600">Auto-fill</Button>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                        {questionsByCategory.map(cat => (
                            <div key={cat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className={`px-6 py-4 border-b border-slate-100 flex items-center gap-3 ${cat.color}`}>
                                    <h3 className="font-bold text-lg">{cat.label}</h3>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {cat.questions.map(q => (
                                        <div key={q.id} className="p-6">
                                            <p className="text-slate-800 font-medium mb-4">{q.text}</p>
                                            <div className="flex items-center gap-2">
                                                {[1, 2, 3, 4, 5].map(val => (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleAnswer(q.id, val)}
                                                        className={`flex-1 h-10 rounded border transition-all font-medium text-sm ${answers[q.id] === val ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'results' && (
                <div className="h-[600px] animate-in fade-in duration-500">
                    <AdvisorResults scores={scores} maxScores={maxScores} />
                </div>
            )}

            {activeTab === 'roi' && <RoiSection />}

            {activeTab === 'planning' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                    <ImpactSection />
                    <div className="flex flex-col gap-6">
                        <RiskSection />
                        {/* Simple Roadmap List (Static for now, but contextually placed) */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ListTodo className="text-cyan-600 w-5 h-5" /> 6-8 Week Roadmap</h3>
                            <div className="space-y-4 border-l-2 border-slate-100 pl-4 py-2">
                                {['Discovery', 'Quick Wins', 'Strategic Planning', 'Execution'].map((ph, i) => (
                                    <div key={i} className="text-sm">
                                        <span className="font-bold text-slate-700 block">Phase {i + 1}: {ph}</span>
                                        <span className="text-slate-400 text-xs">Weeks {i * 2 + 1}-{i * 2 + 2}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
