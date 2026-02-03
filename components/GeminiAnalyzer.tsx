
import React, { useState } from 'react';
import { X, Brain, Sparkles, Send, Loader2, Database, AlertCircle } from 'lucide-react';
import { TableData } from '../types';
import { GoogleGenAI } from "@google/genai";

interface GeminiAnalyzerProps {
  table: TableData;
  onClose: () => void;
}

const GeminiAnalyzer: React.FC<GeminiAnalyzerProps> = ({ table, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeData = async (customPrompt?: string) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Initialize GoogleGenAI right before the call to ensure the latest API key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare table snapshot for context
      const sampleSize = 10;
      const sampleRows = table.rows.slice(0, sampleSize);
      const dataSummary = `
        Table Name: ${table.name}
        Columns: ${table.columns.join(', ')}
        Total Records: ${table.rows.length}
        Sample Data (first ${sampleSize} rows):
        ${JSON.stringify(sampleRows, null, 2)}
      `;

      const systemInstruction = `You are a world-class data analyst specializing in relational databases and Access MDB files. 
        I am providing you with metadata and sample rows from a database table.
        Provide professional insights, identify potential data quality issues, or answer user questions about this data.
        Keep your tone professional and output in clear Markdown format.`;

      const finalPrompt = customPrompt 
        ? `Given this data: ${dataSummary}\n\nUser Question: ${customPrompt}`
        : `Please analyze this database table and provide 3 key business insights and a summary of the data structure. Data: ${dataSummary}`;

      // Using gemini-3-pro-preview for complex reasoning tasks (data analysis)
      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: finalPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      // Directly access .text property as per guidelines
      setResponse(res.text || "No analysis generated.");
    } catch (err) {
      console.error(err);
      setError("Failed to connect to Gemini AI. Please check your network or API settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm dark:text-white">AI Data Analyst</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Gemini Pro Powered</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!response && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-70">
            <Sparkles className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Ready for Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
              Click the button below or ask a specific question about the "{table.name}" table.
            </p>
            <button 
              onClick={() => analyzeData()}
              className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-lg"
            >
              Generate Quick Insights
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
            <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-medium">Gemini is studying your data...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex gap-3 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {response && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 prose prose-slate dark:prose-invert max-w-none text-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Analysis Result
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-300">
              {response}
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask about ${table.name}...`}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none outline-none rounded-2xl py-3 pl-4 pr-12 text-sm dark:text-white placeholder:text-slate-500 resize-none h-24 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (prompt.trim()) analyzeData(prompt);
              }
            }}
          />
          <button 
            disabled={!prompt.trim() || isLoading}
            onClick={() => analyzeData(prompt)}
            className="absolute bottom-3 right-3 p-2 bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>Active context: {table.name}</span>
          </div>
          <span>Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

export default GeminiAnalyzer;
