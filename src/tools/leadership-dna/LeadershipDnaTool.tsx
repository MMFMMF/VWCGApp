import React from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../../components/ui/Button';
import { ExportButton } from '../../components/ui/ExportButton';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const DIMENSIONS = [
    'Vision',
    'Execution',
    'Empowerment',
    'Decisiveness',
    'Adaptability',
    'Integrity'
];

const EMPTY_DATA = {};

export const LeadershipDnaTool: React.FC = () => {
    const toolId = 'leadership-dna';
    const data = useWorkspaceStore(state => state.tools[toolId] || EMPTY_DATA);
    const updateData = useWorkspaceStore(state => state.updateToolData);

    const currentScores = DIMENSIONS.map(dim => data[`current_${dim}`] || 0);
    const targetScores = DIMENSIONS.map(dim => data[`target_${dim}`] || 0);

    const handleChange = (type: 'current' | 'target', dim: string, val: number) => {
        updateData(toolId, { [`${type}_${dim}`]: val });
    };

    const chartData = {
        labels: DIMENSIONS,
        datasets: [
            {
                label: 'Current State',
                data: currentScores,
                backgroundColor: 'rgba(51, 65, 85, 0.2)', // Slate-700
                borderColor: 'rgba(51, 65, 85, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(51, 65, 85, 1)',
            },
            {
                label: 'Target State',
                data: targetScores,
                backgroundColor: 'rgba(6, 182, 212, 0.2)', // Cyan-500
                borderColor: 'rgba(6, 182, 212, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(6, 182, 212, 1)',
            },
        ],
    };

    const chartOptions = {
        scales: {
            r: {
                min: 0,
                max: 10,
                ticks: { stepSize: 2 },
                grid: { color: 'rgba(0,0,0,0.1)' },
                pointLabels: { font: { size: 14 } }
            }
        }
    };

    // Render content for PDF export
    const renderExportContent = () => (
        <div className="space-y-6">
            <div className="flex justify-center">
                <div className="w-80 h-80">
                    <Radar data={chartData} options={chartOptions} />
                </div>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="p-2 text-left">Dimension</th>
                        <th className="p-2 text-center">Current</th>
                        <th className="p-2 text-center">Target</th>
                        <th className="p-2 text-center">Gap</th>
                    </tr>
                </thead>
                <tbody>
                    {DIMENSIONS.map((dim, i) => (
                        <tr key={dim} className="border-b">
                            <td className="p-2 font-medium">{dim}</td>
                            <td className="p-2 text-center">{currentScores[i]}</td>
                            <td className="p-2 text-center">{targetScores[i]}</td>
                            <td className="p-2 text-center font-bold">{targetScores[i] - currentScores[i]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Leadership DNA</h2>
                    <p className="text-slate-500">Analyze leadership gaps between current capabilities and future targets.</p>
                </div>
                <ExportButton 
                    toolName="Leadership DNA" 
                    renderContent={renderExportContent} 
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="space-y-6 bg-white p-6 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-lg">Competency Scores (0-10)</h3>

                    <div className="grid grid-cols-3 gap-4 mb-2">
                        <div className="col-span-1"></div>
                        <div className="text-center text-sm font-semibold text-slate-700">Current</div>
                        <div className="text-center text-sm font-semibold text-cyan-600">Target</div>
                    </div>

                    {DIMENSIONS.map(dim => (
                        <div key={dim} className="grid grid-cols-3 gap-4 items-center">
                            <label className="text-sm font-medium text-slate-700">{dim}</label>

                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={data[`current_${dim}`] || 0}
                                onChange={(e) => handleChange('current', dim, parseInt(e.target.value))}
                                className="w-full text-center border border-slate-300 rounded-md p-1 focus:ring-2 focus:ring-slate-500 outline-none"
                            />

                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={data[`target_${dim}`] || 0}
                                onChange={(e) => handleChange('target', dim, parseInt(e.target.value))}
                                className="w-full text-center border border-cyan-200 rounded-md p-1 focus:ring-2 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                    ))}

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => updateData(toolId, {})}>
                            Reset All
                        </Button>
                    </div>
                </div>

                {/* Visualization */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 flex flex-col items-center justify-center">
                    <div className="w-full max-w-md aspect-square">
                        <Radar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Gap Analysis Table */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-lg mb-4">Gap Analysis</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 uppercase text-xs font-bold text-slate-500">
                            <tr>
                                <th className="px-4 py-2">Dimension</th>
                                <th className="px-4 py-2 text-center">Current</th>
                                <th className="px-4 py-2 text-center">Target</th>
                                <th className="px-4 py-2 text-center">Gap</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {DIMENSIONS.map((dim, i) => {
                                const curr = currentScores[i];
                                const target = targetScores[i];
                                const gap = target - curr;
                                return (
                                    <tr key={dim} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 font-medium">{dim}</td>
                                        <td className="px-4 py-2 text-center">{curr}</td>
                                        <td className="px-4 py-2 text-center">{target}</td>
                                        <td className={`px-4 py-2 text-center font-bold ${gap > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {gap > 0 ? `-${gap}` : '✓'}
                                        </td>
                                        <td className="px-4 py-2">
                                            {gap > 3 ? (
                                                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">Critical Gap</span>
                                            ) : gap > 0 ? (
                                                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">Improvement Needed</span>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs">Strength</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
