import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  requireConfirmation?: boolean;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title,
  description,
  itemName,
  requireConfirmation = true
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");

  const isValid = !requireConfirmation || confirmText === "DELETE";

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setConfirmText("");
      setReason("");
    }
  };

  const handleClose = () => {
    setConfirmText("");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="font-heading text-destructive">{title}</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-foreground">
              {description}
            </p>
          </div>

          {requireConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="confirm-delete"
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={confirmText && !isValid ? "border-destructive" : ""}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="delete-reason">Reason (optional)</Label>
            <Textarea
              id="delete-reason"
              placeholder="Why is this being deleted?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={!isValid}>
              Delete Permanently
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Legacy export for backward compatibility
export function DeleteUserModal({ open, onOpenChange, userName, onConfirm }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onConfirm: () => void;
}) {
  return (
    <DeleteConfirmModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      onConfirm={onConfirm}
      title="Delete User"
      description={`You are about to permanently delete ${userName} and all associated data including their profile and attendance records.`}
      itemName={userName}
    />
  );
}
