import type { Column, PaginationInfo } from './data-table';

export interface DataTableLoadingProps<T> {
  columns: Column<T>[];
  hasActions: boolean;
  pagination?: PaginationInfo;
}

export function DataTableLoading<T>({
  columns,
  hasActions,
  pagination,
}: DataTableLoadingProps<T>) {
  // Determine number of skeleton rows to show
  const skeletonRowCount = pagination?.pageSize || 5;

  return (
    <>
      {/* Table Loading State */}
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
            {Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-muted/50">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 text-left text-sm ${
                      colIndex === 0
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </td>
                ))}
                {hasActions && (
                  <td className="px-6 py-4 text-sm text-left">
                    <div className="flex items-center justify-start gap-2">
                      <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                      <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                      <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Loading State */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-8 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
      )}
    </>
  );
}
