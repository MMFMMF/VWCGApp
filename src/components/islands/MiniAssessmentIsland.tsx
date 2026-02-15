import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { cn } from '@lib/utils';

interface Question {
  id: string;
  text: string;
  description: string;
  min: number;
  max: number;
  step: number;
  labels: {
    min: string;
    mid: string;
    max: string;
  };
}

interface ReadinessLevel {
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
  description: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'strategy',
    text: 'How clear is your AI strategy and vision?',
    description: 'Rate your organization\'s AI strategic planning and alignment',
    min: 0,
    max: 100,
    step: 10,
    labels: {
      min: 'No strategy',
      mid: 'Some ideas',
      max: 'Clear roadmap'
    }
  },
  {
    id: 'data',
    text: 'How ready is your data infrastructure?',
    description: 'Rate your data quality, accessibility, and governance',
    min: 0,
    max: 100,
    step: 10,
    labels: {
      min: 'Not ready',
      mid: 'Partially ready',
      max: 'Fully ready'
    }
  },
  {
    id: 'talent',
    text: 'How skilled is your team in AI?',
    description: 'Rate your team\'s AI capabilities and readiness to implement',
    min: 0,
    max: 100,
    step: 10,
    labels: {
      min: 'No skills',
      mid: 'Some training',
      max: 'Expert team'
    }
  }
];

function getReadinessLevel(score: number): ReadinessLevel {
  if (score >= 70) {
    return {
      label: 'Strong Start',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      emoji: '🚀',
      description: 'You have a solid foundation to accelerate your AI journey'
    };
  }
  if (score >= 40) {
    return {
      label: 'Room for Growth',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      emoji: '📊',
      description: 'You\'re on the right track, but key gaps remain to address'
    };
  }
  return {
    label: 'Early Stage',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    emoji: '🎯',
    description: 'Building your AI foundation should be your top priority'
  };
}

/**
 * MiniAssessmentIsland - 3-question quick assessment widget
 *
 * Features:
 * - Linear wizard flow (no backward navigation)
 * - Progress indicator (1/3, 2/3, 3/3)
 * - Slider input for each question (0-100, step 10)
 * - Instant result calculation after question 3
 * - Readiness level display (Strong Start / Room for Growth / Early Stage)
 * - localStorage bridge to full assessment
 * - Respects prefers-reduced-motion for progress bar animation
 * - Touch-friendly slider inputs (28px thumb)
 * - Accessible with ARIA labels
 *
 * Usage:
 * <MiniAssessmentIsland client:visible />
 */
export default function MiniAssessmentIsland() {
  // Viewport detection
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Check user's motion preferences
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const currentQuestion = QUESTIONS[currentStep];
  const currentValue = answers[currentQuestion?.id] ?? 50;
  const progressPercent = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleSliderChange = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete assessment
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const averageScore = Math.round(totalScore / QUESTIONS.length);

      // Save to localStorage for bridge to full assessment
      localStorage.setItem('vwcg-teaser-answers', JSON.stringify(answers));
      localStorage.setItem('vwcg-teaser-completed', Date.now().toString());
      localStorage.setItem('vwcg-teaser-score', averageScore.toString());

      setIsComplete(true);
    }
  };

  // Calculate result
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const averageScore = Math.round(totalScore / QUESTIONS.length);
  const readinessLevel = getReadinessLevel(averageScore);

  if (!inView) {
    return (
      <div ref={ref} className="min-h-[400px]" />
    );
  }

  if (isComplete) {
    return (
      <div ref={ref} className="w-full max-w-2xl mx-auto">
        <div className={cn(
          'p-8 rounded-2xl border-2',
          readinessLevel.bgColor,
          'border-current'
        )}>
          {/* Result Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{readinessLevel.emoji}</div>
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {averageScore}%
            </div>
            <div className={cn(
              'text-2xl font-semibold mb-3',
              readinessLevel.color
            )}>
              {readinessLevel.label}
            </div>
            <p className="text-gray-600 text-lg">
              {readinessLevel.description}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <a
              href="/invite"
              className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Get Your Full Assessment
            </a>
            <p className="mt-3 text-sm text-gray-500">
              Your answers will be pre-filled - 3 more dimensions to complete
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="w-full max-w-2xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentStep + 1} of {QUESTIONS.length}
            </span>
            <span className="text-sm font-medium text-indigo-600">
              {Math.round(progressPercent)}% Complete
            </span>
          </div>
          <div
            className="h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Assessment progress: ${Math.round(progressPercent)} percent complete`}
          >
            <div
              className={cn(
                'h-full bg-indigo-600 rounded-full',
                !prefersReducedMotion && 'transition-all duration-300 ease-out'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {currentQuestion.text}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {currentQuestion.description}
          </p>
        </div>

        {/* Slider Input */}
        <div className="mb-8">
          {/* Current Value Display */}
          <div className="text-center mb-6">
            <div className="text-4xl sm:text-5xl font-bold text-indigo-600">
              {currentValue}
            </div>
          </div>

          {/* Slider */}
          <div className="relative px-2">
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              step={currentQuestion.step}
              value={currentValue}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 slider-thumb"
              aria-label={currentQuestion.text}
              aria-valuenow={currentValue}
              aria-valuemin={currentQuestion.min}
              aria-valuemax={currentQuestion.max}
              style={{
                background: `linear-gradient(to right, rgb(79, 70, 229) 0%, rgb(79, 70, 229) ${currentValue}%, rgb(229, 231, 235) ${currentValue}%, rgb(229, 231, 235) 100%)`
              }}
            />
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-4 px-2">
            <span className="text-xs sm:text-sm text-gray-500 text-left max-w-[30%]">
              {currentQuestion.labels.min}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 text-center max-w-[30%]">
              {currentQuestion.labels.mid}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 text-right max-w-[30%]">
              {currentQuestion.labels.max}
            </span>
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="px-8 py-4 bg-indigo-600 text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {currentStep < QUESTIONS.length - 1 ? 'Next Question' : 'See My Results'}
          </button>
        </div>
      </div>

      {/* Custom slider styles */}
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          border: 3px solid rgb(79, 70, 229);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .slider-thumb::-webkit-slider-thumb:active {
          transform: scale(1.15);
        }

        .slider-thumb::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          border: 3px solid rgb(79, 70, 229);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
        }

        .slider-thumb::-moz-range-thumb:active {
          transform: scale(1.15);
        }

        /* Remove default track styling for Firefox */
        .slider-thumb::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
