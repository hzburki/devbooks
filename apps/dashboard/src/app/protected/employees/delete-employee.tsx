import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Trash2, Dialog } from '@devbooks/ui';
import { employeesService } from '../../../services';
import type { Employee } from '../../../../../../libs/utils/src/types';
import { useToast } from '@devbooks/utils';

interface DeleteEmployeeProps {
  employee: Employee;
}

export function DeleteEmployee({ employee }: DeleteEmployeeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch employees queries
      queryClient.invalidateQueries({
        queryKey: ['employees'],
      });
      toast({
        variant: 'success',
        title: 'Employee deleted',
        description: 'The employee has been successfully deleted.',
      });
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Failed to delete employee',
        description: error.message,
      });
    },
  });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(employee.id);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={handleDeleteClick}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Employee"
        description={
          <>
            Are you sure you want to delete{' '}
            <strong>{employee.full_name}</strong>? This action cannot be undone.
          </>
        }
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        loadingText="Deleting..."
      />
    </>
  );
}
