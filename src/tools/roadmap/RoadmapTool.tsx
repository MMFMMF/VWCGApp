
import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { RoadmapTimeline } from './RoadmapTimeline';
import type { RoadmapTask } from './RoadmapTimeline';
import { Button } from '../../components/ui/Button';
import { ExportButton } from '../../components/ui/ExportButton';
import { Plus, Trash2, Map } from 'lucide-react';

const TOOL_ID = 'roadmap';

interface RoadmapData {
    tasks: RoadmapTask[];
}

const EMPTY_DATA: RoadmapData = { tasks: [] };

export const RoadmapTool: React.FC = () => {
    const { tools, updateToolData } = useWorkspaceStore();
    const data = (tools[TOOL_ID] as RoadmapData) || EMPTY_DATA;
    const tasks = data.tasks || [];

    // Form State
    const [title, setTitle] = useState('');
    const [owner, setOwner] = useState('');
    const [week, setWeek] = useState(1);
    const [status, setStatus] = useState<RoadmapTask['status']>('planned');
    const [dependencies, setDependencies] = useState('');

    const addTask = () => {
        if (!title.trim()) return;

        const newTask: RoadmapTask = {
            id: crypto.randomUUID(),
            title,
            owner,
            week,
            status,
            dependencies
        };

        updateToolData(TOOL_ID, {
            ...data,
            tasks: [...tasks, newTask]
        });

        setTitle('');
        setOwner('');
        setDependencies('');
        // Keep week/status logic for rapid entry
    };

    const removeTask = (id: string) => {
        updateToolData(TOOL_ID, {
            ...data,
            tasks: tasks.filter(t => t.id !== id)
        });
    };

    // Render content for PDF export
    const renderExportContent = () => (
        <RoadmapTimeline tasks={tasks} />
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Map className="w-8 h-8 text-indigo-600" />
                        90-Day Scaling Roadmap
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Visualize and track your execution plan across 12 weeks.
                    </p>
                </div>
                <ExportButton 
                    toolName="90-Day Roadmap" 
                    renderContent={renderExportContent} 
                />
            </div>

            {/* Timeline View */}
            <RoadmapTimeline tasks={tasks} />

            {/* Editor Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" /> Add Task
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8">
                    <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g., Hire VP of Sales"
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Owner</label>
                        <input
                            type="text"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g., CEO"
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Week (1-12)</label>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={week}
                            onChange={(e) => setWeek(parseInt(e.target.value))}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as RoadmapTask['status'])}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="planned">Planned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <Button onClick={addTask} disabled={!title.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="md:col-span-12">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dependencies</label>
                        <input
                            type="text"
                            value={dependencies}
                            onChange={(e) => setDependencies(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Task IDs or Names this depends on..."
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        />
                    </div>
                </div>

                {/* Task List Table */}
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-slate-600">Week</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">Task</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">Owner</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">Dependencies</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                                <th className="px-4 py-3 font-semibold text-slate-600 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No tasks added yet.</td>
                                </tr>
                            ) : (
                                tasks.sort((a, b) => a.week - b.week).map(task => (
                                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-slate-500">{task.week}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{task.title}</td>
                                        <td className="px-4 py-3 text-slate-600">{task.owner}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500 truncate max-w-[150px]">{task.dependencies || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize 
                                                ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-slate-100 text-slate-600'}`}>
                                                {task.status.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => removeTask(task.id)} className="text-slate-300 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
