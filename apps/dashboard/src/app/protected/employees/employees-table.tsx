import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPage } from '@devbooks/components';
import { Button } from '@devbooks/ui';
import { Input } from '@devbooks/ui';
import { Label } from '@devbooks/ui';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  FileText,
} from 'lucide-react';
import { EmployeeDocumentsModal } from './employee-documents';

// Mock employee data - replace with actual data from API/state management
const mockEmployees = [
  {
    id: 1,
    fullName: 'John Doe',
    designation: 'Software Engineer',
    email: 'john.doe@company.com',
    phone: '+92 300 1234567',
    startDate: '2023-01-15',
    type: 'Full-time',
  },
  {
    id: 2,
    fullName: 'Jane Smith',
    designation: 'Product Manager',
    email: 'jane.smith@company.com',
    phone: '+92 300 2345678',
    startDate: '2022-06-01',
    type: 'Full-time',
  },
  {
    id: 3,
    fullName: 'Ahmed Khan',
    designation: 'UI/UX Designer',
    email: 'ahmed.khan@company.com',
    phone: '+92 300 3456789',
    startDate: '2023-03-20',
    type: 'Contract',
  },
  {
    id: 4,
    fullName: 'Sarah Ali',
    designation: 'DevOps Engineer',
    email: 'sarah.ali@company.com',
    phone: '+92 300 4567890',
    startDate: '2022-11-10',
    type: 'Full-time',
  },
  {
    id: 5,
    fullName: 'Michael Brown',
    designation: 'Data Analyst',
    email: 'michael.brown@company.com',
    phone: '+92 300 5678901',
    startDate: '2023-05-05',
    type: 'Part-time',
  },
];

const Employees = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [startDateBefore, setStartDateBefore] = useState('');
  const [startDateAfter, setStartDateAfter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const itemsPerPage = 5;

  // Filter employees based on search query and date filters
  const filteredEmployees = mockEmployees.filter((employee) => {
    // Text search filter
    const matchesSearch =
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.phone.includes(searchQuery);

    // Date filters
    const employeeDate = new Date(employee.startDate);
    let matchesDateBefore = true;
    let matchesDateAfter = true;

    if (startDateBefore) {
      const beforeDate = new Date(startDateBefore);
      matchesDateBefore = employeeDate <= beforeDate;
    }

    if (startDateAfter) {
      const afterDate = new Date(startDateAfter);
      matchesDateAfter = employeeDate >= afterDate;
    }

    return matchesSearch && matchesDateBefore && matchesDateAfter;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setStartDateBefore('');
    setStartDateAfter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = startDateBefore || startDateAfter;

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
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? 'border-primary' : ''}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {[startDateBefore, startDateAfter].filter(Boolean).length}
                </span>
              )}
            </Button>
            <Button
              onClick={() => navigate('/employees/add')}
              variant="gradient"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Employee
            </Button>
          </div>
        </div>

        {/* Date Filters */}
        {showFilters && (
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Filter by Start Date</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateAfter" className="text-sm">
                  Start Date After
                </Label>
                <Input
                  id="dateAfter"
                  type="date"
                  value={startDateAfter}
                  onChange={(e) => {
                    setStartDateAfter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateBefore" className="text-sm">
                  Start Date Before
                </Label>
                <Input
                  id="dateBefore"
                  type="date"
                  value={startDateBefore}
                  onChange={(e) => {
                    setStartDateBefore(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border bg-card">
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
                        {employee.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {employee.designation}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {employee.phone}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {employee.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(employee.startDate).toLocaleDateString()}
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
                                name: employee.fullName,
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

          {/* Pagination */}
          {totalPages > 1 && (
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

      {/* Documents Modal */}
      {selectedEmployee && (
        <EmployeeDocumentsModal
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
          open={documentsModalOpen}
          onOpenChange={setDocumentsModalOpen}
        />
      )}
    </DashboardPage>
  );
};

export default Employees;
