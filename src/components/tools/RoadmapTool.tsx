import { useState, useEffect, useMemo } from 'react';
import type { ToolProps, ValidationResult, PDFSection } from '@types/tool';
import { toolRegistry } from '@lib/tools';
import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  Badge
} from '@components/shared';

interface Task {
  id: string;
  title: string;
  owner: string;
  week: number; // 1-12
  status: 'planned' | 'in-progress' | 'completed';
  dependencies: string[]; // Task IDs
  notes: string;
}

interface RoadmapData {
  tasks: Task[];
  phases: {
    foundation: { weeks: [1, 2, 3, 4]; color: string };
    growth: { weeks: [5, 6, 7, 8]; color: string };
    scale: { weeks: [9, 10, 11, 12]; color: string };
  };
  lastUpdated: number;
}

const phaseConfig = [
  { key: 'foundation', label: 'Foundation', weeks: [1, 2, 3, 4], color: '#4F46E5', bgColor: '#EEF2FF' },
  { key: 'growth', label: 'Growth', weeks: [5, 6, 7, 8], color: '#059669', bgColor: '#ECFDF5' },
  { key: 'scale', label: 'Scale', weeks: [9, 10, 11, 12], color: '#D97706', bgColor: '#FFFBEB' }
];

const statusConfig = {
  'planned': { label: 'Planned', color: 'gray', variant: 'secondary' as const },
  'in-progress': { label: 'In Progress', color: 'blue', variant: 'warning' as const },
  'completed': { label: 'Completed', color: 'green', variant: 'success' as const }
};

const defaultData: RoadmapData = {
  tasks: [],
  phases: {
    foundation: { weeks: [1, 2, 3, 4], color: '#4F46E5' },
    growth: { weeks: [5, 6, 7, 8], color: '#059669' },
    scale: { weeks: [9, 10, 11, 12], color: '#D97706' }
  },
  lastUpdated: Date.now()
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function RoadmapTool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<RoadmapData>(
    (data as RoadmapData) || defaultData
  );
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    owner: '',
    week: 1,
    status: 'planned',
    dependencies: [],
    notes: ''
  });
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [editingTask, setEditingTask] = useState<string | null>(null);

  useEffect(() => {
    if (data) setFormData(data as RoadmapData);
  }, [data]);

  const addTask = () => {
    if (!newTask.title?.trim()) return;

    const task: Task = {
      id: generateId(),
      title: newTask.title.trim(),
      owner: newTask.owner?.trim() || 'Unassigned',
      week: newTask.week || 1,
      status: newTask.status || 'planned',
      dependencies: newTask.dependencies || [],
      notes: newTask.notes || ''
    };

    const updated = {
      ...formData,
      tasks: [...formData.tasks, task],
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
    setNewTask({ title: '', owner: '', week: 1, status: 'planned', dependencies: [], notes: '' });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updated = {
      ...formData,
      tasks: formData.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const removeTask = (taskId: string) => {
    // Also remove this task from any dependencies
    const updated = {
      ...formData,
      tasks: formData.tasks
        .filter(t => t.id !== taskId)
        .map(t => ({
          ...t,
          dependencies: t.dependencies.filter(d => d !== taskId)
        })),
      lastUpdated: Date.now()
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = formData.tasks.length;
    const completed = formData.tasks.filter(t => t.status === 'completed').length;
    const inProgress = formData.tasks.filter(t => t.status === 'in-progress').length;
    const planned = formData.tasks.filter(t => t.status === 'planned').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byPhase = phaseConfig.map(phase => ({
      ...phase,
      tasks: formData.tasks.filter(t => phase.weeks.includes(t.week))
    }));

    return { total, completed, inProgress, planned, progress, byPhase };
  }, [formData.tasks]);

  // Get phase for a week
  const getPhaseForWeek = (week: number) => {
    return phaseConfig.find(p => p.weeks.includes(week)) || phaseConfig[0];
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">90-Day Roadmap</h3>
            <p className="text-sm text-gray-500">
              {stats.total} tasks • {stats.progress}% complete
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === 'timeline' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Phase legend */}
        <div className="flex gap-4 mb-4">
          {phaseConfig.map(phase => (
            <div key={phase.key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: phase.color }}
              />
              <span className="text-sm">{phase.label} (Wk {phase.weeks[0]}-{phase.weeks[3]})</span>
              <Badge size="sm">{stats.byPhase.find(p => p.key === phase.key)?.tasks.length || 0}</Badge>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{stats.completed} completed</span>
          <span>{stats.inProgress} in progress</span>
          <span>{stats.planned} planned</span>
        </div>
      </Card>

      {/* Timeline View (PLN-04) */}
      {viewMode === 'timeline' && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline View</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Week headers */}
              <div className="flex border-b border-gray-200">
                <div className="w-24 shrink-0" />
                {Array.from({ length: 12 }, (_, i) => i + 1).map(week => {
                  const phase = getPhaseForWeek(week);
                  return (
                    <div
                      key={week}
                      className="flex-1 text-center py-2 text-xs font-medium border-l"
                      style={{ backgroundColor: phase.bgColor }}
                    >
                      W{week}
                    </div>
                  );
                })}
              </div>

              {/* Tasks */}
              {formData.tasks.map(task => {
                const phase = getPhaseForWeek(task.week);
                return (
                  <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50">
                    <div className="w-24 shrink-0 p-2 text-xs truncate">{task.title}</div>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(week => (
                      <div
                        key={week}
                        className="flex-1 p-1 border-l border-gray-100"
                        style={{
                          backgroundColor: week === task.week ? phase.bgColor : 'transparent'
                        }}
                      >
                        {week === task.week && (
                          <div
                            className="rounded px-1 py-0.5 text-xs text-white truncate cursor-pointer"
                            style={{ backgroundColor: phase.color }}
                            onClick={() => !readonly && setEditingTask(task.id)}
                            title={task.title}
                          >
                            {task.owner.split(' ')[0]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              {formData.tasks.length === 0 && (
                <div className="py-8 text-center text-gray-500 text-sm">
                  No tasks yet. Add your first task below.
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {phaseConfig.map(phase => (
            <Card key={phase.key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: phase.color }}
                  />
                  {phase.label} Phase (Weeks {phase.weeks[0]}-{phase.weeks[3]})
                </CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {formData.tasks
                  .filter(t => phase.weeks.includes(t.week))
                  .sort((a, b) => a.week - b.week)
                  .map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={statusConfig[task.status].variant} size="sm">
                          {statusConfig[task.status].label}
                        </Badge>
                        <div>
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="text-xs text-gray-500">
                            Week {task.week} • {task.owner}
                            {task.dependencies.length > 0 && (
                              <span> • Depends on {task.dependencies.length} task(s)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!readonly && (
                        <div className="flex items-center gap-2">
                          {/* Status cycle buttons */}
                          <select
                            value={task.status}
                            onChange={(e) => updateTask(task.id, { status: e.target.value as Task['status'] })}
                            className="text-xs border rounded px-2 py-1"
                          >
                            <option value="planned">Planned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <button
                            onClick={() => removeTask(task.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                {formData.tasks.filter(t => phase.weeks.includes(t.week)).length === 0 && (
                  <p className="text-sm text-gray-500 italic py-2">No tasks in this phase</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Task Form (PLN-02) */}
      {!readonly && (
        <Card>
          <CardHeader>
            <CardTitle>Add Task</CardTitle>
          </CardHeader>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={newTask.title || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What needs to be done?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                value={newTask.owner || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, owner: e.target.value }))}
                placeholder="Who owns this?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Week (1-12)</label>
              <select
                value={newTask.week || 1}
                onChange={(e) => setNewTask(prev => ({ ...prev, week: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(week => {
                  const phase = getPhaseForWeek(week);
                  return (
                    <option key={week} value={week}>
                      Week {week} ({phase.label})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Dependencies */}
          {formData.tasks.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dependencies (optional)</label>
              <div className="flex flex-wrap gap-2">
                {formData.tasks.map(task => (
                  <label key={task.id} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={newTask.dependencies?.includes(task.id) || false}
                      onChange={(e) => {
                        const deps = newTask.dependencies || [];
                        setNewTask(prev => ({
                          ...prev,
                          dependencies: e.target.checked
                            ? [...deps, task.id]
                            : deps.filter(d => d !== task.id)
                        }));
                      }}
                      className="rounded"
                    />
                    {task.title}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={addTask}>Add Task</Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      {!readonly && (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => {
            setFormData(defaultData);
            onUpdate?.(defaultData);
          }}>
            Clear All
          </Button>
          <Button variant="primary" onClick={() => onUpdate?.(formData)}>
            Save Roadmap
          </Button>
        </div>
      )}
    </div>
  );
}

// Validation
export function validateRoadmap(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = data as RoadmapData;

  if (d.tasks.length === 0) {
    warnings.push('No tasks defined - add tasks to build your roadmap');
  }

  // Check for tasks without owners
  const unassigned = d.tasks.filter(t => !t.owner || t.owner === 'Unassigned');
  if (unassigned.length > 0) {
    warnings.push(`${unassigned.length} task(s) have no owner assigned`);
  }

  // Check for dependency cycles (simple check)
  const completedTasks = d.tasks.filter(t => t.status === 'completed').map(t => t.id);
  const blockedTasks = d.tasks.filter(t =>
    t.status === 'in-progress' &&
    t.dependencies.some(dep => !completedTasks.includes(dep))
  );
  if (blockedTasks.length > 0) {
    warnings.push(`${blockedTasks.length} task(s) are in progress but have incomplete dependencies`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

// PDF Export
export function exportRoadmapToPDF(data: unknown): PDFSection {
  const d = data as RoadmapData;

  const completed = d.tasks.filter(t => t.status === 'completed').length;
  const total = d.tasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    title: '90-Day Roadmap',
    summary: `${total} tasks • ${progress}% complete`,
    tables: [{
      headers: ['Task', 'Owner', 'Week', 'Phase', 'Status'],
      rows: d.tasks
        .sort((a, b) => a.week - b.week)
        .map(t => {
          const phase = phaseConfig.find(p => p.weeks.includes(t.week))?.label || '';
          return [t.title, t.owner, `Week ${t.week}`, phase, t.status];
        })
    }],
    insights: [
      `Overall progress: ${progress}% (${completed}/${total} tasks)`,
      `Foundation phase: ${d.tasks.filter(t => t.week <= 4).length} tasks`,
      `Growth phase: ${d.tasks.filter(t => t.week > 4 && t.week <= 8).length} tasks`,
      `Scale phase: ${d.tasks.filter(t => t.week > 8).length} tasks`
    ],
    rawData: d
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: '90day-roadmap',
    name: '90-Day Roadmap',
    description: 'Plan your 12-week execution roadmap with task tracking and dependencies',
    category: 'planning',
    order: 9,
    estimatedTime: 20
  },
  component: RoadmapTool,
  validate: validateRoadmap,
  exportToPDF: exportRoadmapToPDF,
  getDefaultData: () => defaultData
});
