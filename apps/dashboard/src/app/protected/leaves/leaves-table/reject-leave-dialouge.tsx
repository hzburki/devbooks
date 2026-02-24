import { Dialog } from '@devbooks/ui';
import { leavesService } from '../../../../services';
import { useToast } from '@devbooks/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RejectLeaveDialogueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveId: string | null;
}

const RejectLeaveDialogue = ({
  open,
  onOpenChange,
  leaveId,
}: RejectLeaveDialogueProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rejectMutation = useMutation({
    mutationFn: (id: string) => leavesService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      onOpenChange(false);
      toast({
        variant: 'success',
        title: 'Leave Request Rejected',
        description: 'The leave request has been rejected successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to reject leave request.',
      });
    },
  });

  const handleConfirm = () => {
    if (leaveId) {
      rejectMutation.mutate(leaveId);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reject Leave Request"
      description="Are you sure you want to reject this leave request?"
      confirmText="Reject"
      cancelText="Cancel"
      confirmVariant="destructive"
      onConfirm={handleConfirm}
      isLoading={rejectMutation.isPending}
      loadingText="Rejecting..."
    />
  );
};

export default RejectLeaveDialogue;
