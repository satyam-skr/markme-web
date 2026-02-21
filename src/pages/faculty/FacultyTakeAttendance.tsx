import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Clock } from "lucide-react";

export default function FacultyTakeAttendance() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Take Attendance</h1>
          <p className="text-muted-foreground">
            Mark attendance for your classes
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Taking
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center py-8">
              Coming Soon
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Attendance taking features will be available soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}