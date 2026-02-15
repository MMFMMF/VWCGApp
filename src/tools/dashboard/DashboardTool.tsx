import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { StrategicHealthWidget } from '../../components/dashboard/StrategicHealthWidget';
import { getTools } from '../../registry/ToolRegistry';
import { Button } from '../../components/ui/Button';
import { 
    Rocket, 
    Shield, 
    BarChart3, 
    CheckCircle2, 
    Circle,
    ArrowRight,
    Sparkles,
    Target,
    User
} from 'lucide-react';

export const DashboardTool: React.FC = () => {
    const metadata = useWorkspaceStore(state => state.metadata);
    const tools = useWorkspaceStore(state => state.tools);
    const insights = useWorkspaceStore(state => state.insights || []);
    const navigate = useNavigate();
    
    const registeredTools = getTools();
    const activeToolCount = Object.keys(tools).length;
    const totalTools = registeredTools.length;
    const progressPercent = totalTools > 0 ? Math.round((activeToolCount / totalTools) * 100) : 0;
    const hasStarted = activeToolCount > 0;
    
    // Getting started steps
    const gettingStartedSteps = [
        { 
            id: 1, 
            title: 'Complete Leadership DNA Assessment', 
            description: 'Understand your leadership strengths and gaps',
            toolPath: '/leadership-dna',
            completed: !!tools['leadership-dna']
        },
        { 
            id: 2, 
            title: 'Define Your Vision Canvas', 
            description: 'Map your strategic pillars and goals',
            toolPath: '/vision-canvas',
            completed: !!tools['vision-canvas']
        },
        { 
            id: 3, 
            title: 'Run a SWOT Analysis', 
            description: 'Identify strengths, weaknesses, opportunities, and threats',
            toolPath: '/swot',
            completed: !!tools['swot']
        },
        { 
            id: 4, 
            title: 'Create Your 90-Day Roadmap', 
            description: 'Turn strategy into executable tasks',
            toolPath: '/roadmap',
            completed: !!tools['roadmap']
        },
    ];
    
    const completedSteps = gettingStartedSteps.filter(s => s.completed).length;
    const remainingSteps = gettingStartedSteps.length - completedSteps;
    const nextStep = gettingStartedSteps.find(s => !s.completed);
    const issueCount = insights.length;

    return (
        <div className="space-y-8">
            {/* Hero Section - Enhanced with preview image */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-2xl p-8 md:p-12 lg:p-16 text-white">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    {/* Left content */}
                    <div className="max-w-xl">
                        {/* Badge - Positive framing */}
                        {hasStarted ? (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-medium mb-6">
                                <Sparkles className="w-4 h-4 mr-2" />
                                {activeToolCount} of {totalTools} tools active
                            </div>
                        ) : (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-medium mb-6">
                                <Target className="w-4 h-4 mr-2" />
                                Ready to build your strategy
                            </div>
                        )}
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                            Your Strategic<br />
                            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                                Operating System
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                            {totalTools} integrated tools to design, document, and scale your business. 
                            Build a company that runs without you.
                        </p>
                        
                        {nextStep ? (
                            <Button 
                                variant="primary" 
                                size="lg"
                                onClick={() => navigate(nextStep.toolPath)}
                                className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 py-3 text-lg"
                            >
                                {completedSteps === 0 ? 'Start Your Journey' : 'Continue: ' + nextStep.title.split(' ').slice(0, 2).join(' ')}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        ) : (
                            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300">
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                All core tools completed!
                            </div>
                        )}
                    </div>
                    
                    {/* Right side - Preview image */}
                    <div className="hidden lg:block relative">
                        <div className="relative w-80 h-64 rounded-xl overflow-hidden shadow-2xl border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                            <img 
                                src="/preview-dashboard.png" 
                                alt="Leadership DNA Assessment Preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <div className="absolute -bottom-4 -left-4 bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                            ✨ What you'll build
                        </div>
                    </div>
                </div>
                
                {/* Credibility tagline */}
                <div className="relative z-10 mt-10 pt-8 border-t border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-white/70" />
                    </div>
                    <div>
                        <p className="text-white/90 text-sm font-medium">Built by Kamyar Shah</p>
                        <p className="text-white/50 text-xs">Fractional COO & Business Strategist</p>
                    </div>
                </div>
            </div>

            {/* Feature Cards Row - Positive framing */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Strategic Health Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Shield className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="ml-3 font-semibold text-slate-900">Strategic Health</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            {hasStarted ? 'Real-time conflicts and insights across your tools.' : 'Complete tools to unlock strategic insights.'}
                        </p>
                        {issueCount > 0 ? (
                            <>
                                <div className="text-2xl font-bold text-amber-600">{issueCount} Insight{issueCount !== 1 ? 's' : ''}</div>
                                <p className="text-xs text-slate-500 mt-1">Requires attention</p>
                            </>
                        ) : hasStarted ? (
                            <>
                                <div className="text-2xl font-bold text-emerald-600">All Clear</div>
                                <p className="text-xs text-slate-500 mt-1">Your strategy is aligned</p>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-semibold text-slate-400">Waiting for data</div>
                                <p className="text-xs text-slate-500 mt-1">Start a tool to see insights</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Progress Tracker Card - Positive framing */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="ml-3 font-semibold text-slate-900">Progress Tracker</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            Your journey across all {totalTools} strategic tools.
                        </p>
                        {hasStarted ? (
                            <>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-indigo-600">{progressPercent}%</span>
                                    <span className="text-sm text-slate-500 mb-1">complete</span>
                                </div>
                                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.max(progressPercent, 5)}%` }}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-semibold text-indigo-600">Let's get started</div>
                                <p className="text-xs text-slate-500 mt-1">{totalTools} tools to explore</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Start Card - Positive framing */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Rocket className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="ml-3 font-semibold text-slate-900">Quick Start</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            Recommended first steps for new workspaces.
                        </p>
                        {completedSteps === gettingStartedSteps.length ? (
                            <>
                                <div className="text-2xl font-bold text-green-600">Complete!</div>
                                <p className="text-xs text-slate-500 mt-1">All onboarding steps done</p>
                            </>
                        ) : completedSteps > 0 ? (
                            <>
                                <div className="text-2xl font-bold text-amber-600">{remainingSteps} to go</div>
                                <p className="text-xs text-slate-500 mt-1">{completedSteps} of {gettingStartedSteps.length} completed</p>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-semibold text-amber-600">4 quick steps</div>
                                <p className="text-xs text-slate-500 mt-1">~15 minutes to complete</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Getting Started Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Getting Started</h2>
                    <p className="text-sm text-slate-500 mt-1">Complete these steps to build your strategic foundation</p>
                </div>
                <div className="divide-y divide-slate-100">
                    {gettingStartedSteps.map((step) => (
                        <div 
                            key={step.id}
                            className={`p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${step.completed ? 'bg-slate-50/50' : ''}`}
                            onClick={() => navigate(step.toolPath)}
                        >
                            {step.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                            ) : (
                                <Circle className="w-6 h-6 text-slate-300 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-medium ${step.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                    {step.title}
                                </h4>
                                <p className="text-sm text-slate-500 truncate">{step.description}</p>
                            </div>
                            <ArrowRight className={`w-5 h-5 flex-shrink-0 ${step.completed ? 'text-slate-300' : 'text-slate-400'}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Strategic Health Widget (Full) - Only show if has data */}
            {hasStarted && (
                <div>
                    <StrategicHealthWidget />
                </div>
            )}

            {/* Workspace Info Footer */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Workspace</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-900 truncate">{metadata.name || 'My Business Strategy'}</dd>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Created</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-900">
                        {metadata.createdAt ? new Date(metadata.createdAt).toLocaleDateString() : 'Today'}
                    </dd>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Tools</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-900">{activeToolCount} / {totalTools}</dd>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Last Modified</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-900">
                        {metadata.lastModified ? new Date(metadata.lastModified).toLocaleDateString() : 'Just now'}
                    </dd>
                </div>
            </div>
        </div>
    );
};

