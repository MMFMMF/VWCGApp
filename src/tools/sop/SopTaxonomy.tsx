
import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Folder, User, FileText, ChevronRight, ChevronDown } from 'lucide-react';

const TOOL_ID = 'sop';

export interface TaxonomyItem {
    id: string;
    type: 'dept' | 'role' | 'process';
    name: string;
    parentId: string | null;
}

interface SopData {
    taxonomy: TaxonomyItem[];
}

const EMPTY_DATA: SopData = { taxonomy: [] };

export const SopTaxonomy: React.FC = () => {
    const { tools, updateToolData } = useWorkspaceStore();
    const data = (tools[TOOL_ID] as SopData) || EMPTY_DATA;
    const items = data.taxonomy || [];

    const [newItemName, setNewItemName] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const addItem = (type: TaxonomyItem['type'], parentId: string | null) => {
        if (!newItemName.trim()) return;

        const newItem: TaxonomyItem = {
            id: crypto.randomUUID(),
            type,
            name: newItemName,
            parentId
        };

        updateToolData(TOOL_ID, {
            ...data,
            taxonomy: [...items, newItem]
        });
        setNewItemName('');

        if (parentId) {
            setExpandedIds(prev => new Set(prev).add(parentId));
        }
    };

    const removeItem = (id: string) => {
        // Cascading delete
        const idsToDelete = new Set([id]);

        // Find all descendants
        let foundNew = true;
        while (foundNew) {
            foundNew = false;
            items.forEach(item => {
                if (item.parentId && idsToDelete.has(item.parentId) && !idsToDelete.has(item.id)) {
                    idsToDelete.add(item.id);
                    foundNew = true;
                }
            });
        }

        const newTaxonomy = items.filter(i => !idsToDelete.has(i.id));
        updateToolData(TOOL_ID, { ...data, taxonomy: newTaxonomy });
        if (selectedParentId === id) setSelectedParentId(null);
    };

    const renderTree = (parentId: string | null, level = 0) => {
        const nodes = items.filter(i => i.parentId === parentId);

        if (nodes.length === 0 && parentId !== null) return null;

        return (
            <div className={`${level > 0 ? 'ml-6 border-l border-slate-200 pl-4' : ''} space-y-2`}>
                {nodes.map(node => {
                    const hasChildren = items.some(i => i.parentId === node.id);
                    const isExpanded = expandedIds.has(node.id);
                    const isSelected = selectedParentId === node.id;

                    let Icon = Folder;
                    let color = 'text-blue-500';
                    if (node.type === 'role') { Icon = User; color = 'text-purple-500'; }
                    if (node.type === 'process') { Icon = FileText; color = 'text-slate-500'; }

                    return (
                        <div key={node.id}>
                            <div
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent'
                                    }`}
                                onClick={() => setSelectedParentId(isSelected ? null : node.id)}
                            >
                                {hasChildren ? (
                                    <button onClick={(e) => toggleExpand(node.id, e)} className="p-0.5 hover:bg-slate-200 rounded">
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                    </button>
                                ) : <div className="w-5" />}

                                <Icon className={`w-4 h-4 ${color}`} />
                                <span className="text-sm font-medium text-slate-700 flex-1">{node.name}</span>

                                <button onClick={(e) => { e.stopPropagation(); removeItem(node.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {isExpanded && renderTree(node.id, level + 1)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getAddLabel = () => {
        if (!selectedParentId) return 'Department';
        const parent = items.find(i => i.id === selectedParentId);
        if (parent?.type === 'dept') return 'Role';
        if (parent?.type === 'role') return 'Process';
        return null; // Can't add to process
    };

    const addType = getAddLabel();

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col lg:flex-row gap-8 min-h-[500px]">
            <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Folder className="w-6 h-6 text-indigo-600" />
                    Organization Taxonomy
                </h3>

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 min-h-[400px] overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="text-center text-slate-400 py-10 italic">
                            No items defined correctly. Start by adding a Department.
                        </div>
                    ) : renderTree(null)}
                </div>
            </div>

            <div className="w-full lg:w-80 space-y-6">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-4">Add Item</h4>

                    {addType ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Adding {addType} {selectedParentId ? `to ${items.find(i => i.id === selectedParentId)?.name}` : 'to Root'}
                                </label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={`e.g., ${addType === 'Department' ? 'Marketing' : addType === 'Role' ? 'Manager' : 'Quarterly Review'}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addItem(addType === 'Department' ? 'dept' : addType === 'Role' ? 'role' : 'process', selectedParentId);
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                onClick={() => addItem(
                                    addType === 'Department' ? 'dept' : addType === 'Role' ? 'role' : 'process',
                                    selectedParentId
                                )}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={!newItemName.trim()}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add {addType}
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 italic">
                            Select a Department or Role to add child items. Processes exist at the lowest level.
                        </p>
                    )}
                </div>

                <div className="text-xs text-slate-400">
                    <p className="font-semibold mb-1">Hierarchy Rules:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Departments contain Roles</li>
                        <li>Roles perform Processes</li>
                        <li>Processes are the leaf nodes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
