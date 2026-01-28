// Helper function to format enum values for display
export const formatEnumValue = (value: string): string => {
  return value
    .split('_')
    .map((word) => {
      if (word.length === 2) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};
