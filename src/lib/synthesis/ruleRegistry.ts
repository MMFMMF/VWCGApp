import type { SynthesisRule, SynthesisContext, SynthesisResult, Insight } from './types';

class SynthesisRuleRegistry {
  private rules = new Map<string, SynthesisRule>();

  /**
   * Register a new synthesis rule
   */
  register(rule: SynthesisRule): void {
    if (this.rules.has(rule.id)) {
      console.warn(`Synthesis rule ${rule.id} already registered, overwriting`);
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove a registered rule
   */
  unregister(id: string): void {
    this.rules.delete(id);
  }

  /**
   * Get a specific rule by ID
   */
  get(id: string): SynthesisRule | undefined {
    return this.rules.get(id);
  }

  /**
   * Get all registered rules
   */
  getAll(): SynthesisRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get IDs of all registered rules
   */
  getIds(): string[] {
    return Array.from(this.rules.keys());
  }

  /**
   * Check if a rule is registered
   */
  has(id: string): boolean {
    return this.rules.has(id);
  }

  /**
   * Get count of registered rules
   */
  count(): number {
    return this.rules.size;
  }

  /**
   * Evaluate all registered rules against the provided context
   */
  evaluateAll(context: SynthesisContext): SynthesisResult {
    const allInsights: Insight[] = [];
    const allScores: Record<string, number> = {};
    const rulesSkipped: string[] = [];
    let rulesEvaluated = 0;

    for (const rule of this.rules.values()) {
      // Check if all required tools are present
      const hasRequiredTools = rule.requiredTools.every(
        toolId => context.tools[toolId] !== undefined
      );

      if (!hasRequiredTools) {
        rulesSkipped.push(rule.id);
        continue;
      }

      try {
        // Evaluate the rule
        const insights = rule.evaluate(context);
        allInsights.push(...insights);
        rulesEvaluated++;

        // Calculate scores if the rule provides them
        if (rule.calculateScores) {
          const scores = rule.calculateScores(context);
          Object.assign(allScores, scores);
        }
      } catch (error) {
        console.error(`Synthesis rule ${rule.id} failed:`, error);
        // Continue with other rules even if one fails
      }
    }

    return {
      insights: this.prioritizeInsights(allInsights),
      scores: allScores,
      timestamp: Date.now(),
      rulesEvaluated,
      rulesSkipped
    };
  }

  /**
   * Sort insights by severity and type
   */
  private prioritizeInsights(insights: Insight[]): Insight[] {
    const typeOrder: Record<Insight['type'], number> = {
      gap: 0,
      warning: 1,
      opportunity: 2,
      strength: 3
    };

    return insights.sort((a, b) => {
      // First sort by severity (descending - 5 is most severe)
      if (b.severity !== a.severity) {
        return b.severity - a.severity;
      }
      // Then by type (gaps first, strengths last)
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }

  /**
   * Get rules that can run with currently available tools
   */
  getApplicableRules(availableToolIds: string[]): SynthesisRule[] {
    return this.getAll().filter(rule =>
      rule.requiredTools.every(id => availableToolIds.includes(id))
    );
  }
}

// Singleton instance
export const synthesisRuleRegistry = new SynthesisRuleRegistry();
