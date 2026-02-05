import type { SynthesisRule, SynthesisContext, Insight } from '../types';
import { synthesisRuleRegistry } from '../ruleRegistry';

const generateInsightId = () => `E3-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * E3 — Burnout Risk
 * Triggers when advisor readiness < 50% AND roadmap tasks exceed safe capacity
 */
const E3BurnoutRiskRule: SynthesisRule = {
  id: 'E3-burnout-risk',
  name: 'Burnout Risk Warning',
  description: 'Identifies risk of burnout from low readiness combined with high workload',
  requiredTools: ['advisor-readiness', '90day-roadmap'],

  evaluate(context: SynthesisContext): Insight[] {
    const insights: Insight[] = [];

    const advisorData = context.tools['advisor-readiness'] as {
      answers?: Record<string, number>;
    } | undefined;

    const roadmapData = context.tools['90day-roadmap'] as {
      tasks?: { id: string; week: number }[];
    } | undefined;

    if (!advisorData?.answers || !roadmapData?.tasks) {
      return insights;
    }

    // Calculate advisor readiness percentage
    const answerValues = Object.values(advisorData.answers);
    const totalScore = answerValues.reduce((sum, v) => sum + v, 0);
    const maxScore = answerValues.length * 5;
    const readinessPercentage = Math.round((totalScore / maxScore) * 100);

    // Calculate task density (tasks per week average for weeks with tasks)
    const tasksByWeek = roadmapData.tasks.reduce((acc, t) => {
      acc[t.week] = (acc[t.week] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const activeWeeks = Object.keys(tasksByWeek).length;
    const avgTasksPerWeek = activeWeeks > 0
      ? roadmapData.tasks.length / activeWeeks
      : 0;

    // Safe capacity: readiness 100% = 5 tasks/week, 50% = 2.5, 0% = 0
    const safeCapacity = (readinessPercentage / 100) * 5;

    if (readinessPercentage < 50 && avgTasksPerWeek > safeCapacity) {
      insights.push({
        id: generateInsightId(),
        ruleId: 'E3-burnout-risk',
        type: 'warning',
        severity: readinessPercentage < 30 ? 5 : 4,
        title: 'Burnout Risk Detected',
        description: `Your advisor readiness score (${readinessPercentage}%) suggests limited capacity, but your roadmap averages ${avgTasksPerWeek.toFixed(1)} tasks per active week. This exceeds the recommended ${safeCapacity.toFixed(1)} tasks/week for your current state.`,
        recommendation: 'Consider: (1) Reduce roadmap scope or extend timeline, (2) Delegate tasks to improve capacity, (3) Focus on improving operational maturity before scaling execution.',
        affectedTools: ['advisor-readiness', '90day-roadmap'],
        data: {
          readinessPercentage,
          avgTasksPerWeek,
          safeCapacity,
          totalTasks: roadmapData.tasks.length,
          overloadFactor: avgTasksPerWeek / safeCapacity
        }
      });
    }

    return insights;
  }
};

synthesisRuleRegistry.register(E3BurnoutRiskRule);
export default E3BurnoutRiskRule;
