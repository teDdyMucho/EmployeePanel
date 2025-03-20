import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Employee, AttendanceRecord } from "@/types/employee";
import { format } from "date-fns";

interface EmployeeAttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  attendanceSummary: Record<string, number>;
  attendance: AttendanceRecord[];
}

const EmployeeAttendanceDialog = ({
  isOpen,
  onClose,
  employee,
  attendanceSummary,
  attendance,
}: EmployeeAttendanceDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attendance Details - {employee.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(attendanceSummary).map(([eventType, count]) => (
              <div key={eventType} className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium capitalize">{eventType.replace(/_/g, ' ')}</div>
                <div className="text-2xl">{count}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Detailed Records</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {attendance.map((record) => (
              <div key={record.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium capitalize">
                    {record.eventType.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(record.timestamp.toDate(), 'PPpp')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAttendanceDialog;