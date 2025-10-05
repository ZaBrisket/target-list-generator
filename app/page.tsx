'use client';

import React, { useState, useEffect } from 'react';
import UploadZone from '@/components/UploadZone';
import ConfigPanel from '@/components/ConfigPanel';
import ProcessingView from '@/components/ProcessingView';
import ResultsView from '@/components/ResultsView';
import {
  parseFile,
  processCompaniesAction,
  generateExcelAction,
  generatePDFAction,
} from './actions';
import {
  OutputFormat,
  ProcessingStatus,
  ProcessedCompany,
  SourcescubRawRow,
} from '@/lib/types';

type AppState = 'config' | 'processing' | 'results' | 'error';

export default function Home() {
  // Configuration state
  const [format, setFormat] = useState<OutputFormat>('detailed');
  const [reportTitle, setReportTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceData, setSourceData] = useState<SourcescubRawRow[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedCompany[]>([]);

  // UI state
  const [appState, setAppState] = useState<AppState>('config');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    processed: 0,
    total: 0,
    timeElapsed: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [processingTime, setProcessingTime] = useState(0);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Timer for elapsed time
  useEffect(() => {
    if (appState === 'processing') {
      const startTime = Date.now();
      const interval = setInterval(() => {
        setProcessingStatus((prev) => ({
          ...prev,
          timeElapsed: Date.now() - startTime,
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [appState]);

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage('');
  };

  // Handle processing start
  const handleStartProcessing = async () => {
    if (!selectedFile || !reportTitle.trim()) {
      setErrorMessage('Please select a file and enter a report title');
      return;
    }

    try {
      setAppState('processing');
      setProcessingStatus({
        stage: 'parsing',
        processed: 0,
        total: 0,
        timeElapsed: 0,
      });

      const startTime = Date.now();

      // Step 1: Parse file
      const formData = new FormData();
      formData.append('file', selectedFile);

      const parseResult = await parseFile(formData);

      if (!parseResult.success || !parseResult.sourceData) {
        throw new Error(parseResult.error || 'Failed to parse file');
      }

      const parsedData: SourcescubRawRow[] = JSON.parse(parseResult.sourceData);
      setSourceData(parsedData);

      // Step 2: AI Processing
      setProcessingStatus({
        stage: 'ai_processing',
        processed: 0,
        total: parsedData.length,
        timeElapsed: Date.now() - startTime,
      });

      // Note: In a real implementation with progress updates, you would use WebSocket or polling
      // For now, we'll process all at once
      const processResult = await processCompaniesAction(parseResult.sourceData);

      if (!processResult.success || !processResult.processedData) {
        throw new Error(processResult.error || 'Failed to process companies');
      }

      const processed: ProcessedCompany[] = JSON.parse(processResult.processedData);
      setProcessedData(processed);

      // Step 3: Validation (simulated)
      setProcessingStatus({
        stage: 'validation',
        processed: parsedData.length,
        total: parsedData.length,
        timeElapsed: Date.now() - startTime,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Complete
      const totalTime = Date.now() - startTime;
      setProcessingTime(totalTime);
      setAppState('results');
    } catch (error: any) {
      console.error('Processing error:', error);
      setErrorMessage(error.message || 'An error occurred during processing');
      setAppState('error');
    }
  };

  // Handle Excel download
  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);

      const result = await generateExcelAction(
        JSON.stringify(sourceData),
        JSON.stringify(processedData),
        {
          format,
          reportTitle,
          companyName: companyName || undefined,
        }
      );

      if (!result.success || !result.fileData || !result.fileName) {
        throw new Error(result.error || 'Failed to generate Excel file');
      }

      // Download file
      const binaryString = atob(result.fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Failed to download Excel file: ${error.message}`);
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);

      const result = await generatePDFAction(JSON.stringify(processedData), {
        format,
        reportTitle,
        companyName: companyName || undefined,
      });

      if (!result.success || !result.fileData || !result.fileName) {
        throw new Error(result.error || 'Failed to generate PDF file');
      }

      // Download file
      const binaryString = atob(result.fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Failed to download PDF file: ${error.message}`);
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setAppState('config');
    setSelectedFile(null);
    setSourceData([]);
    setProcessedData([]);
    setErrorMessage('');
    setProcessingStatus({
      stage: 'idle',
      processed: 0,
      total: 0,
      timeElapsed: 0,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Target List Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform Sourcescrub exports into executive-ready M&A target lists with
            AI-powered summaries
          </p>
        </div>

        {/* Config View */}
        {appState === 'config' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <ConfigPanel
                format={format}
                reportTitle={reportTitle}
                companyName={companyName}
                onFormatChange={setFormat}
                onReportTitleChange={setReportTitle}
                onCompanyNameChange={setCompanyName}
              />

              <div className="mt-8">
                <UploadZone onFileSelect={handleFileSelect} />
              </div>

              {selectedFile && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        File selected: {selectedFile.name}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}

              <div className="mt-8">
                <button
                  onClick={handleStartProcessing}
                  disabled={!selectedFile || !reportTitle.trim()}
                  className="
                    w-full py-4 px-6 border border-transparent text-lg font-medium
                    rounded-lg text-white bg-primary-600 hover:bg-primary-700
                    shadow-lg transition-all duration-150 transform hover:scale-105
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  "
                >
                  Start Processing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processing View */}
        {appState === 'processing' && (
          <ProcessingView status={processingStatus} />
        )}

        {/* Results View */}
        {appState === 'results' && (
          <ResultsView
            companies={processedData}
            processingTime={processingTime}
            onDownloadExcel={handleDownloadExcel}
            onDownloadPDF={handleDownloadPDF}
            onReset={handleReset}
            downloadingExcel={downloadingExcel}
            downloadingPDF={downloadingPDF}
          />
        )}

        {/* Error View */}
        {appState === 'error' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                Processing Error
              </h2>

              <p className="text-center text-gray-600 mb-6">{errorMessage}</p>

              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="
                    inline-flex items-center px-6 py-3 border-2 border-gray-300
                    text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50
                  "
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
