
export interface TableData {
  id: string;
  name: string;
  columns: string[];
  rows: Record<string, any>[];
}

export interface DatabaseFile {
  id: string;
  fileName: string;
  fileSize: number;
  tables: TableData[];
  activeTableId: string;
  lastModified: number;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  column: string | null;
  direction: SortDirection;
}

export interface ColumnWidths {
  [key: string]: number;
}
