import { useCallback, useMemo } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { synthesisRuleRegistry } from '../lib/synthesis';
import type { SynthesisResult, SynthesisContext, Insight } from '../lib/synthesis';

interface UseSynthesisReturn {
  /** Current synthesis results from workspace */
  synthesis: {
    insights: Insight[];
    scores: Record<string, number>;
  };

  /** Run synthesis with current workspace data */
  runSynthesis: () => SynthesisResult;

  /** Number of registered rules */
  ruleCount: number;

  /** Get insights of a specific type */
  getInsightsByType: (type: 'gap' | 'strength' | 'warning' | 'opportunity') => Insight[];

  /** Get insights affecting a specific tool */
  getInsightsForTool: (toolId: string) => Insight[];

  /** Check if synthesis has been run */
  hasRun: boolean;
}

export function useSynthesis(): UseSynthesisReturn {
  const tools = useWorkspaceStore(s => s.tools);
  const meta = useWorkspaceStore(s => s.meta);
  const synthesis = useWorkspaceStore(s => s.synthesis);
  const setSynthesis = useWorkspaceStore(s => s.setSynthesis);

  // Extract insights and scores from synthesis state
  // Using type assertion since we're bridging between workspace types and synthesis types
  const currentInsights = useMemo(() => {
    // The synthesis state should contain insights array from SynthesisResult
    return (synthesis as any).insights || [];
  }, [synthesis]);

  const currentScores = useMemo(() => {
    // The synthesis state should contain scores object from SynthesisResult
    return (synthesis as any).scores || {};
  }, [synthesis]);

  const runSynthesis = useCallback(() => {
    const context: SynthesisContext = {
      tools: tools as Record<string, unknown>,
      meta: {
        companyName: meta.name || 'Unknown Company',
        assessmentDate: meta.updatedAt || new Date().toISOString()
      }
    };

    const result = synthesisRuleRegistry.evaluateAll(context);

    // Save to workspace store
    setSynthesis({
      insights: result.insights as any,
      scores: result.scores,
      lastRun: new Date().toISOString()
    } as any);

    return result;
  }, [tools, meta, setSynthesis]);

  const getInsightsByType = useCallback(
    (type: 'gap' | 'strength' | 'warning' | 'opportunity') => {
      return currentInsights.filter((insight: Insight) => insight.type === type);
    },
    [currentInsights]
  );

  const getInsightsForTool = useCallback(
    (toolId: string) => {
      return currentInsights.filter((insight: Insight) =>
        insight.affectedTools.includes(toolId)
      );
    },
    [currentInsights]
  );

  const hasRun = useMemo(
    () => currentInsights.length > 0 || Object.keys(currentScores).length > 0,
    [currentInsights, currentScores]
  );

  return {
    synthesis: {
      insights: currentInsights,
      scores: currentScores
    },
    runSynthesis,
    ruleCount: synthesisRuleRegistry.count(),
    getInsightsByType,
    getInsightsForTool,
    hasRun
  };
}
