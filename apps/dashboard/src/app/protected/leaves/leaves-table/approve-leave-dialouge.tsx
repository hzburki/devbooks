import { Dialog } from '@devbooks/ui';
import { leavesService } from '../../../../services';
import { useToast } from '@devbooks/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ApproveLeaveDialogueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveId: string | null;
}

const ApproveLeaveDialogue = ({
  open,
  onOpenChange,
  leaveId,
}: ApproveLeaveDialogueProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (id: string) => leavesService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      onOpenChange(false);
      toast({
        variant: 'success',
        title: 'Leave Request Approved',
        description: 'The leave request has been approved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to approve leave request.',
      });
    },
  });

  const handleConfirm = () => {
    if (leaveId) {
      approveMutation.mutate(leaveId);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Approve Leave Request"
      description="Are you sure you want to approve this leave request?"
      confirmText="Approve"
      cancelText="Cancel"
      confirmVariant="success"
      onConfirm={handleConfirm}
      isLoading={approveMutation.isPending}
      loadingText="Approving..."
    />
  );
};

export default ApproveLeaveDialogue;
