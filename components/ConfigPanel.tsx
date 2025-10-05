'use client';

import React from 'react';
import { OutputFormat } from '@/lib/types';

interface ConfigPanelProps {
  format: OutputFormat;
  reportTitle: string;
  companyName: string;
  onFormatChange: (format: OutputFormat) => void;
  onReportTitleChange: (title: string) => void;
  onCompanyNameChange: (name: string) => void;
  disabled?: boolean;
}

export default function ConfigPanel({
  format,
  reportTitle,
  companyName,
  onFormatChange,
  onReportTitleChange,
  onCompanyNameChange,
  disabled,
}: ConfigPanelProps) {
  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Output Format
        </label>
        <div className="space-y-3">
          <label
            className={`
              flex items-start p-4 border-2 rounded-lg cursor-pointer
              transition-all duration-150
              ${
                format === 'detailed'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name="format"
              value="detailed"
              checked={format === 'detailed'}
              onChange={() => onFormatChange('detailed')}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <div className="ml-3">
              <div className="font-medium text-gray-900">Detailed (16 columns)</div>
              <div className="text-sm text-gray-500 mt-1">
                Full company details including website, domain, executive info, and
                employee count. Best for comprehensive analysis.
              </div>
            </div>
          </label>

          <label
            className={`
              flex items-start p-4 border-2 rounded-lg cursor-pointer
              transition-all duration-150
              ${
                format === 'minimal'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name="format"
              value="minimal"
              checked={format === 'minimal'}
              onChange={() => onFormatChange('minimal')}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <div className="ml-3">
              <div className="font-medium text-gray-900">Minimal (9 columns)</div>
              <div className="text-sm text-gray-500 mt-1">
                Essential data with growth metrics (6mo, 9mo, 24mo). Best for
                growth-focused review.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Report Title */}
      <div>
        <label htmlFor="report-title" className="block text-sm font-medium text-gray-700 mb-2">
          Report Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="report-title"
          value={reportTitle}
          onChange={(e) => onReportTitleChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g., Critical Power, HVAC Commissioning"
          className={`
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        />
        <p className="mt-1 text-xs text-gray-500">
          Appears in title block of output file
        </p>
      </div>

      {/* Company Name (Optional) */}
      <div>
        <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
          Company Name <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          id="company-name"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g., United Technical Support Service, Inc."
          className={`
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        />
        <p className="mt-1 text-xs text-gray-500">
          Your company name (appears in title block if provided)
        </p>
      </div>
    </div>
  );
}
