import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPage } from '@devbooks/components';
import { Button } from '@devbooks/ui';
import { Input } from '@devbooks/ui';
import { employeesService, type Employee } from '../../../services';
import { useToast } from '@devbooks/hooks';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
} from '@devbooks/ui';

// Helper function to format enum values for display
const formatEnumValue = (value: string): string => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to format job type for display
const formatJobType = (jobType: string): string => {
  const typeMap: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    project_based: 'Project-based',
  };
  return typeMap[jobType] || formatEnumValue(jobType);
};

const Employees = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const itemsPerPage = 5;

  // Fetch employees from Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await employeesService.getAll();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast({
          variant: 'error',
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to load employees. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) => {
    // Text search filter
    return (
      employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatEnumValue(employee.designations)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.contact_number &&
        employee.contact_number.includes(searchQuery))
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DashboardPage
      icon={Users}
      title="Employees"
      description="Manage your team members"
    >
      <div className="space-y-4">
        {/* Search and Add Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="bg-background pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/employees/add')}
              variant="gradient"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Employee
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">Loading employees...</div>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No employees yet
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
                Get started by adding your first employee to the system.
              </p>
              <Button
                onClick={() => navigate('/employees/add')}
                variant="gradient"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Employee
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {employee.full_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatEnumValue(employee.designations)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {employee.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {employee.contact_number || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {formatJobType(employee.job_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(employee.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedEmployee({
                                  id: employee.id,
                                  name: employee.full_name,
                                });
                                setDocumentsModalOpen(true);
                              }}
                              title="View Documents"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Documents</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                // Handle edit
                                console.log('Edit employee:', employee.id);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                // Handle delete
                                console.log('Delete employee:', employee.id);
                              }}
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
                        colSpan={7}
                        className="px-6 py-8 text-center text-sm text-muted-foreground"
                      >
                        No employees found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading &&
            employees.length > 0 &&
            filteredEmployees.length > 0 &&
            totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(endIndex, filteredEmployees.length)} of{' '}
                  {filteredEmployees.length} employees
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
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
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ),
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
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
    </DashboardPage>
  );
};

export default Employees;
