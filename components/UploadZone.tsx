'use client';

import React, { useCallback, useState } from 'react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleFile(file);
      }
    },
    [disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        handleFile(file);
      }
    },
    [disabled]
  );

  const handleFile = (file: File) => {
    // Validate file type
    const validExtensions = ['csv', 'xlsx', 'xls'];
    const extension = file.name.toLowerCase().split('.').pop();

    if (!extension || !validExtensions.includes(extension)) {
      alert('Invalid file type. Please upload a CSV or Excel file.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880');
    if (file.size > maxSize) {
      alert(`File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    onFileSelect(file);
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center
        transition-all duration-200 ease-in-out
        ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileInput}
        disabled={disabled}
      />

      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {/* Upload Icon */}
        <svg
          className={`w-16 h-16 mb-4 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragging ? 'Drop file here' : 'Drag and drop your file here'}
        </p>

        <p className="text-sm text-gray-500 mb-4">or</p>

        <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
          Browse Files
        </span>

        <p className="text-xs text-gray-400 mt-4">
          Supports CSV and Excel files (max 5MB)
        </p>
      </label>
    </div>
  );
}
