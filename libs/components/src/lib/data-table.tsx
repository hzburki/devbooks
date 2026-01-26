import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@devbooks/ui';
import { ChevronLeft, ChevronRight } from '@devbooks/ui';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
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

  // Loading state
  if (loading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">{loadingText}</div>
        </div>
      </div>
    );
  }

  // Empty state (no data at all)
  if (!loading && data.length === 0 && emptyState) {
    const EmptyIcon = emptyState.icon;
    return (
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-center justify-center px-6 py-12">
          <EmptyIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {emptyState.title}
          </h3>
          <p className="mb-4 max-w-md text-center text-sm text-muted-foreground">
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
    <div className="rounded-lg border bg-card">
      {/* Table */}
      {data.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-muted-foreground">
          {noDataText}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-6 py-3 text-sm font-semibold text-foreground ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {column.header}
                  </th>
                ))}
                {hasActions && (
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="transition-colors hover:bg-muted/50"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-sm ${
                        colIndex === 0
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      } ${
                        column.align === 'right'
                          ? 'text-right'
                          : column.align === 'center'
                            ? 'text-center'
                            : 'text-left'
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
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
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
      {pagination &&
        data.length > 0 &&
        pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex} to {endIndex} of {pagination.totalCount}{' '}
              {pagination.totalCount === 1 ? 'item' : 'items'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={
                        pagination.currentPage === page ? 'default' : 'outline'
                      }
                      size="sm"
                      className="h-8 w-8"
                      onClick={() => pagination.onPageChange(page)}
                    >
                      {page}
                    </Button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
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
