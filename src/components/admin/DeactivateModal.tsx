import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DeactivateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onConfirm: (status: "VIEW_ONLY" | "DISABLED") => void;
}

export function DeactivateModal({ open, onOpenChange, userName, onConfirm }: DeactivateModalProps) {
  const [status, setStatus] = useState<"VIEW_ONLY" | "DISABLED">("VIEW_ONLY");

  const handleConfirm = () => {
    onConfirm(status);
    setStatus("VIEW_ONLY");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="font-heading">Deactivate Account</DialogTitle>
              <DialogDescription>Choose how to restrict {userName}'s account</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <RadioGroup value={status} onValueChange={(v) => setStatus(v as "VIEW_ONLY" | "DISABLED")}>
            <div className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="VIEW_ONLY" id="view-only" className="mt-0.5" />
              <Label htmlFor="view-only" className="cursor-pointer flex-1">
                <p className="font-medium text-foreground">View Only</p>
                <p className="text-sm text-muted-foreground">
                  User can log in and view data but cannot perform any actions or make changes.
                </p>
              </Label>
            </div>
            <div className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="DISABLED" id="disabled" className="mt-0.5" />
              <Label htmlFor="disabled" className="cursor-pointer flex-1">
                <p className="font-medium text-foreground">Fully Deactivate</p>
                <p className="text-sm text-muted-foreground">
                  User cannot log in at all. Their data will be preserved but inaccessible.
                </p>
              </Label>
            </div>
          </RadioGroup>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
