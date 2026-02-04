import { cn } from '@lib/utils';
import { toolRegistry } from '@lib/tools';
import { useWorkspaceStore } from '@stores/workspaceStore';

export function ProgressIndicator() {
  const tools = useWorkspaceStore(s => s.tools);
  const allTools = toolRegistry.getAll();

  const completedCount = allTools.filter(tool => {
    const data = tools[tool.metadata.id];
    // Consider a tool "completed" if it has any data
    return data && Object.keys(data).length > 0;
  }).length;

  const percentage = allTools.length > 0
    ? Math.round((completedCount / allTools.length) * 100)
    : 0;

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Progress</span>
        <span className="font-medium text-gray-900">
          {completedCount}/{allTools.length} tools
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            percentage === 100 ? 'bg-green-500' : 'bg-primary-600'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
