import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { AlertTriangle, ShieldCheck, Zap, AlertCircle, ChevronRight, ChevronDown, Sparkles, Key } from 'lucide-react';
import type { Insight } from '../../engine/types';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { getTools } from '../../registry/ToolRegistry';
import { cn } from '../../utils/cn';
import { consultAi } from '../../engine/cloud';

interface StrategicHealthWidgetProps {
    variant?: 'full' | 'sidebar';
}

export const StrategicHealthWidget: React.FC<StrategicHealthWidgetProps> = ({ variant = 'full' }) => {
    const insights = useWorkspaceStore(state => state.insights || []);
    // Note: updateToolData removed - was unused placeholder for store updates
    const entireState = useWorkspaceStore(state => state);

    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [apiKey, setApiKey] = useState(localStorage.getItem('VWCG_GEMINI_KEY') || '');

    const navigate = useNavigate();

    // Helper to get tool name
    const getToolName = (id: string) => {
        const tool = getTools().find(t => t.id === id);
        return tool ? tool.name : id;
    };

    const handleConsultAi = async () => {
        if (!apiKey) {
            setShowKeyInput(true);
            return;
        }

        setIsLoading(true);
        try {
            // Persist Key
            localStorage.setItem('VWCG_GEMINI_KEY', apiKey);
            setShowKeyInput(false);

            // Run Cloud Analysis
            const cloudInsights = await consultAi(entireState, apiKey);

            // Merge into store manually (Since we don't have a dedicated setInsights action yet, we'll hack it or add one)
            // Ideally we should add 'addInsights' to store. For now, let's assume we can modify the insights array via a store action we will add.
            // Wait, we need to add `addCloudInsights` to the store. simpler path for now:
            useWorkspaceStore.setState((state) => ({
                insights: [...state.insights.filter(i => !i.id.startsWith('cloud_')), ...cloudInsights.map(i => ({ ...i, id: `cloud_${i.id}` }))]
            }));

        } catch (err) {
            alert('AI Consultation Failed: ' + err);
            setShowKeyInput(true); // Re-prompt if failure might be auth
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeySave = () => {
        if (apiKey.trim().length > 0) {
            localStorage.setItem('VWCG_GEMINI_KEY', apiKey);
            setShowKeyInput(false);
            handleConsultAi();
        }
    };

    // Shared Header for Full/Sidebar
    const renderAiButton = () => (
        <Button
            size="sm"
            variant="ghost"
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-1 h-auto"
            onClick={(e) => { e.stopPropagation(); handleConsultAi(); }}
            disabled={isLoading}
        >
            {isLoading ? <span className="animate-spin mr-1">✨</span> : <Sparkles className="w-4 h-4 mr-1" />}
            {isLoading ? 'Thinking...' : 'Consult AI'}
        </Button>
    );

    if (insights.length === 0) {
        if (variant === 'sidebar') return (
            <div className="p-4 border-t border-slate-700 group">
                <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center space-x-3">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-xs font-medium">System Aligned</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleConsultAi} disabled={isLoading}>
                            <Sparkles className={`w-4 h-4 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
        );

        return (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm relative">
                <div className="absolute top-4 right-4">
                    {renderAiButton()}
                </div>
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Strategic Health</h3>
                </div>
                <div className="text-center py-6">
                    <p className="text-slate-500">No critical risks or conflicts detected.</p>
                    <p className="text-xs text-slate-400 mt-1">Your strategy appears aligned across established pillars.</p>
                </div>
            </div>
        );
    }

    const highSeverityCount = insights.filter(i => i.severity === 'high').length;

    if (variant === 'sidebar') {
        return (
            <div className={cn("border-t border-slate-800 transition-all duration-300", isExpanded ? "bg-slate-800" : "")}>
                <div className="flex items-center pr-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-1 p-4 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
                    >
                        <div className="flex items-center space-x-3 text-slate-300">
                            {highSeverityCount > 0 ? (
                                <div className="relative">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </div>
                            ) : (
                                <Zap className="w-5 h-5 text-indigo-400" />
                            )}
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white">Advisor Insights</span>
                                <span className="text-[10px] text-slate-400">{insights.length} active items</span>
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleConsultAi(); }}
                        disabled={isLoading}
                        className="p-2 text-indigo-400 hover:text-white"
                        title="Consult AI Agent"
                    >
                        <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-slate-500">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 max-h-96 overflow-y-auto">
                        {insights.map(insight => (
                            <div key={insight.id} className="bg-slate-900/50 rounded p-3 border border-slate-700/50">
                                <div className="flex items-start space-x-2">
                                    {insight.type === 'conflict' ? <AlertTriangle className="w-3 h-3 text-amber-500 mt-1" /> :
                                        insight.type === 'risk' ? <AlertCircle className="w-3 h-3 text-red-500 mt-1" /> :
                                            insight.id.startsWith('cloud_') ? <Sparkles className="w-3 h-3 text-purple-400 mt-1" /> :
                                                <Zap className="w-3 h-3 text-indigo-400 mt-1" />}
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            {insight.id.startsWith('cloud_') && <span className="text-[8px] bg-purple-900 text-purple-200 px-1 rounded uppercase">AI</span>}
                                            <p className="text-xs font-medium text-slate-200">{insight.title}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">{insight.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Zap className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Strategic Insights</h3>
                        <p className="text-sm text-slate-500">{insights.length} items require attention</p>
                    </div>
                </div>
                {renderAiButton()}
            </div>

            <div className="divide-y divide-slate-100">
                {insights.map((insight: Insight) => (
                    <div key={insight.id} className={`p-6 hover:bg-slate-50 transition-colors ${insight.id.startsWith('cloud_') ? 'bg-purple-50/50' : ''}`}>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                                {insight.type === 'conflict' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                                    insight.type === 'risk' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                                        insight.type === 'strength' ? <ShieldCheck className="w-5 h-5 text-green-500" /> :
                                            insight.id.startsWith('cloud_') ? <Sparkles className="w-5 h-5 text-purple-500" /> :
                                                <Zap className="w-5 h-5 text-blue-500" />}
                            </div>
                            <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <h4 className={`text-sm font-semibold ${insight.severity === 'high' ? 'text-red-900' : 'text-slate-900'
                                            }`}>
                                            {insight.title}
                                        </h4>
                                        {insight.id.startsWith('cloud_') && (
                                            <span className="flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                                <Sparkles className="w-3 h-3 mr-1" /> AI Generated
                                            </span>
                                        )}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                                        insight.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                                            insight.type === 'strength' ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        {insight.severity} {insight.type}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{insight.message}</p>

                                <div className="mt-3 bg-slate-50 p-3 rounded border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-700 uppercase mb-1">Recommendation</p>
                                    <p className="text-sm text-slate-800">{insight.recommendation}</p>
                                </div>

                                <div className="mt-4 flex items-center space-x-2">
                                    <span className="text-xs text-slate-400">Related Tools:</span>
                                    {insight.relatedTools.map(toolId => (
                                        <Button
                                            key={toolId}
                                            size="sm"
                                            variant="outline"
                                            className="h-6 text-xs px-2"
                                            onClick={() => navigate(getTools().find(t => t.id === toolId)?.path || '/')}
                                        >
                                            {getToolName(toolId)}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {showKeyInput && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center mb-4">
                            <Key className="w-5 h-5 text-indigo-600 mr-2" />
                            <h3 className="text-lg font-bold">Enter Gemini API Key</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            To enable the Senior Consultant AI, you need a Google Gemini API Key.
                            This key is stored locally on your device and never sent to our servers.
                        </p>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full p-2 border rounded mb-4 font-mono text-sm"
                        />
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowKeyInput(false)}>Cancel</Button>
                            <Button onClick={handleKeySave}>Save & Consult</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
