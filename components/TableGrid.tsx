
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { TableData, SortConfig, ColumnWidths } from '../types';

interface TableGridProps {
  table: TableData;
  filterText: string;
}

const TableGrid: React.FC<TableGridProps> = ({ table, filterText }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: null });
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  
  const resizerRef = useRef<{ col: string; startX: number; startWidth: number } | null>(null);

  // Initialize column widths
  useEffect(() => {
    const initialWidths: ColumnWidths = {};
    table.columns.forEach(col => {
      initialWidths[col] = 150; // Default width
    });
    setColumnWidths(initialWidths);
  }, [table.id, table.columns]);

  // Handle Sort
  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev.column === column) {
        if (prev.direction === 'asc') return { column, direction: 'desc' };
        if (prev.direction === 'desc') return { column: null, direction: null };
      }
      return { column, direction: 'asc' };
    });
  };

  // Process Rows (Filter & Sort)
  const processedRows = useMemo(() => {
    let rows = [...table.rows];

    // Filter
    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      rows = rows.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(lowerFilter)
        )
      );
    }

    // Sort
    if (sortConfig.column && sortConfig.direction) {
      rows.sort((a, b) => {
        const valA = a[sortConfig.column!];
        const valB = b[sortConfig.column!];
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [table.rows, filterText, sortConfig]);

  // Resizing logic
  const handleMouseDown = useCallback((e: React.MouseEvent, col: string) => {
    resizerRef.current = {
      col,
      startX: e.clientX,
      startWidth: columnWidths[col] || 150
    };
    
    document.body.classList.add('resizing');

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (resizerRef.current) {
        const delta = moveEvent.clientX - resizerRef.current.startX;
        const newWidth = Math.max(80, resizerRef.current.startWidth + delta);
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
    <div className="w-full h-full overflow-auto bg-slate-50 dark:bg-slate-900/20">
      <table className="border-collapse table-fixed min-w-full">
        <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
          <tr>
            {table.columns.map(col => (
              <th 
                key={col} 
                className="group relative border-b border-r border-slate-200 dark:border-slate-800 p-0 text-left overflow-visible"
                style={{ width: columnWidths[col] || 150 }}
              >
                <div 
                  className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => handleSort(col)}
                >
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate tracking-tight">{col}</span>
                  <div className="flex-shrink-0 ml-1">
                    {sortConfig.column === col ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                </div>
                
                {/* Resizer Handle */}
                <div 
                  className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-400/50 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, col)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {processedRows.length > 0 ? (
            processedRows.map((row, i) => (
              <tr 
                key={i} 
                className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group"
              >
                {table.columns.map(col => (
                  <td 
                    key={col} 
                    className="border-b border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 truncate"
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
                className="py-20 text-center text-slate-400 dark:text-slate-600 italic text-sm"
              >
                No matching records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableGrid;
