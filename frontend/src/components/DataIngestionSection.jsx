import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function DataIngestionSection({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error'
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.csv') || selectedFile.type === 'text/csv' || selectedFile.type === 'application/vnd.ms-excel')) {
      setFile(selectedFile);
      setStatus(null);
      setMessage('');
    } else {
      setStatus('error');
      setMessage('Please select a valid CSV file (.csv extension required).');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/energy/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setStatus('success');
      setMessage(response.data.message);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(response.data);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to upload CSV file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Data Ingestion</h2>
          <p className="text-sm text-gray-500">Upload energy consumption data via CSV to populate live charts.</p>
        </div>
        <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
          <Upload className="h-5 w-5" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 transition-colors hover:border-primary-400 bg-gray-50/50">
          <input
            type="file"
            id="csv-upload"
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
          />
          <label 
            htmlFor="csv-upload" 
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="h-12 w-12 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-primary-500 transition-colors">
              <FileText className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-700">
              {file ? file.name : "Click to select or drag and drop CSV"}
            </p>
            <p className="mt-1 text-xs text-gray-400">Supported format: CSV (max 10MB)</p>
          </label>
        </div>

        {status && (
          <div className={`p-3 rounded-lg flex items-start gap-3 text-sm ${
            status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {status === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p>{message}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            !file || uploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-200'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Data...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Upload & Ingest Data
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 p-4 border-t border-gray-100 italic text-xs text-gray-500">
        Tip: Download the CSV template from the help desk if you're unsure about the column structure.
      </div>
    </div>
  );
}
