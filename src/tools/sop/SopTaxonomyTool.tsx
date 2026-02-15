
import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../../components/ui/Button';
import { ExportButton } from '../../components/ui/ExportButton';
import { FolderTree, Plus, ChevronRight, ChevronDown, Trash2, Layers, FileText } from 'lucide-react';

const TOOL_ID = 'sop-taxonomy';

interface TaxonomyNode {
    id: string;
    type: 'department' | 'category' | 'process';
    name: string;
    children: TaxonomyNode[];
}

// Initial state if empty
const INITIAL_TAXONOMY: TaxonomyNode[] = [
    {
        id: 'dept-1', type: 'department', name: 'Operations', children: [
            { id: 'cat-1', type: 'category', name: 'Logistics', children: [] }
        ]
    }
];

export const SopTaxonomyTool: React.FC = () => {
    const { tools, updateToolData } = useWorkspaceStore();
    const taxonomy = (tools[TOOL_ID]?.taxonomy as TaxonomyNode[]) || INITIAL_TAXONOMY;
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const updateTaxonomy = (newTaxonomy: TaxonomyNode[]) => {
        updateToolData(TOOL_ID, { taxonomy: newTaxonomy });
    };

    const addNode = (parentId: string | null, type: TaxonomyNode['type']) => {
        const name = prompt(`Enter ${type} name:`);
        if (!name) return;

        const newNode: TaxonomyNode = {
            id: crypto.randomUUID(),
            type,
            name,
            children: []
        };

        if (parentId === null) {
            // Add Department (Root)
            updateTaxonomy([...taxonomy, newNode]);
        } else {
            // Recursive add
            const addRecursive = (nodes: TaxonomyNode[]): TaxonomyNode[] => {
                return nodes.map(node => {
                    if (node.id === parentId) {
                        return { ...node, children: [...node.children, newNode] };
                    }
                    if (node.children.length > 0) {
                        return { ...node, children: addRecursive(node.children) };
                    }
                    return node;
                });
            };
            updateTaxonomy(addRecursive(taxonomy));
            setExpanded(prev => ({ ...prev, [parentId]: true }));
        }
    };

    const deleteNode = (id: string) => {
        if (!confirm('Are you sure? This will delete all children.')) return;

        const deleteRecursive = (nodes: TaxonomyNode[]): TaxonomyNode[] => {
            return nodes.filter(n => n.id !== id).map(n => ({
                ...n,
                children: deleteRecursive(n.children)
            }));
        };
        updateTaxonomy(deleteRecursive(taxonomy));
    };

    const renderTree = (nodes: TaxonomyNode[], level: number = 0) => {
        return nodes.map(node => (
            <div key={node.id} className="select-none">
                <div
                    className={`flex items-center gap-2 p-2 hover:bg-slate-50 border-b border-slate-100 transition-colors ${level === 0 ? 'bg-slate-50/50' : ''}`}
                    style={{ paddingLeft: `${level * 24 + 12}px` }}
                >
                    {node.children.length > 0 || node.type !== 'process' ? (
                        <button onClick={() => toggleExpand(node.id)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                            {expanded[node.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    ) : <div className="w-6" />}

                    {node.type === 'department' && <Layers className="w-4 h-4 text-indigo-600" />}
                    {node.type === 'category' && <FolderTree className="w-4 h-4 text-amber-500" />}
                    {node.type === 'process' && <FileText className="w-4 h-4 text-slate-400" />}

                    <span className={`font-medium ${node.type === 'department' ? 'text-slate-800' : 'text-slate-600'}`}>
                        {node.name}
                    </span>

                    <span className="ml-2 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
                        {node.type}
                    </span>

                    <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {node.type === 'department' && (
                            <button onClick={() => addNode(node.id, 'category')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Cat
                            </button>
                        )}
                        {node.type === 'category' && (
                            <button onClick={() => addNode(node.id, 'process')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Proc
                            </button>
                        )}
                        <button onClick={() => deleteNode(node.id)} className="p-1 text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {expanded[node.id] && node.children.length > 0 && (
                    <div className="border-l border-slate-100 ml-4">
                        {renderTree(node.children, level + 1)}
                    </div>
                )}
            </div>
        ));
    };

    // Render content for PDF export - simplified tree list
    const renderExportContent = () => {
        const renderFlatTree = (nodes: TaxonomyNode[], level: number = 0): React.ReactNode => {
            return nodes.map(node => (
                <div key={node.id} style={{ paddingLeft: `${level * 20}px` }} className="py-1">
                    <span className="font-medium">{node.name}</span>
                    <span className="text-slate-400 text-xs ml-2">({node.type})</span>
                    {node.children.length > 0 && renderFlatTree(node.children, level + 1)}
                </div>
            ));
        };
        return <div className="space-y-1">{renderFlatTree(taxonomy)}</div>;
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <FolderTree className="w-8 h-8 text-indigo-600" />
                        SOP Taxonomy
                    </h2>
                    <p className="text-slate-500 mt-1">Design the structural hierarchy (Dept → Category → Process).</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton 
                        toolName="SOP Taxonomy" 
                        renderContent={renderExportContent} 
                    />
                    <Button onClick={() => addNode(null, 'department')} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Department
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase flex justify-between">
                    <span>Hierarchy Structure</span>
                    <span>Actions</span>
                </div>
                <div className="flex-1 overflow-y-auto group">
                    {renderTree(taxonomy)}
                    {taxonomy.length === 0 && (
                        <div className="p-8 text-center text-slate-400 italic">
                            No structure defined. Start by adding a Department.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
