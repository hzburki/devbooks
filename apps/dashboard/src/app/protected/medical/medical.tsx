import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPage, DataTable, type Column } from '@devbooks/components';
import {
  Heart,
  Plus,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
} from '@devbooks/ui';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@devbooks/ui';
import { useSignOut } from '../../../lib/auth-handler';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@devbooks/utils';
import { medicalBenefitsService } from '../../../services';
import type {
  MedicalBenefitRecord,
  EmployeeLimitSummary,
} from '@devbooks/utils';
import { format } from 'date-fns';

const currentYear = new Date().getFullYear();

const medicalCategoriesLabels: Record<string, string> = {
  surgery_and_hospitalization: 'Surgery & Hospitalization',
  maternity_care: 'Maternity Care',
  dental_care: 'Dental Care',
  vision_care: 'Vision Care',
  prescription_medicine: 'Prescription Medicine',
  labs_and_medical_tests: 'Labs & Medical Tests',
  consultation: 'Consultation',
};

const beneficiariesLabels: Record<string, string> = {
  self: 'Self',
  spouse: 'Spouse',
  parents: 'Parents',
  siblings: 'Siblings',
  children: 'Children',
};

const Medical = () => {
  const handleSignOut = useSignOut();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch medical benefit records
  const {
    data: recordsResponse,
    error: recordsError,
    isLoading: isLoadingRecords,
  } = useQuery({
    queryKey: ['medical-benefit-records', currentPage, selectedYear],
    queryFn: () =>
      medicalBenefitsService.getAllRecords({
        page: currentPage,
        pageSize: itemsPerPage,
        year: selectedYear,
      }),
  });

  // Fetch employee limit summaries
  const {
    data: limitSummaries,
    error: limitsError,
    isLoading: isLoadingLimits,
  } = useQuery({
    queryKey: ['employee-medical-limits', selectedYear],
    queryFn: () =>
      medicalBenefitsService.getAllEmployeeLimitSummaries(selectedYear),
  });

  // Update payment status mutation
  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, paid }: { id: string; paid: boolean }) =>
      medicalBenefitsService.updatePaymentStatus(id, paid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-benefit-records'] });
      queryClient.invalidateQueries({ queryKey: ['employee-medical-limits'] });
      toast({
        variant: 'success',
        title: 'Payment Status Updated',
        description: 'Payment status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update payment status.',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => medicalBenefitsService.deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-benefit-records'] });
      queryClient.invalidateQueries({ queryKey: ['employee-medical-limits'] });
      toast({
        variant: 'success',
        title: 'Claim Deleted',
        description: 'Medical claim has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to delete claim.',
      });
    },
  });

  useEffect(() => {
    if (recordsError) {
      toast({
        variant: 'error',
        title: 'Error Loading Records',
        description: recordsError.message,
      });
    }
  }, [recordsError, toast]);

  useEffect(() => {
    if (limitsError) {
      toast({
        variant: 'error',
        title: 'Error Loading Limits',
        description: limitsError.message,
      });
    }
  }, [limitsError, toast]);

  const records: MedicalBenefitRecord[] =
    recordsResponse?.records || [];
  const pagination = recordsResponse?.pagination || null;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTogglePayment = (record: MedicalBenefitRecord) => {
    updatePaymentMutation.mutate({
      id: record.id,
      paid: !record.paid,
    });
  };

  const handleDelete = (record: MedicalBenefitRecord) => {
    if (
      window.confirm(
        `Are you sure you want to delete this claim for ${record.employee?.full_name || 'employee'}?`,
      )
    ) {
      deleteMutation.mutate(record.id);
    }
  };

  // Define table columns
  const columns: Column<MedicalBenefitRecord>[] = [
    {
      header: 'Employee',
      render: (record) => record.employee?.full_name || '-',
    },
    {
      header: 'Date',
      render: (record) =>
        format(new Date(record.date), 'MMM d, yyyy'),
    },
    {
      header: 'For',
      render: (record) => beneficiariesLabels[record.for] || record.for,
    },
    {
      header: 'Category',
      render: (record) =>
        medicalCategoriesLabels[record.medical_category] ||
        record.medical_category,
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (record) => (
        <div className="max-w-xs truncate" title={record.description}>
          {record.description}
        </div>
      ),
    },
    {
      header: 'Amount (PKR)',
      render: (record) => (
        <span className="font-medium">
          Rs. {record.cost_pkr.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Receipt',
      render: (record) => (
        <span className="text-sm text-muted-foreground">{record.reciept}</span>
      ),
    },
    {
      header: 'Payment Type',
      render: (record) => (
        <span className="text-sm capitalize">{record.payment_type}</span>
      ),
    },
    {
      header: 'Paid',
      render: (record) => (
        <div className="flex items-center gap-2">
          {record.paid ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
              <CheckCircle2 className="h-3 w-3" />
              Paid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
              <XCircle className="h-3 w-3" />
              Pending
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardPage
      icon={Heart}
      title="Medical Benefits"
      description="Track and manage medical benefit claims and limits"
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        {/* Year Selector and Add Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => navigate('/medical/add')} variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            Add Medical Claim
          </Button>
        </div>

        {/* Employee Limits Summary */}
        {!isLoadingLimits && limitSummaries && limitSummaries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Employee Limits Summary ({selectedYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {limitSummaries.map((summary) => (
                  <div
                    key={summary.employee_id}
                    className="rounded-lg border bg-card p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">{summary.employee_name}</h3>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Total Used
                        </div>
                        <div className="text-lg font-bold">
                          Rs. {summary.total_used.toLocaleString()} / Rs.{' '}
                          {summary.total_limit.toLocaleString()}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            summary.remaining < summary.total_limit * 0.1
                              ? 'text-destructive'
                              : summary.remaining < summary.total_limit * 0.3
                                ? 'text-warning'
                                : 'text-success'
                          }`}
                        >
                          Remaining: Rs. {summary.remaining.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {summary.category_breakdown.length > 0 && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {summary.category_breakdown.map((category) => (
                          <div
                            key={category.category}
                            className="rounded border bg-muted/50 p-2 text-sm"
                          >
                            <div className="font-medium">
                              {medicalCategoriesLabels[category.category] ||
                                category.category}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rs. {category.used.toLocaleString()} / Rs.{' '}
                              {category.limit.toLocaleString()}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">
                              Remaining: Rs.{' '}
                              {category.remaining.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Benefit Claims ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={records}
              columns={columns}
              loading={isLoadingRecords}
              loadingText="Loading medical claims..."
              noDataText="No medical claims found for this year."
              emptyState={{
                icon: Heart,
                title: 'No medical claims yet',
                description:
                  'Get started by adding your first medical benefit claim.',
                action: (
                  <Button
                    onClick={() => navigate('/medical/add')}
                    variant="gradient"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medical Claim
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
              actions={(record) => (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigate(`/medical/edit/${record.id}`)}
                    title="Edit Claim"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleTogglePayment(record)}
                    title={record.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                    disabled={updatePaymentMutation.isPending}
                  >
                    {record.paid ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {record.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(record)}
                    title="Delete Claim"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </>
              )}
              getRowId={(record) => record.id}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
};

export default Medical;
