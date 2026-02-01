import { supabase } from '../lib/supabase/client';
import type {
  EmployeeDocument,
  CreateEmployeeDocumentInput,
} from '@devbooks/utils';

// Re-export types for backward compatibility
export type { EmployeeDocument, CreateEmployeeDocumentInput };

/**
 * Extract file extension from filename
 * @param fileName - The file name to extract extension from
 * @returns File extension with dot prefix (e.g., ".pdf") or empty string
 */
function getFileExtension(fileName: string): string {
  const extension = fileName.split('.').pop() || '';
  return extension ? `.${extension}` : '';
}

export const employeeDocumentsService = {
  /**
   * Upload a document file to Supabase Storage and create a record in employee_documents table
   * @param file - The file to upload
   * @param name - The name of the document
   * @param onProgress - Optional callback to track upload progress (0-100)
   * @returns The created EmployeeDocument record
   */
  async uploadDocument(
    file: File,
    name: string,
    onProgress?: (progress: number) => void,
  ): Promise<EmployeeDocument> {
    // First, create the record to get the document ID
    const now = new Date().toISOString();
    const fileExtension = getFileExtension(file.name);
    const tempFilePath = `employees/documents/temp/${crypto.randomUUID()}${fileExtension}`;

    const documentData = {
      file_path: tempFilePath, // Temporary path, will be updated after upload
      name,
      employee_id: null,
      meta_data: {
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
      created_at: now,
      updated_at: now,
    };

    const { data: insertedData, error: insertError } = await supabase
      .from('employee_documents')
      .insert(documentData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating document record:', insertError);
      throw new Error(
        `Failed to create document record: ${insertError.message}`,
      );
    }

    const documentId = insertedData.id;
    // Use documentId as filename: employees/documents/{documentId}.{extension}
    const filePath = `employees/documents/${documentId}${fileExtension}`;

    // Upload file to Supabase Storage
    // Simulate progress since Supabase doesn't provide it directly
    if (onProgress) {
      onProgress(10);
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('devbooks')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      // Clean up the database record if upload fails
      try {
        await supabase.from('employee_documents').delete().eq('id', documentId);
      } catch (cleanupError) {
        // Ignore cleanup errors
        console.error('Error cleaning up document record:', cleanupError);
      }
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    if (onProgress) {
      onProgress(90);
    }

    // Update the record with the actual file path
    const { data: updatedData, error: updateError } = await supabase
      .from('employee_documents')
      .update({
        file_path: uploadData.path,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating document record:', updateError);
      // Try to clean up the uploaded file if database update fails
      try {
        await supabase.storage.from('devbooks').remove([uploadData.path]);
      } catch (cleanupError) {
        // Ignore cleanup errors
        console.error('Error cleaning up uploaded file:', cleanupError);
      }
      throw new Error(
        `Failed to update document record: ${updateError.message}`,
      );
    }

    if (onProgress) {
      onProgress(100);
    }

    return updatedData;
  },

  /**
   * Link documents to an employee by updating their employee_id
   * @param employeeId - The employee ID to link documents to
   * @param documentIds - Array of document IDs to link
   */
  async linkDocumentsToEmployee(
    employeeId: string,
    documentIds: string[],
  ): Promise<void> {
    if (documentIds.length === 0) {
      return;
    }

    const { error } = await supabase
      .from('employee_documents')
      .update({
        employee_id: employeeId,
        updated_at: new Date().toISOString(),
      })
      .in('id', documentIds)
      .is('deleted_at', null);

    if (error) {
      console.error('Error linking documents to employee:', error);
      throw new Error(`Failed to link documents: ${error.message}`);
    }
  },

  /**
   * Unlink documents from an employee by setting employee_id to NULL
   * @param documentIds - Array of document IDs to unlink
   */
  async unlinkDocumentsFromEmployee(documentIds: string[]): Promise<void> {
    if (documentIds.length === 0) {
      return;
    }

    const { error } = await supabase
      .from('employee_documents')
      .update({
        employee_id: null,
        updated_at: new Date().toISOString(),
      })
      .in('id', documentIds)
      .is('deleted_at', null);

    if (error) {
      console.error('Error unlinking documents:', error);
      throw new Error(`Failed to unlink documents: ${error.message}`);
    }
  },

  /**
   * Get all documents for an employee
   * @param employeeId - The employee ID
   * @returns Array of EmployeeDocument records with public URLs
   */
  async getByEmployeeId(employeeId: string): Promise<EmployeeDocument[]> {
    const { data, error } = await supabase
      .from('employee_documents')
      .select('*')
      .eq('employee_id', employeeId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employee documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return (data as EmployeeDocument[]) ?? [];
  },

  /**
   * Get public URL for a document
   * @param filePath - The file path in storage
   * @returns Public URL for the document
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('devbooks')
      .getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Soft delete documents by setting deleted_at timestamp and delete files from storage
   * @param documentIds - Array of document IDs to soft delete
   */
  async softDeleteDocuments(documentIds: string[]): Promise<void> {
    if (documentIds.length === 0) {
      return;
    }

    // First, fetch the documents to get their file paths
    const { data: documents, error: fetchError } = await supabase
      .from('employee_documents')
      .select('id, file_path')
      .in('id', documentIds)
      .is('deleted_at', null);

    if (fetchError) {
      console.error('Error fetching documents for deletion:', fetchError);
      throw new Error(`Failed to fetch documents: ${fetchError.message}`);
    }

    // Delete files from storage
    if (documents && documents.length > 0) {
      const filePaths = documents
        .map((doc) => doc.file_path)
        .filter((path): path is string => !!path);

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('devbooks')
          .remove(filePaths);

        if (storageError) {
          console.error('Error deleting files from storage:', storageError);
          // Continue with soft delete even if file deletion fails
          // The file will remain in storage but the record will be soft deleted
        }
      }
    }

    // Soft delete the records
    const { error } = await supabase
      .from('employee_documents')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', documentIds);

    if (error) {
      console.error('Error soft deleting documents:', error);
      throw new Error(`Failed to soft delete documents: ${error.message}`);
    }
  },
};
