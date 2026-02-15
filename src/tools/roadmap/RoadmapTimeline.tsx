
import React from 'react';

export interface RoadmapTask {
    id: string;
    title: string;
    owner: string;
    week: number; // 1-12
    status: 'planned' | 'in-progress' | 'completed';
    dependencies?: string;
}

interface RoadmapTimelineProps {
    tasks: RoadmapTask[];
}

const PHASES = [
    { id: 1, label: 'Phase 1: Foundation (Days 1-30)', weeks: [1, 2, 3, 4], color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    { id: 2, label: 'Phase 2: Growth (Days 31-60)', weeks: [5, 6, 7, 8], color: 'bg-blue-50 border-blue-200 text-blue-800' },
    { id: 3, label: 'Phase 3: Scale (Days 61-90)', weeks: [9, 10, 11, 12], color: 'bg-purple-50 border-purple-200 text-purple-800' }
];

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ tasks }) => {

    const getStatusColor = (status: RoadmapTask['status']) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500';
            case 'in-progress': return 'bg-blue-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-6">90-Day Execution Timeline</h3>

            <div className="min-w-[800px]">
                {/* Header Rows */}
                <div className="grid grid-cols-12 gap-2 mb-2">
                    {PHASES.map(phase => (
                        <div key={phase.id} className={`col-span-4 p-2 rounded text-center border font-semibold text-sm ${phase.color}`}>
                            {phase.label}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-2 mb-6 text-center">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                            Week {i + 1}
                        </div>
                    ))}
                </div>

                {/* Task Grid */}
                <div className="space-y-3 relative">
                    {/* Vertical Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-12 gap-2 pointer-events-none">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className={`border-r ${i % 4 === 3 ? 'border-dashed border-slate-300' : 'border-dotted border-slate-100'} h-full`} />
                        ))}
                    </div>

                    {tasks.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 italic border-2 border-dashed border-slate-100 rounded-lg">
                            No tasks scheduled. Add tasks to visualize the roadmap.
                        </div>
                    ) : (
                        tasks.sort((a, b) => a.week - b.week).map(task => (
                            <div key={task.id} className="grid grid-cols-12 gap-2 relative z-10 group">
                                <div
                                    className={`col-start-${task.week} col-span-1 rounded p-2 text-xs text-white shadow-sm flex flex-col justify-center min-h-[60px] cursor-default hover:scale-105 transition-transform ${getStatusColor(task.status)}`}
                                    style={{ gridColumnStart: task.week, gridColumnEnd: task.week + 1 }}
                                >
                                    <div className="font-bold truncate" title={task.title}>{task.title}</div>
                                    <div className="text-[10px] opacity-90 truncate">{task.owner}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-8 pt-4 border-t border-slate-100 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400" />
                    <span className="text-slate-600">Planned</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-600">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">Completed</span>
                </div>
            </div>
        </div>
    );
};
