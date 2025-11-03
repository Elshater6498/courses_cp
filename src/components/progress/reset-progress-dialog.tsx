import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import { useResetProgress } from "@/hooks/use-progress";
import { toast } from "sonner";

interface ResetProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  userId: string;
  userName?: string;
  courseName?: string;
}

export function ResetProgressDialog({
  isOpen,
  onClose,
  enrollmentId,
  userId,
  userName,
  courseName,
}: ResetProgressDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const resetProgressMutation = useResetProgress();

  const handleReset = async () => {
    try {
      await resetProgressMutation.mutateAsync({
        enrollmentId,
        data: { userId },
      });
      toast.success("Progress reset successfully");
      setConfirmed(false);
      onClose();
    } catch (error) {
      toast.error("Failed to reset progress");
    }
  };

  const handleClose = () => {
    if (!resetProgressMutation.isPending) {
      setConfirmed(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-500" />
            Reset Progress
          </DialogTitle>
          <DialogDescription>
            This action will reset all progress for this user in this course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Reset all lesson completion status</li>
                <li>Clear all video watch progress</li>
                <li>Reset time spent to zero</li>
                <li>Remove course completion status</li>
                <li>Preserve enrollment data</li>
              </ul>
            </AlertDescription>
          </Alert>

          {userName && courseName && (
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <p><strong>User:</strong> {userName}</p>
              <p><strong>Course:</strong> {courseName}</p>
            </div>
          )}

          {!confirmed && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <input
                type="checkbox"
                id="confirm-reset"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="confirm-reset" className="text-sm cursor-pointer">
                I understand this action will reset all progress
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={resetProgressMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReset}
            disabled={!confirmed || resetProgressMutation.isPending}
          >
            {resetProgressMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Reset Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
