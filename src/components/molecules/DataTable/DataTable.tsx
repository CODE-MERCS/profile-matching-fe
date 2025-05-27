// src/components/molecules/DataTable/DataTable.tsx (update)
import React from 'react';

interface Column {
  id: string;
  label: string;
  sortable: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  renderActions: (item: any) => React.ReactNode;
  isLoading?: boolean;
  startIndex?: number; // Nomor awal untuk penomoran
  renderCell?: (item: any, columnId: string) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  renderActions,
  isLoading = false,
  startIndex = 0,
  renderCell
}) => {
  // ... [kode lain tetap sama]
  
  // Render table with data
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No
            </th>
            {columns.map(column => (
              <th 
                key={column.id} 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <button className="ml-1 focus:outline-none">
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr 
              key={item.id || index} 
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {startIndex + index + 1}
              </td>
              {columns.map(column => (
                <td 
                  key={column.id} 
                  className="px-4 py-4 whitespace-nowrap text-sm text-gray-800"
                >
                  {column.id === 'actions' 
                    ? renderActions(item)
                    : renderCell
                      ? renderCell(item, column.id)
                      : item[column.id]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;