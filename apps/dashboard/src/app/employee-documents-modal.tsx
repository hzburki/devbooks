import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@devbooks/ui';
import { Button } from '@devbooks/ui';
import { Input } from '@devbooks/ui';
import { Label } from '@devbooks/ui';
import {
  Search,
  Upload,
  FileText,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useToast } from '@devbooks/hooks';
import { cn } from '@devbooks/ui';

type Document = {
  id: string;
  name: string;
  fileName: string;
  uploadDate: string;
  size: number;
};

type EmployeeDocumentsModalProps = {
  employeeId: number;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Mock documents - replace with actual data from API
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Employment Contract',
    fileName: 'contract.pdf',
    uploadDate: '2023-01-15',
    size: 245760,
  },
  {
    id: '2',
    name: 'ID Card Copy',
    fileName: 'id_card.jpg',
    uploadDate: '2023-01-15',
    size: 102400,
  },
  {
    id: '3',
    name: 'Educational Certificates',
    fileName: 'certificates.pdf',
    uploadDate: '2023-01-16',
    size: 512000,
  },
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export function EmployeeDocumentsModal({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: EmployeeDocumentsModalProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ file: File; name: string }>
  >([]);
  const itemsPerPage = 5;

  // Filter documents based on search
  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ''), // Default name without extension
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileNameChange = (index: number, name: string) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name } : item))
    );
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        variant: 'error',
        title: 'No files selected',
        description: 'Please select at least one file to upload.',
      });
      return;
    }

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      variant: 'success',
      title: 'Files uploaded',
      description: `Successfully uploaded ${selectedFiles.length} file(s).`,
    });

    setSelectedFiles([]);
    setShowUploadForm(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleDelete = async (docId: string) => {
    // Simulate delete
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast({
      variant: 'success',
      title: 'Document deleted',
      description: 'The document has been deleted successfully.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Documents - {employeeName}</DialogTitle>
          <DialogDescription>
            Manage documents for this employee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Upload Button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-background pl-10"
              />
            </div>
            <Button
              onClick={() => setShowUploadForm(!showUploadForm)}
              variant="gradient"
            >
              <Upload className="mr-2 h-4 w-4" />
              {showUploadForm ? 'Cancel Upload' : 'Add Files'}
            </Button>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <div className="rounded-lg border bg-card p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Select Files</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                    className="mt-2 cursor-pointer"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (Max
                    10MB per file)
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <Label>File Names</Label>
                    {selectedFiles.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-lg border p-3"
                      >
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="flex-1">
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              handleFileNameChange(index, e.target.value)
                            }
                            placeholder="Enter file name"
                            className="bg-background"
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.file.name} ({formatFileSize(item.file.size)})
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 shrink-0 text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={handleUpload}
                      variant="gradient"
                      className="w-full"
                    >
                      Upload {selectedFiles.length} File
                      {selectedFiles.length > 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Table */}
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Document Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Size
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedDocuments.length > 0 ? (
                    paginatedDocuments.map((doc) => (
                      <tr
                        key={doc.id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {doc.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {doc.fileName}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                // Handle download
                                toast({
                                  variant: 'info',
                                  title: 'Download started',
                                  description: `Downloading ${doc.fileName}...`,
                                });
                              }}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-sm text-muted-foreground"
                      >
                        {searchQuery
                          ? 'No documents found matching your search.'
                          : 'No documents uploaded yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(endIndex, filteredDocuments.length)} of{' '}
                  {filteredDocuments.length} documents
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
