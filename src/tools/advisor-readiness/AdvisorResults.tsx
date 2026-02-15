
import React from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { CATEGORIES } from './questions';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface AdvisorResultsProps {
    scores: Record<string, number>; // categoryId -> total score
    maxScores: Record<string, number>; // categoryId -> max possible score
}

export const AdvisorResults: React.FC<AdvisorResultsProps> = ({ scores, maxScores }) => {

    // Calculate percentage per category
    const percentages = CATEGORIES.map(cat => {
        const raw = scores[cat.id] || 0;
        const max = maxScores[cat.id] || 1;
        return Math.round((raw / max) * 100);
    });

    const overallScore = Math.round(
        percentages.reduce((a, b) => a + b, 0) / CATEGORIES.length
    );

    const chartData = {
        labels: CATEGORIES.map(c => c.label),
        datasets: [
            {
                label: 'Readiness Score',
                data: percentages,
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(79, 70, 229, 1)',
            },
        ],
    };

    const options = {
        scales: {
            r: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20,
                    display: false // Hide numbers for cleaner look
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        maintainAspectRatio: false
    };

    const getBand = (score: number) => {
        if (score >= 80) return { label: 'Scaling', color: 'text-emerald-600', bg: 'bg-emerald-100' };
        if (score >= 60) return { label: 'Growing', color: 'text-blue-600', bg: 'bg-blue-100' };
        return { label: 'Emerging', color: 'text-amber-600', bg: 'bg-amber-100' };
    };

    const band = getBand(overallScore);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px]">
                <h3 className="text-xl font-bold text-slate-800 mb-6 w-full text-left">Readiness Profile</h3>
                <div className="relative w-full h-[300px] max-w-md">
                    <Radar data={chartData} options={options} />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <div className="text-center mb-8 pb-8 border-b border-slate-100">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Overall Readiness</div>
                    <div className={`text-6xl font-black ${band.color}`}>
                        {overallScore}%
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${band.bg} ${band.color}`}>
                        {band.label}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4">
                    <h4 className="font-semibold text-slate-800">Category Breakdown</h4>
                    {CATEGORIES.map((cat, idx) => (
                        <div key={cat.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700">{cat.label}</span>
                                <span className="font-bold text-slate-900">{percentages[idx]}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${cat.color.split(' ')[0].replace('bg-', 'bg-')}`}
                                    style={{ width: `${percentages[idx]}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
