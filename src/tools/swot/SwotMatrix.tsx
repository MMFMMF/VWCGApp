
import React from 'react';

export interface SwotItem {
    id: string;
    text: string;
    confidence: number; // 1-5
}

export type QuadrantType = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

export interface SwotData {
    strengths: SwotItem[];
    weaknesses: SwotItem[];
    opportunities: SwotItem[];
    threats: SwotItem[];
}

interface SwotMatrixProps {
    data: SwotData;
}

const Quadrant: React.FC<{
    title: string;
    items: SwotItem[];
    color: string;
    bg: string;
    border: string;
}> = ({ title, items, color, bg, border }) => (
    <div className={`p-6 rounded-lg border-2 ${border} ${bg} h-full min-h-[300px]`}>
        <h3 className={`text-lg font-bold uppercase tracking-wider mb-4 ${color}`}>{title}</h3>
        <ul className="space-y-3">
            {items.length === 0 ? (
                <li className="text-sm text-slate-400 italic">No items added yet.</li>
            ) : (
                items.map(item => (
                    <li key={item.id} className="bg-white/50 p-2 rounded border border-slate-200/50 flex justify-between items-start">
                        <span className="text-slate-800 text-sm font-medium">{item.text}</span>
                        <div className="flex gap-1 ml-2 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full ${i < item.confidence ? color.replace('text-', 'bg-') : 'bg-slate-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </li>
                ))
            )}
        </ul>
    </div>
);

export const SwotMatrix: React.FC<SwotMatrixProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Quadrant
                title="Strengths"
                items={data.strengths}
                color="text-emerald-700"
                bg="bg-emerald-50"
                border="border-emerald-200"
            />
            <Quadrant
                title="Weaknesses"
                items={data.weaknesses}
                color="text-rose-700"
                bg="bg-rose-50"
                border="border-rose-200"
            />
            <Quadrant
                title="Opportunities"
                items={data.opportunities}
                color="text-blue-700"
                bg="bg-blue-50"
                border="border-blue-200"
            />
            <Quadrant
                title="Threats"
                items={data.threats}
                color="text-amber-700"
                bg="bg-amber-50"
                border="border-amber-200"
            />
        </div>
    );
};
