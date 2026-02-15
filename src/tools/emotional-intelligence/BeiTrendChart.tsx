import React, { useMemo } from 'react';
import { Chart } from 'react-chartjs-2';


interface BeiEntry {
    id: string;
    date: string;
    dimensions: {
        id: string;
        score: number; // 1-10
        confidence: number; // 1-5
    }[];
}

interface BeiTrendChartProps {
    entries: BeiEntry[];
}

export const BeiTrendChart: React.FC<BeiTrendChartProps> = ({ entries }) => {
    const chartData = useMemo(() => {
        // Sort entries by date
        const sortedEntries = [...entries].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const labels = sortedEntries.map(e => e.date);

        const dimensionDatasets = [
            { id: 'self_awareness', color: '#ef4444' }, // red
            { id: 'self_regulation', color: '#f97316' }, // orange
            { id: 'motivation', color: '#eab308' }, // yellow
            { id: 'empathy', color: '#22c55e' }, // green
            { id: 'social_skills', color: '#3b82f6' }, // blue
            { id: 'intuition', color: '#a855f7' } // purple
        ].map(dim => ({
            type: 'line' as const,
            label: dim.id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            borderColor: dim.color,
            backgroundColor: dim.color + '20', // Add transparency for fill
            borderWidth: 2,
            pointRadius: 3,
            fill: {
                target: 'origin',
                above: dim.color + '10' // Very light fill to indicate confidence area implicitly
            },
            data: sortedEntries.map(e => e.dimensions.find(d => d.id === dim.id)?.score || 0),
            tension: 0.3
        }));

        // Average line (dashed)
        const averages = sortedEntries.map(entry => {
            if (!entry.dimensions || entry.dimensions.length === 0) return 0;
            const sum = entry.dimensions.reduce((acc, curr) => acc + curr.score, 0);
            return sum / entry.dimensions.length;
        });

        const averageDataset = {
            type: 'line' as const,
            label: 'Overall Average',
            borderColor: '#cbd5e1', // slate-300
            borderWidth: 3,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            data: averages,
            tension: 0.1
        };

        return {
            labels,
            datasets: [...dimensionDatasets, averageDataset]
        };
    }, [entries]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#e2e8f0' // slate-200
                }
            },
            title: {
                display: true,
                text: 'Emotional Intelligence Trend',
                color: '#f8fafc' // slate-50
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                ticks: { color: '#94a3b8' },
                grid: { color: '#334155' }
            },
            x: {
                ticks: { color: '#94a3b8' },
                grid: { display: false }
            }
        }
    };

    return (
        <div className="w-full h-[400px] bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <Chart type='bar' data={chartData} options={options} />
        </div>
    );
};
