
import React, { useState, useMemo } from 'react';
import { Search, Filter, Database, FileSpreadsheet, ChevronRight } from 'lucide-react';
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
    <div className="flex-1 flex flex-row min-h-0 bg-white dark:bg-slate-900">
      {/* Sidebar - Tables List */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">All Tables</span>
          <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px]">{file.tables.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {file.tables.map(table => (
            <button
              key={table.id}
              onClick={() => handleTableChange(table.id)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-2 group transition-colors text-sm
                ${file.activeTableId === table.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${file.activeTableId === table.id ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
              <span className="truncate flex-1">{table.name}</span>
              <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${file.activeTableId === table.id ? 'opacity-100' : ''}`} />
            </button>
          ))}
        </div>
      </aside>

      {/* Main Table Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
        {/* Table Toolbar */}
        <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mr-2">
            <h3 className="font-semibold text-sm dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              {activeTable.name}
            </h3>
            <span className="text-xs text-slate-400 font-mono">({activeTable.rows.length} records)</span>
          </div>

          <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search in this table..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-transparent border-none outline-none text-sm ml-2 w-full dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Layout: Data Grid */}
        <div className="flex-1 flex min-h-0 relative">
          <div className="flex-1 overflow-hidden">
             <TableGrid 
                table={activeTable} 
                filterText={filterText}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseView;
