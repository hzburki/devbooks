import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DashboardPage,
  TableSearchBar,
  DataTable,
  type Column,
} from '@devbooks/components';
import { Button } from '@devbooks/ui';
import { employeesService, type Employee } from '../../../services';
import { useToast } from '@devbooks/utils';
import { Users, UserPlus, Edit, Trash2, FileText } from '@devbooks/ui';
import { formatEnumValue } from '@devbooks/utils';

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
  // TODO: Move this filtering to backend when implementing backend pagination
  const filteredEmployees = employees.filter((employee) => {
    // Text search filter
    return (
      employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatEnumValue(employee.designations)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.contact_number && employee.contact_number.includes(searchQuery))
    );
  });

  // Calculate pagination (temporary frontend pagination)
  // TODO: Replace with backend pagination data from Supabase
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // TODO: Fetch new page data from backend when implementing backend pagination
  };

  // Define table columns
  const columns: Column<Employee>[] = [
    {
      header: 'Full Name',
      accessor: 'full_name',
    },
    {
      header: 'Designation',
      render: (employee) => formatEnumValue(employee.designations),
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Phone',
      render: (employee) => employee.contact_number || '-',
    },
    {
      header: 'Type',
      render: (employee) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {formatJobType(employee.job_type)}
        </span>
      ),
    },
    {
      header: 'Start Date',
      render: (employee) => new Date(employee.start_date).toLocaleDateString(),
    },
  ];

  return (
    <DashboardPage
      icon={Users}
      title="Employees"
      description="Manage your team members"
    >
      <div className="space-y-4">
        {/* Search and Add Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TableSearchBar
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
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
        <DataTable
          data={paginatedEmployees}
          columns={columns}
          loading={loading}
          loadingText="Loading employees..."
          noDataText="No employees found matching your search."
          emptyState={{
            icon: Users,
            title: 'No employees yet',
            description:
              'Get started by adding your first employee to the system.',
            action: (
              <Button
                onClick={() => navigate('/employees/add')}
                variant="gradient"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Employee
              </Button>
            ),
          }}
          pagination={
            filteredEmployees.length > 0 && totalPages > 1
              ? {
                  currentPage,
                  totalPages,
                  totalCount: filteredEmployees.length,
                  pageSize: itemsPerPage,
                  onPageChange: handlePageChange,
                }
              : undefined
          }
          actions={(employee) => (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => null}
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
                className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  // Handle delete
                  console.log('Delete employee:', employee.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </>
          )}
          getRowId={(employee) => employee.id}
        />
      </div>
    </DashboardPage>
  );
};

export default Employees;
