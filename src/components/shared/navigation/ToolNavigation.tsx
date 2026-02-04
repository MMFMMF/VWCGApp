import { NavLink } from 'react-router-dom';
import { cn } from '@lib/utils';
import { toolRegistry } from '@lib/tools';

export function ToolNavigation() {
  const tools = toolRegistry.getSorted();
  const categories = ['assessment', 'planning', 'sop', 'synthesis'];

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Assessment Tools
        </h2>

        {categories.map(category => {
          const categoryTools = tools.filter(t => t.metadata.category === category);
          if (categoryTools.length === 0) return null;

          return (
            <div key={category} className="mt-4">
              <h3 className="text-xs font-medium text-gray-400 uppercase">
                {category}
              </h3>
              <ul className="mt-2 space-y-1">
                {categoryTools.map(tool => (
                  <li key={tool.metadata.id}>
                    <NavLink
                      to={`/tools/${tool.metadata.id}`}
                      className={({ isActive }) =>
                        cn(
                          'block px-3 py-2 rounded-md text-sm',
                          isActive
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        )
                      }
                    >
                      {tool.metadata.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
