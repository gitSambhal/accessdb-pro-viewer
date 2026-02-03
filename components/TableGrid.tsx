
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown, MoreHorizontal, Search } from 'lucide-react';
import { TableData, SortConfig, ColumnWidths } from '../types';

interface TableGridProps {
  table: TableData;
  filterText: string;
}

const TableGrid: React.FC<TableGridProps> = ({ table, filterText }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: null });
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  
  const resizerRef = useRef<{ col: string; startX: number; startWidth: number } | null>(null);

  // Initialize column widths efficiently
  useEffect(() => {
    const initialWidths: ColumnWidths = {};
    table.columns.forEach(col => {
      initialWidths[col] = 180; // Standard production-grade column width
    });
    setColumnWidths(initialWidths);
    setSortConfig({ column: null, direction: null }); // Reset sort on table change
  }, [table.id, table.columns]);

  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev.column === column) {
        if (prev.direction === 'asc') return { column, direction: 'desc' };
        if (prev.direction === 'desc') return { column: null, direction: null };
      }
      return { column, direction: 'asc' };
    });
  };

  const processedRows = useMemo(() => {
    let rows = [...table.rows];

    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      rows = rows.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(lowerFilter)
        )
      );
    }

    if (sortConfig.column && sortConfig.direction) {
      rows.sort((a, b) => {
        const valA = a[sortConfig.column!];
        const valB = b[sortConfig.column!];
        
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [table.rows, filterText, sortConfig]);

  const handleMouseDown = useCallback((e: React.MouseEvent, col: string) => {
    resizerRef.current = {
      col,
      startX: e.clientX,
      startWidth: columnWidths[col] || 180
    };
    
    document.body.classList.add('resizing');

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (resizerRef.current) {
        const delta = moveEvent.clientX - resizerRef.current.startX;
        const newWidth = Math.max(100, resizerRef.current.startWidth + delta);
        setColumnWidths(prev => ({ ...prev, [resizerRef.current!.col]: newWidth }));
      }
    };

    const handleMouseUp = () => {
      resizerRef.current = null;
      document.body.classList.remove('resizing');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [columnWidths]);

  return (
    <div className="w-full h-full overflow-auto bg-white dark:bg-slate-950">
      <table className="border-separate border-spacing-0 table-fixed min-w-full">
        <thead className="sticky top-0 z-10">
          <tr>
            {table.columns.map(col => (
              <th 
                key={col} 
                className="group relative border-b border-r border-slate-200 dark:border-slate-800 p-0 text-left bg-slate-50 dark:bg-slate-900/80 backdrop-blur-sm"
                style={{ width: columnWidths[col] || 180 }}
              >
                <div 
                  className="flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => handleSort(col)}
                >
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider">{col}</span>
                  <div className="flex-shrink-0 ml-2">
                    {sortConfig.column === col ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
                
                {/* Visual Resizer */}
                <div 
                  className="absolute top-0 right-0 bottom-0 w-[4px] cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 transition-colors z-20"
                  onMouseDown={(e) => handleMouseDown(e, col)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {processedRows.length > 0 ? (
            processedRows.map((row, i) => (
              <tr 
                key={i} 
                className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group"
              >
                {table.columns.map(col => (
                  <td 
                    key={col} 
                    className="border-r border-slate-100 dark:border-slate-800/50 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 truncate font-medium mono"
                    title={String(row[col])}
                  >
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={table.columns.length} 
                className="py-24 text-center"
              >
                <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                   <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-2">
                      <Search className="w-6 h-6" />
                   </div>
                   <p className="text-sm font-semibold italic">No records match your current search.</p>
                   <p className="text-xs">Try clearing the search box or selecting a different table.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableGrid;
