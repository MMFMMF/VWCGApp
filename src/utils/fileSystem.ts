import type { WorkspaceState } from '../store/workspaceStore';

export const saveWorkspaceToFile = (dataString: string, filename: string = 'workspace.vwcg') => {
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.vwcg') ? filename : `${filename}.vwcg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const loadWorkspaceFromFile = (file: File): Promise<Partial<WorkspaceState>> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const json = JSON.parse(text);
                // Simple validation: check if it looks like a workspace
                if (!json.version || !json.tools) {
                    throw new Error('Invalid workspace file format');
                }
                resolve(json);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};
