/**
 * Common types used across multiple entities
 */

/**
 * Paginated response structure for list endpoints
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

/**
 * Common pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
