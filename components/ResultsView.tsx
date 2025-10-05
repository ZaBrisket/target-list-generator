'use client';

import React from 'react';
import { ProcessedCompany } from '@/lib/types';

interface ResultsViewProps {
  companies: ProcessedCompany[];
  processingTime: number;
  onDownloadExcel: () => void;
  onDownloadPDF: () => void;
  onReset: () => void;
  downloadingExcel?: boolean;
  downloadingPDF?: boolean;
}

export default function ResultsView({
  companies,
  processingTime,
  onDownloadExcel,
  onDownloadPDF,
  onReset,
  downloadingExcel,
  downloadingPDF,
}: ResultsViewProps) {
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  // Calculate quality stats
  const qualityStats = {
    excellent: companies.filter((c) => c.summaryQuality === 'excellent').length,
    good: companies.filter((c) => c.summaryQuality === 'good').length,
    needsReview: companies.filter((c) => c.summaryQuality === 'needs_review').length,
  };

  const qualityPercentage = ((qualityStats.excellent + qualityStats.good) / companies.length) * 100;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Processing Complete!
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Successfully processed {companies.length} companies in {formatTime(processingTime)}
        </p>

        {/* Quality Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{qualityStats.excellent}</div>
            <div className="text-sm text-gray-600">Excellent</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{qualityStats.good}</div>
            <div className="text-sm text-gray-600">Good</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{qualityStats.needsReview}</div>
            <div className="text-sm text-gray-600">Needs Review</div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 mb-6">
          {qualityPercentage.toFixed(1)}% of summaries passed automated quality checks
        </div>

        {/* Download Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onDownloadExcel}
            disabled={downloadingExcel}
            className="
              inline-flex items-center px-6 py-3 border border-transparent text-base font-medium
              rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-lg
              transition-all duration-150 transform hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            "
          >
            {downloadingExcel ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download Excel (2 Tabs)
              </>
            )}
          </button>

          <button
            onClick={onDownloadPDF}
            disabled={downloadingPDF}
            className="
              inline-flex items-center px-6 py-3 border border-transparent text-base font-medium
              rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-lg
              transition-all duration-150 transform hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            "
          >
            {downloadingPDF ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview (First 10 Companies)</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Summary
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.slice(0, 10).map((company, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {company.companyName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{company.cityState}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-md">
                    {company.aiSummary}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${
                          company.summaryQuality === 'excellent'
                            ? 'bg-green-100 text-green-800'
                            : company.summaryQuality === 'good'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      `}
                    >
                      {company.summaryQuality}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="
            inline-flex items-center px-6 py-3 border-2 border-gray-300 text-base font-medium
            rounded-lg text-gray-700 bg-white hover:bg-gray-50
            transition-all duration-150
          "
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Process Another List
        </button>
      </div>
    </div>
  );
}
