'use client';

import React from 'react';
import { ProcessingStatus } from '@/lib/types';

interface ProcessingViewProps {
  status: ProcessingStatus;
}

export default function ProcessingView({ status }: ProcessingViewProps) {
  const getStageInfo = () => {
    switch (status.stage) {
      case 'parsing':
        return {
          title: 'Parsing Source Data',
          description: 'Reading and validating CSV file...',
          step: 1,
        };
      case 'ai_processing':
        return {
          title: 'AI Analysis in Progress',
          description: `Processing company ${status.processed} of ${status.total}`,
          step: 2,
        };
      case 'validation':
        return {
          title: 'Quality Validation',
          description: 'Checking summary quality...',
          step: 3,
        };
      case 'generating_excel':
        return {
          title: 'Generating Excel Export',
          description: 'Creating two-tab workbook...',
          step: 4,
        };
      case 'generating_pdf':
        return {
          title: 'Generating PDF Export',
          description: 'Creating formatted PDF...',
          step: 4,
        };
      default:
        return {
          title: 'Processing',
          description: 'Working...',
          step: 1,
        };
    }
  };

  const stageInfo = getStageInfo();
  const progress = status.total > 0 ? (status.processed / status.total) * 100 : 0;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stage Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {['Parse', 'AI Process', 'Validate', 'Export'].map((label, index) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-medium text-sm transition-all duration-300
                    ${
                      index + 1 < stageInfo.step
                        ? 'bg-green-500 text-white'
                        : index + 1 === stageInfo.step
                        ? 'bg-primary-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {index + 1 < stageInfo.step ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-2">{label}</div>
              </div>
              {index < 3 && (
                <div
                  className={`
                    flex-1 h-1 mx-2 rounded transition-all duration-300
                    ${index + 1 < stageInfo.step ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Status Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{stageInfo.title}</h2>
          <p className="text-gray-600">{stageInfo.description}</p>
          {status.currentCompany && (
            <p className="text-sm text-gray-500 mt-2">
              Current: <span className="font-medium">{status.currentCompany}</span>
            </p>
          )}
        </div>

        {/* Progress Bar (for AI processing) */}
        {status.stage === 'ai_processing' && status.total > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {status.processed} / {status.total} companies
              </span>
              <span className="text-sm font-medium text-primary-600">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary-500 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-pulse" />
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
          </div>
        </div>

        {/* Time Info */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Elapsed: {formatTime(Math.floor(status.timeElapsed / 1000))}</span>
          </div>

          {status.timeRemaining && status.timeRemaining > 0 && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Remaining: ~{formatTime(Math.floor(status.timeRemaining / 1000))}</span>
            </div>
          )}
        </div>

        {/* Accuracy Note */}
        {status.stage === 'ai_processing' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Accuracy-First Processing</p>
                <p className="mt-1 text-blue-700">
                  Each company is analyzed individually with detailed AI prompts to ensure
                  executive-ready quality. Processing may take 6-8 minutes for 200 companies.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
