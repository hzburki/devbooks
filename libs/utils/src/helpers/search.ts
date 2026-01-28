/**
 * Escapes special characters in a search string for use in Supabase ILIKE queries.
 * This ensures that characters like % and _ are treated as literal characters
 * rather than wildcards when searching.
 *
 * @param searchTerm - The search term to escape
 * @returns The escaped search term safe for use in ILIKE queries
 *
 * @example
 * ```typescript
 * const escaped = escapeSearchTerm('50% discount');
 * // Returns: '50\\% discount'
 * ```
 */
export const escapeSearchTerm = (searchTerm: string): string => {
  // Escape % and _ which are special characters in PostgreSQL ILIKE patterns
  // % matches any sequence of characters
  // _ matches any single character
  return searchTerm.replace(/%/g, '\\%').replace(/_/g, '\\_');
};

/**
 * Builds a Supabase OR query string for searching across multiple columns.
 * This is a convenience function for creating the OR syntax used in Supabase queries.
 *
 * @param columns - Array of column names to search
 * @param searchTerm - The search term (will be automatically escaped)
 * @param useWildcards - Whether to wrap the search term with % wildcards (default: true)
 * @returns A formatted OR query string for use with Supabase's .or() method
 *
 * @example
 * ```typescript
 * const orQuery = buildSearchOrQuery(
 *   ['full_name', 'email', 'contact_number'],
 *   'john'
 * );
 * // Returns: 'full_name.ilike.%john%,email.ilike.%john%,contact_number.ilike.%john%'
 * ```
 */
export const buildSearchOrQuery = (
  columns: string[],
  searchTerm: string,
  useWildcards = true,
): string => {
  const escapedTerm = escapeSearchTerm(searchTerm);
  const searchValue = useWildcards ? `%${escapedTerm}%` : escapedTerm;

  return columns.map((column) => `${column}.ilike.${searchValue}`).join(',');
};
