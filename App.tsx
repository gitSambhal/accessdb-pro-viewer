
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Upload, 
  File as FileIcon, 
  X, 
  Moon, 
  Sun, 
  Search, 
  DatabaseZap, 
  LayoutGrid,
  Info,
  Table as TableIcon
} from 'lucide-react';
import { DatabaseFile, TableData } from './types';
import DatabaseView from './components/DatabaseView';

const App: React.FC = () => {
  const [files, setFiles] = useState<DatabaseFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Effect to handle dark mode class application
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Simulated parser for demo purposes
  const processFile = useCallback(async (file: File) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Create some dummy tables to show the UI capabilities
    const tables: TableData[] = [
      {
        id: 'tbl_inventory',
        name: 'Inventory',
        columns: ['SKU', 'ProductName', 'Category', 'StockLevel', 'UnitPrice', 'Supplier'],
        rows: Array.from({ length: 40 }, (_, i) => ({
          SKU: `SKU-${1000 + i}`,
          ProductName: ['Office Chair', 'Desk Lamp', 'Monitor Stand', 'Keyboard Tray', 'Cable Manager'][i % 5],
          Category: 'Office Furniture',
          StockLevel: Math.floor(Math.random() * 100),
          UnitPrice: `$${(Math.random() * 200 + 20).toFixed(2)}`,
          Supplier: `Vendor ${String.fromCharCode(65 + (i % 5))}`
        }))
      },
      {
        id: 'tbl_employees',
        name: 'Employees',
        columns: ['EmpID', 'FullName', 'Department', 'Role', 'HireDate', 'Status'],
        rows: Array.from({ length: 15 }, (_, i) => ({
          EmpID: 100 + i,
          FullName: ['Alex Rivera', 'Jordan Smith', 'Sam Taylor', 'Casey Morgan', 'Taylor Lee'][i % 5],
          Department: ['Engineering', 'Sales', 'HR', 'Legal', 'Marketing'][i % 5],
          Role: ['Senior', 'Junior', 'Manager', 'Director', 'Lead'][i % 5],
          HireDate: '2022-03-15',
          Status: 'Active'
        }))
      }
    ];

    const newFile: DatabaseFile = {
      id,
      fileName: file.name,
      fileSize: file.size,
      tables,
      activeTableId: tables[0].id,
      lastModified: file.lastModified
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(id);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      // Use explicit cast to File[] to avoid unknown type inference issues
      (Array.from(uploadedFiles) as File[]).forEach(file => {
        if (file.name.toLowerCase().endsWith('.mdb') || file.name.toLowerCase().endsWith('.accdb')) {
          processFile(file);
        } else {
          alert("Unsupported file format. Please upload .mdb or .accdb files.");
        }
      });
    }
  };

  const closeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      if (activeFileId === id && filtered.length > 0) {
        setActiveFileId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveFileId(null);
      }
      return filtered;
    });
  };

  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 theme-transition">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900 z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm shadow-blue-500/20">
            <DatabaseZap className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight hidden sm:block">
            AccessDB <span className="text-blue-600 dark:text-blue-500">Pro</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle dark mode"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <label className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-sm active:scale-95">
            <Upload className="w-4 h-4" />
            <span className="hidden xs:inline">Open Database</span>
            <input type="file" multiple className="hidden" accept=".mdb,.accdb" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-h-0">
        {files.length === 0 ? (
          <div 
            className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFiles = e.dataTransfer.files;
              // Use explicit cast to File[] to avoid unknown type inference issues
              (Array.from(droppedFiles) as File[]).forEach(file => {
                const name = file.name.toLowerCase();
                if (name.endsWith('.mdb') || name.endsWith('.accdb')) {
                  processFile(file);
                }
              });
            }}
          >
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-8 animate-in zoom-in duration-500">
              <Database className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Access Database Viewer</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-10 leading-relaxed">
              Open Microsoft Access files securely in your browser. No data leaves your machine. 
              Drag and drop files to get started.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
              {[
                { icon: <LayoutGrid />, title: "Table Explorer", desc: "Browse schemas and tables instantly" },
                { icon: <Search />, title: "Data Filtering", desc: "High-speed filtering and sorting" },
                { icon: <Info />, title: "Secure & Local", desc: "No server uploads, 100% private" }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center group hover:border-blue-500/50 transition-colors">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    {React.cloneElement(feature.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                  </div>
                  <h3 className="font-bold text-sm mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tab Bar */}
            <div className="flex bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shrink-0">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`flex items-center gap-2 px-5 py-3 border-r border-slate-200 dark:border-slate-800 text-sm font-semibold transition-all relative min-w-[180px] group
                    ${activeFileId === file.id 
                      ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-500' 
                      : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <FileIcon className={`w-4 h-4 shrink-0 ${activeFileId === file.id ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="truncate flex-1 text-left">{file.fileName}</span>
                  <X 
                    className="w-4 h-4 invisible group-hover:visible hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md p-0.5 transition-all" 
                    onClick={(e) => closeFile(file.id, e)} 
                  />
                  {activeFileId === file.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500"></div>
                  )}
                </button>
              ))}
              <label className="flex items-center justify-center px-4 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer border-r border-slate-200 dark:border-slate-800 text-slate-400">
                <Upload className="w-4 h-4" />
                <input type="file" multiple className="hidden" accept=".mdb,.accdb" onChange={handleFileUpload} />
              </label>
            </div>

            {/* Viewport */}
            {activeFile && (
              <DatabaseView 
                file={activeFile} 
                onUpdateFile={(updated) => setFiles(prev => prev.map(f => f.id === updated.id ? updated : f))}
              />
            )}
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer className="h-9 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center px-4 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-medium">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${files.length > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
            <span>{files.length > 0 ? 'Engine Online' : 'System Ready'}</span>
          </div>
          {activeFile && (
            <>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-800"></div>
              <div className="flex items-center gap-1.5">
                <TableIcon className="w-3 h-3" />
                <span>{activeFile.tables.length} Tables Loaded</span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-800"></div>
              <span>{(activeFile.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-5 opacity-70">
          <span>Client-Side Only</span>
          <span className="mono">v1.2.0-PRO</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
