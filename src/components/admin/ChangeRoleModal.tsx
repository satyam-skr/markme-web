import { useState } from "react";
import { Shield } from "lucide-react";
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

interface ChangeRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentRole: "STUDENT" | "FACULTY" | "ADMIN";
  onConfirm: (newRole: "STUDENT" | "FACULTY" | "ADMIN") => void;
}

export function ChangeRoleModal({ open, onOpenChange, userName, currentRole, onConfirm }: ChangeRoleModalProps) {
  const [newRole, setNewRole] = useState<"STUDENT" | "FACULTY" | "ADMIN">(currentRole);

  const handleConfirm = () => {
    if (newRole !== currentRole) {
      onConfirm(newRole);
    }
    onOpenChange(false);
    setNewRole(currentRole);
  };

  const availableRoles = ["STUDENT", "FACULTY", "ADMIN"].filter(role => role !== currentRole);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="font-heading">Change User Role</DialogTitle>
              <DialogDescription>
                This will delete the current profile and change {userName}'s role
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-foreground">
              <strong>Warning:</strong> Changing roles will permanently delete the user's current profile data ({currentRole.toLowerCase()} profile) and require creating a new profile for the selected role.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Select new role for {userName}:</Label>
            <RadioGroup value={newRole} onValueChange={(v) => setNewRole(v as any)}>
              {availableRoles.map((role) => (
                <div key={role} className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={role} id={role} />
                  <Label htmlFor={role} className="cursor-pointer flex-1">
                    <p className="font-medium text-foreground">{role}</p>
                    <p className="text-sm text-muted-foreground">
                      {role === "STUDENT" && "Access to view profile and attendance"}
                      {role === "FACULTY" && "Access to manage courses and mark attendance"}
                      {role === "ADMIN" && "Full system access and user management"}
                    </p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleConfirm}
              disabled={newRole === currentRole}
            >
              Change Role
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}