import React from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Building2, CheckCircle2 } from 'lucide-react';
import type { BusinessContext } from './types';
import {
  REVENUE_RANGES,
  INDUSTRIES,
  EMPLOYEE_COUNTS,
  FOUNDER_HOURS,
  YEARS_IN_BUSINESS,
  GROWTH_GOALS
} from './types';

const EMPTY_DATA: Partial<BusinessContext> = {};

export const BusinessContextTool: React.FC = () => {
  const toolId = 'business-context';
  const data = useWorkspaceStore(state => state.tools[toolId] || EMPTY_DATA);
  const updateData = useWorkspaceStore(state => state.updateToolData);

  const handleChange = (field: keyof BusinessContext, value: string) => {
    updateData(toolId, { [field]: value });
  };

  // Calculate completion status
  const fields: (keyof BusinessContext)[] = [
    'revenueRange',
    'industry',
    'employeeCount',
    'founderHours',
    'yearsInBusiness',
    'growthGoal'
  ];
  const completedFields = fields.filter(field => data[field] && data[field] !== '').length;
  const totalFields = fields.length;
  const isComplete = completedFields === totalFields;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold tracking-tight">Business Context</h2>
          </div>
          <p className="text-slate-500">Company demographics for benchmarking and financial analysis</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isComplete ? (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Complete
            </div>
          ) : (
            <div className="text-slate-500">
              {completedFields} of {totalFields} fields completed
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="space-y-6">
          {/* Revenue Range */}
          <div className="space-y-2">
            <label htmlFor="revenueRange" className="block text-sm font-medium text-slate-700">
              Annual Revenue Range
            </label>
            <select
              id="revenueRange"
              value={data.revenueRange || ''}
              onChange={(e) => handleChange('revenueRange', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select revenue range...</option>
              {REVENUE_RANGES.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label htmlFor="industry" className="block text-sm font-medium text-slate-700">
              Industry
            </label>
            <select
              id="industry"
              value={data.industry || ''}
              onChange={(e) => handleChange('industry', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Employee Count */}
          <div className="space-y-2">
            <label htmlFor="employeeCount" className="block text-sm font-medium text-slate-700">
              Number of Employees
            </label>
            <select
              id="employeeCount"
              value={data.employeeCount || ''}
              onChange={(e) => handleChange('employeeCount', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select employee count...</option>
              {EMPLOYEE_COUNTS.map(count => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </div>

          {/* Founder Hours */}
          <div className="space-y-2">
            <label htmlFor="founderHours" className="block text-sm font-medium text-slate-700">
              Founder Weekly Hours
            </label>
            <select
              id="founderHours"
              value={data.founderHours || ''}
              onChange={(e) => handleChange('founderHours', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select weekly hours...</option>
              {FOUNDER_HOURS.map(hours => (
                <option key={hours} value={hours}>{hours}</option>
              ))}
            </select>
          </div>

          {/* Years in Business */}
          <div className="space-y-2">
            <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-slate-700">
              Years in Business
            </label>
            <select
              id="yearsInBusiness"
              value={data.yearsInBusiness || ''}
              onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select years in business...</option>
              {YEARS_IN_BUSINESS.map(years => (
                <option key={years} value={years}>{years}</option>
              ))}
            </select>
          </div>

          {/* Growth Goal */}
          <div className="space-y-2">
            <label htmlFor="growthGoal" className="block text-sm font-medium text-slate-700">
              Primary Growth Goal
            </label>
            <select
              id="growthGoal"
              value={data.growthGoal || ''}
              onChange={(e) => handleChange('growthGoal', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select growth goal...</option>
              {GROWTH_GOALS.map(goal => (
                <option key={goal} value={goal}>{goal}</option>
              ))}
            </select>
          </div>
        </div>

        {isComplete && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              All business context fields completed. This data will be used for benchmarking and financial analysis across other tools.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
