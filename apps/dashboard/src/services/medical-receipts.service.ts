import { supabase } from '../lib/supabase/client';

/**
 * Extract file extension from filename
 * @param fileName - The file name to extract extension from
 * @returns File extension with dot prefix (e.g., ".pdf") or empty string
 */
function getFileExtension(fileName: string): string {
  const extension = fileName.split('.').pop() || '';
  return extension ? `.${extension}` : '';
}

export const medicalReceiptsService = {
  /**
   * Upload a receipt file to Supabase Storage
   * @param file - The file to upload
   * @param onProgress - Optional callback to track upload progress (0-100)
   * @returns The file path in storage
   */
  async uploadReceipt(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    // Generate unique filename: medical/{uuid}.{extension}
    const fileExtension = getFileExtension(file.name);
    const filePath = `medical/${crypto.randomUUID()}${fileExtension}`;

    // Simulate progress since Supabase doesn't provide it directly
    if (onProgress) {
      onProgress(10);
    }

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('devbooks')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading receipt file:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    if (onProgress) {
      onProgress(100);
    }

    return uploadData.path;
  },

  /**
   * Get public URL for a receipt
   * @param filePath - The file path in storage
   * @returns Public URL for the receipt
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('devbooks')
      .getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Delete a receipt file from storage
   * @param filePath - The file path in storage
   */
  async deleteReceipt(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('devbooks')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting receipt file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  },
};
