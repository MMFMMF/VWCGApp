
import React from 'react';

interface VisionData {
    northStar: string;
    pillars: { id: string; title: string; kpi: string }[];
    values: { id: string; text: string }[];
}

export const VisionBoard: React.FC<{ data: VisionData }> = ({ data }) => {
    return (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm min-h-[500px]">
            <div className="text-center mb-12">
                <h3 className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">North Star Metric</h3>
                <div className="text-4xl font-bold text-slate-900 mx-auto max-w-2xl">
                    {data.northStar || "Define your North Star Metric..."}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {data.pillars.length > 0 ? (
                    data.pillars.map((pillar, idx) => (
                        <div key={pillar.id || idx} className="bg-slate-50 p-6 rounded-lg border-t-4 border-cyan-500 shadow-sm">
                            <h4 className="font-bold text-lg text-slate-800 mb-2">{pillar.title}</h4>
                            <div className="text-sm text-slate-500 font-mono">KPI: {pillar.kpi}</div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center text-slate-400 py-8 border-2 border-dashed border-slate-200 rounded-lg">
                        Add strategic pillars to support your vision.
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100 pt-8">
                <h3 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Core Values</h3>
                <div className="flex flex-wrap justify-center gap-3">
                    {data.values.length > 0 ? (
                        data.values.map((val, idx) => (
                            <span key={val.id || idx} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                                {val.text}
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-400 italic">No core values defined yet.</span>
                    )}
                </div>
            </div>
        </div>
    );
};
