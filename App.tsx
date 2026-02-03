
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Upload, 
  File, 
  X, 
  Moon, 
  Sun, 
  Search, 
  DatabaseZap, 
  LayoutGrid,
  Info
} from 'lucide-react';
import { DatabaseFile, TableData } from './types';
import DatabaseView from './components/DatabaseView';

const App: React.FC = () => {
  const [files, setFiles] = useState<DatabaseFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Effect to handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Handle file reading (simulated MDB parsing for the demo)
  const processFile = useCallback(async (file: File) => {
    // In a real production app, you would use a WASM-based MDB driver here.
    // For this minimal demo, we'll parse the file name and structure to demonstrate the UI features.
    
    // Simulating delay for "parsing"
    await new Promise(resolve => setTimeout(resolve, 800));

    const id = Math.random().toString(36).substr(2, 9);
    
    // Create some dummy tables based on common Access patterns
    const tables: TableData[] = [
      {
        id: 'tbl_customers',
        name: 'Customers',
        columns: ['ID', 'FirstName', 'LastName', 'Email', 'Phone', 'Country', 'RegistrationDate'],
        rows: Array.from({ length: 50 }, (_, i) => ({
          ID: i + 1,
          FirstName: ['John', 'Jane', 'Alice', 'Bob', 'Charlie'][i % 5],
          LastName: ['Smith', 'Doe', 'Brown', 'Johnson', 'Wilson'][i % 5],
          Email: `user${i}@example.com`,
          Phone: `555-010${i}`,
          Country: ['USA', 'UK', 'Canada', 'Germany', 'France'][i % 5],
          RegistrationDate: new Date(2023, 0, i + 1).toLocaleDateString()
        }))
      },
      {
        id: 'tbl_orders',
        name: 'Orders',
        columns: ['OrderID', 'CustomerID', 'Product', 'Quantity', 'Price', 'Status'],
        rows: Array.from({ length: 30 }, (_, i) => ({
          OrderID: 1000 + i,
          CustomerID: (i % 5) + 1,
          Product: ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Desk Chair'][i % 5],
          Quantity: Math.floor(Math.random() * 5) + 1,
          Price: (Math.random() * 1000).toFixed(2),
          Status: ['Shipped', 'Pending', 'Processing'][i % 3]
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
      Array.from(uploadedFiles).forEach(file => {
        if (file.name.endsWith('.mdb') || file.name.endsWith('.accdb')) {
          processFile(file);
        } else {
          alert("Only .mdb and .accdb files are supported currently.");
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
    <div 
      className="flex flex-col h-screen overflow-hidden dark:bg-slate-950 transition-colors"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        Array.from(droppedFiles).forEach(file => {
          if (file.name.endsWith('.mdb') || file.name.endsWith('.accdb')) {
            processFile(file);
          }
        });
      }}
    >
      {/* Header */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <DatabaseZap className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight dark:text-white hidden sm:block">AccessDB <span className="text-blue-600">Pro</span></h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium cursor-pointer transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            <span>Open Database</span>
            <input type="file" multiple className="hidden" accept=".mdb,.accdb" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 relative">
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-500/20 border-2 border-dashed border-blue-500 dark:border-blue-400 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold dark:text-white">Drop your database file</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Supports .mdb and .accdb files</p>
              </div>
            </div>
          </div>
        )}
        {files.length === 0 ? (
          <div 
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFiles = e.dataTransfer.files;
              Array.from(droppedFiles).forEach(file => {
                if (file.name.endsWith('.mdb') || file.name.endsWith('.accdb')) {
                  processFile(file);
                }
              });
            }}
          >
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6">
              <Database className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Ready to View Database Files</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
              Drag and drop your .mdb or .accdb files here, or use the "Open Database" button to start browsing your tables.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
              {[
                { icon: <LayoutGrid />, title: "Table View", desc: "Easily sort and filter your data" },
                { icon: <Search />, title: "Fast Query", desc: "Instantly find the records you need" },
                { icon: <Info />, title: "Metadata", desc: "View relationships and column types" }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mb-3">
                    {/* Fix: Casting to React.ReactElement<any> to resolve TypeScript error on className property in cloneElement */}
                    {React.cloneElement(feature.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                  </div>
                  <h3 className="font-semibold text-sm dark:text-white">{feature.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-r border-slate-200 dark:border-slate-800 text-sm font-medium transition-colors relative min-w-[160px] max-w-[280px]
                    ${activeFileId === file.id 
                      ? 'bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <File className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate flex-1 text-left">{file.fileName}</span>
                  <X 
                    className="w-4 h-4 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5" 
                    onClick={(e) => closeFile(file.id, e)} 
                  />
                  {activeFileId === file.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            {activeFile && (
              <DatabaseView 
                file={activeFile} 
                onUpdateFile={(updated) => setFiles(prev => prev.map(f => f.id === updated.id ? updated : f))}
              />
            )}
          </>
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${files.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
            <span>{files.length > 0 ? 'Ready' : 'Waiting for file'}</span>
          </div>
          {activeFile && (
            <>
              <span className="border-l border-slate-200 dark:border-slate-800 h-3"></span>
              <span>Tables: {activeFile.tables.length}</span>
              <span className="border-l border-slate-200 dark:border-slate-800 h-3"></span>
              <span>Size: {(activeFile.fileSize / 1024).toFixed(2)} KB</span>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span>Built for Performance</span>
          <span className="opacity-50">v1.0.4</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
