
import React, { useState, useMemo } from 'react';
import { Search, Filter, Database, FileSpreadsheet, ChevronRight, Grid3X3 } from 'lucide-react';
import { DatabaseFile, TableData } from '../types';
import TableGrid from './TableGrid';

interface DatabaseViewProps {
  file: DatabaseFile;
  onUpdateFile: (file: DatabaseFile) => void;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ file, onUpdateFile }) => {
  const [filterText, setFilterText] = useState('');

  const activeTable = useMemo(() => 
    file.tables.find(t => t.id === file.activeTableId) || file.tables[0],
    [file]
  );

  const handleTableChange = (tableId: string) => {
    onUpdateFile({ ...file, activeTableId: tableId });
  };

  return (
    <div className="flex-1 flex flex-row min-h-0 bg-white dark:bg-slate-950">
      {/* Tables Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/30">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Database Objects</span>
          <div className="flex gap-1">
             <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-bold">T:{file.tables.length}</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {file.tables.map(table => (
            <button
              key={table.id}
              onClick={() => handleTableChange(table.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 group transition-all text-sm font-medium
                ${file.activeTableId === table.id 
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
            >
              <FileSpreadsheet className={`w-4 h-4 shrink-0 ${file.activeTableId === table.id ? 'text-blue-500' : 'text-slate-400 opacity-70'}`} />
              <span className="truncate flex-1">{table.name}</span>
              <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${file.activeTableId === table.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0'}`} />
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
           Select a table to browse records
        </div>
      </aside>

      {/* Table Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
        {/* Table Toolbar */}
        <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 bg-white dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Grid3X3 className="w-4 h-4 text-blue-500 shrink-0" />
            <h3 className="font-bold text-sm truncate dark:text-slate-100">
              {activeTable.name}
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full font-bold uppercase tracking-tight shrink-0">
              {activeTable.rows.length} Rows
            </span>
          </div>

          <div className="flex-1 max-w-xl ml-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search across all columns..." 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="block w-full pl-10 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <Filter className="w-3.5 h-3.5" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Grid Display */}
        <div className="flex-1 overflow-hidden relative">
          <TableGrid 
            table={activeTable} 
            filterText={filterText}
          />
        </div>
      </div>
    </div>
  );
};

export default DatabaseView;
