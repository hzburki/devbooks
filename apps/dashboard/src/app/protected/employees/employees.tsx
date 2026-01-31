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
import { useToast, useDebounce } from '@devbooks/utils';
import { Users, UserPlus, Edit, FileText } from '@devbooks/ui';
import { formatEnumValue } from '@devbooks/utils';
import { useQuery } from '@tanstack/react-query';
import { DeleteEmployee } from './delete-employee';

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
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: response,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['employees', currentPage, debouncedSearchQuery, itemsPerPage],
    queryFn: () =>
      employeesService.getAll({
        page: currentPage,
        pageSize: itemsPerPage,
        search: debouncedSearchQuery || undefined,
      }),
  });

  useEffect(() => {
    if (error) {
      toast({
        variant: 'error',
        title: 'Something went wrong 😟',
        description: error.message,
      });
    }
  }, [error, toast]);

  const employees: Employee[] = response?.employees || [];
  const pagination = response?.pagination || null;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      render: (employee) =>
        employee.start_date
          ? new Date(employee.start_date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : '-',
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
          data={employees}
          columns={columns}
          loading={isLoading}
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
            pagination && pagination.totalPages > 1
              ? {
                  ...pagination,
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
                onClick={() => navigate(`/employees/edit/${employee.id}`)}
                title="Edit Employee"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <DeleteEmployee employee={employee} />
            </>
          )}
          getRowId={(employee) => employee.id}
        />
      </div>
    </DashboardPage>
  );
};

export default Employees;
