import { ReactNode, useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button, Input } from '@devbooks/ui';
import { ChevronLeft, ChevronRight } from '@devbooks/ui';
import { DataTableLoading } from './data-table-loading';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => ReactNode;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationInfo;
  emptyState?: EmptyStateConfig;
  actions?: (row: T) => ReactNode;
  getRowId: (row: T) => string | number;
  loadingText?: string;
  noDataText?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  emptyState,
  actions,
  getRowId,
  loadingText = 'Loading...',
  noDataText = 'No data found matching your search.',
}: DataTableProps<T>) {
  const hasActions = !!actions;
  const [pageInput, setPageInput] = useState<string>('');

  // Sync input with current page when pagination changes
  useEffect(() => {
    if (pagination) {
      setPageInput(String(pagination.currentPage));
    }
  }, [pagination?.currentPage]);

  // Empty state (no data at all)
  if (!loading && data.length === 0 && emptyState) {
    const EmptyIcon = emptyState.icon;
    return (
      <div className="bg-card rounded-lg border">
        <div className="flex flex-col items-center justify-center px-6 py-12">
          <EmptyIcon className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            {emptyState.title}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md text-center text-sm">
            {emptyState.description}
          </p>
          {emptyState.action && emptyState.action}
        </div>
      </div>
    );
  }

  // Calculate pagination display values
  const startIndex = pagination
    ? (pagination.currentPage - 1) * pagination.pageSize + 1
    : 1;
  const endIndex = pagination
    ? Math.min(
        pagination.currentPage * pagination.pageSize,
        pagination.totalCount,
      )
    : data.length;

  return (
    <div className="bg-card rounded-lg border">
      {/* Table */}
      {loading ? (
        <DataTableLoading
          columns={columns}
          hasActions={hasActions}
          pagination={pagination}
        />
      ) : data.length === 0 ? (
        <div className="text-muted-foreground px-6 py-8 text-center text-sm">
          {noDataText}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="text-left px-6 py-3 text-sm font-semibold text-foreground"
                  >
                    {column.header}
                  </th>
                ))}
                {hasActions && (
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-left text-sm ${
                        colIndex === 0
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {column.render
                        ? column.render(row)
                        : column.accessor
                          ? String(row[column.accessor] ?? '-')
                          : '-'}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-6 py-4 text-sm text-left">
                      <div className="flex items-center justify-start gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !loading && (
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-muted-foreground text-sm">
            Showing {startIndex} to {endIndex} of {pagination.totalCount}{' '}
            {pagination.totalCount === 1 ? 'item' : 'items'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Page</span>
              <Input
                type="number"
                min={1}
                max={pagination.totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={(e) => {
                  const page = parseInt(e.target.value, 10);
                  if (
                    !isNaN(page) &&
                    page >= 1 &&
                    page <= pagination.totalPages
                  ) {
                    pagination.onPageChange(page);
                  } else {
                    setPageInput(String(pagination.currentPage));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt(pageInput, 10);
                    if (
                      !isNaN(page) &&
                      page >= 1 &&
                      page <= pagination.totalPages
                    ) {
                      pagination.onPageChange(page);
                    } else {
                      setPageInput(String(pagination.currentPage));
                    }
                  }
                }}
                className="h-8 w-16 text-center"
              />
              <span className="text-muted-foreground text-sm">
                of {pagination.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
