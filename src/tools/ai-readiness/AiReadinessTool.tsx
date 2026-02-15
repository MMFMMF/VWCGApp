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
    'Strategy',
    'Data',
    'Infrastructure',
    'Talent',
    'Governance',
    'Culture'
];

const EMPTY_DATA = {};

export const AiReadinessTool: React.FC = () => {
    // console.log('AI Readiness Tool Mounted');
    const toolId = 'ai-readiness';
    const data = useWorkspaceStore(state => state.tools[toolId] || EMPTY_DATA);
    const updateData = useWorkspaceStore(state => state.updateToolData);

    const scores = DIMENSIONS.map(dim => data[dim] || 0);

    const handleChange = (dim: string, val: number) => {
        updateData(toolId, { [dim]: val });
    };

    const chartData = {
        labels: DIMENSIONS,
        datasets: [
            {
                label: 'AI Readiness Score',
                data: scores,
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
                max: 100,
                ticks: { stepSize: 20 },
                grid: { color: 'rgba(0,0,0,0.1)' },
                pointLabels: { font: { size: 14 } }
            }
        }
    };

    // Render content for PDF export
    const renderExportContent = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {DIMENSIONS.map(dim => (
                    <div key={dim} className="flex justify-between p-3 bg-slate-50 rounded">
                        <span className="font-medium">{dim}</span>
                        <span className="text-cyan-600 font-bold">{data[dim] || 0}%</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-center">
                <div className="w-80 h-80">
                    <Radar data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">AI Readiness Assessment</h2>
                    <p className="text-slate-500">Evaluate your organization's preparedness for AI adoption.</p>
                </div>
                <ExportButton 
                    toolName="AI Readiness Assessment" 
                    renderContent={renderExportContent} 
                />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="space-y-6 bg-white p-6 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-lg">Assessment Criteria</h3>
                    {DIMENSIONS.map(dim => (
                        <div key={dim} className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-700">{dim}</label>
                                <span className="text-sm text-slate-500">{data[dim] || 0}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={data[dim] || 0}
                                onChange={(e) => handleChange(dim, parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                            />
                        </div>
                    ))}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => updateData(toolId, {})}>
                            Reset Scores
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
        </div>
    );
};
