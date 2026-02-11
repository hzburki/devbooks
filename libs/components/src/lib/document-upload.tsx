import { Button, Input } from '@devbooks/ui';
import { Plus, Trash2, CheckCircle2, Download } from '@devbooks/ui';
import type { FieldErrors, UseFormTrigger } from 'react-hook-form';

/**
 * Generic document type for the upload component
 */
export interface DocumentUploadItem {
  id?: string;
  name: string;
  file?: File;
  filePath?: string;
  uploadProgress?: number;
  isUploading?: boolean;
  isDeleted?: boolean;
}

/**
 * Service interface that must be implemented by document services
 */
export interface DocumentUploadService {
  /**
   * Upload a document file
   * @param file - The file to upload
   * @param name - The name of the document
   * @param onProgress - Optional callback to track upload progress (0-100)
   * @returns Promise resolving to a document object with id and file_path (or filePath) properties
   */
  uploadDocument(
    file: File,
    name: string,
    onProgress?: (progress: number) => void,
  ): Promise<{ id: string; file_path?: string; filePath?: string }>;

  /**
   * Get public URL for a document
   * @param filePath - The file path in storage
   * @returns Public URL for the document
   */
  getPublicUrl(filePath: string): string;
}

export interface DocumentUploadProps<TFieldValues = any> {
  /**
   * Array of documents to display
   */
  documents: DocumentUploadItem[];

  /**
   * Callback to add a new document
   */
  onAddDocument: () => void;

  /**
   * Callback to remove a document
   * @param index - Index of the document to remove
   */
  onRemoveDocument: (index: number) => void;

  /**
   * Callback to update document name
   * @param index - Index of the document
   * @param name - New name for the document
   */
  onUpdateDocumentName: (index: number, name: string) => void;

  /**
   * Callback to update document file (triggers upload)
   * @param index - Index of the document
   * @param file - File to upload
   */
  onUpdateDocumentFile: (index: number, file: File) => void;

  /**
   * Document service with upload and URL methods
   */
  documentService: DocumentUploadService;

  /**
   * Form errors from react-hook-form
   */
  errors?: FieldErrors<TFieldValues>;

  /**
   * Trigger function from react-hook-form for validation
   */
  trigger: UseFormTrigger<TFieldValues>;

  /**
   * Field name in the form (e.g., "documents")
   */
  fieldName: string;

  /**
   * Optional label for the document name field
   * @default "Document Name"
   */
  documentNameLabel?: string;

  /**
   * Optional label for the upload field
   * @default "Upload Document"
   */
  uploadLabel?: string;

  /**
   * Optional accept attribute for file input
   * @default "*/*"
   */
  accept?: string;

  /**
   * Whether the first document is required
   * @default true
   */
  firstDocumentRequired?: boolean;
}

/**
 * Reusable document upload component
 * Can be used with any form and any document service
 */
export function DocumentUpload<TFieldValues = any>({
  documents,
  onAddDocument,
  onRemoveDocument,
  onUpdateDocumentName,
  onUpdateDocumentFile,
  documentService,
  errors,
  trigger,
  fieldName,
  documentNameLabel = 'Document Name',
  uploadLabel = 'Upload Document',
  accept = '*/*',
  firstDocumentRequired = true,
}: DocumentUploadProps<TFieldValues>) {
  return (
    <div className="space-y-4">
      {documents.map((document, index) => {
        if (document.isDeleted) {
          return null;
        }
        const isUploading = document.isUploading;
        const uploadProgress = document.uploadProgress || 0;
        const hasFile = document.id || document.filePath;
        const fileUrl = document.filePath
          ? documentService.getPublicUrl(document.filePath)
          : null;

        // Get errors for this document
        const fieldErrors = errors?.[fieldName as keyof typeof errors] as
          | {
              [key: number]: { name?: { message?: string }; file?: { message?: string } };
            }
          | { message?: string }
          | undefined;
        const documentErrors =
          fieldErrors && !('message' in fieldErrors)
            ? fieldErrors[index]
            : undefined;

        return (
          <div
            key={document.id || `new-${index}`}
            className="relative flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start"
          >
            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                <div className="w-full max-w-md space-y-2 px-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 space-y-2">
              <Input
                id={`document-name-${index}`}
                label={
                  index === 0 && firstDocumentRequired ? (
                    <>
                      {documentNameLabel}{' '}
                      <span className="text-destructive">*</span>
                    </>
                  ) : (
                    documentNameLabel
                  )
                }
                placeholder="Enter document name"
                value={document.name || ''}
                onChange={(e) => onUpdateDocumentName(index, e.target.value)}
                onBlur={() => trigger(`${fieldName}.${index}.name` as any)}
                error={documentErrors?.name?.message as string}
                disabled={isUploading}
              />
            </div>
            <div className="flex-1 space-y-2">
              {!hasFile ? (
                <Input
                  id={`document-file-${index}`}
                  type="file"
                  label={
                    <>
                      {uploadLabel}{' '}
                      <span className="text-destructive">*</span>
                    </>
                  }
                  accept={accept}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUpdateDocumentFile(index, file);
                    }
                    trigger(`${fieldName}.${index}.file` as any);
                  }}
                  onBlur={() => trigger(`${fieldName}.${index}.file` as any)}
                  className="cursor-pointer"
                  disabled={isUploading}
                  error={documentErrors?.file?.message as string}
                />
              ) : (
                <div>
                  <div className="pt-7">
                    <div className="text-sm text-muted-foreground">File uploaded</div>
                  </div>
                  {hasFile && !isUploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>Document uploaded</span>
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 flex items-center gap-1 text-primary hover:underline"
                        >
                          <Download className="h-3 w-3" />
                          View
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center sm:mt-7">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onRemoveDocument(index)}
                className="h-10 w-10"
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove document</span>
              </Button>
            </div>
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        onClick={onAddDocument}
        className="w-full sm:w-auto"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Document
      </Button>
      {errors &&
        errors[fieldName as keyof typeof errors] &&
        typeof (errors[fieldName as keyof typeof errors] as { message?: string })
          ?.message === 'string' && (
          <p className="text-sm text-destructive">
            {
              (errors[fieldName as keyof typeof errors] as { message: string })
                .message
            }
          </p>
        )}
    </div>
  );
}
