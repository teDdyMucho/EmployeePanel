import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Employee, AttendanceRecord } from "@/types/employee";
import { Activity, Clock, Calculator } from "lucide-react";
import { formatTime } from "@/utils/formatTime";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo } from "react";

interface EmployeeDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  recentActivity: AttendanceRecord[];
}

const EmployeeDetailsDialog = ({
  isOpen,
  onClose,
  employee,
  recentActivity,
}: EmployeeDetailsDialogProps) => {
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  if (!employee) return null;

  // Get only clockOut records for calculations
  const clockOutRecords = recentActivity.filter(record => record.eventType === "clockOut");

  // Calculate totals for all records
  const totals = clockOutRecords.reduce((acc, record) => {
    acc.totalClockTime += record.totalClockTime || 0;
    acc.totalBreakTime += record.accumulatedBreak || 0;
    if (record.isLate) {
      acc.totalLateTime += (record.lateMinutes || 0) * 60 * 1000;
      acc.lateInstances++;
    }
    if (record.isOvertime) {
      acc.totalOvertime += (record.overtimeMinutes || 0) * 60 * 1000;
      acc.overtimeInstances++;
    }
    return acc;
  }, {
    totalClockTime: 0,
    totalBreakTime: 0,
    totalLateTime: 0,
    totalOvertime: 0,
    lateInstances: 0,
    overtimeInstances: 0
  });

  // Calculate totals for selected records
  const selectedTotals = useMemo(() => {
    return clockOutRecords.reduce((acc, record) => {
      if (selectedRecords.has(record.id)) {
        acc.totalClockTime += record.totalClockTime || 0;
        acc.totalBreakTime += record.accumulatedBreak || 0;
        if (record.isLate) {
          acc.totalLateTime += (record.lateMinutes || 0) * 60 * 1000;
          acc.lateInstances++;
        }
        if (record.isOvertime) {
          acc.totalOvertime += (record.overtimeMinutes || 0) * 60 * 1000;
          acc.overtimeInstances++;
        }
      }
      return acc;
    }, {
      totalClockTime: 0,
      totalBreakTime: 0,
      totalLateTime: 0,
      totalOvertime: 0,
      lateInstances: 0,
      overtimeInstances: 0
    });
  }, [selectedRecords, clockOutRecords]);

  const handleRecordSelect = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === clockOutRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(clockOutRecords.map(r => r.id)));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {employee.name} - Attendance Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="summary" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Attendance Summary</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-400">Overall Summary</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Total Clock Time:</span>
                        <span className="font-semibold">{formatTime(totals.totalClockTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Total Break Time:</span>
                        <span className="font-semibold">{formatTime(totals.totalBreakTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Late Instances:</span>
                        <span className="font-semibold">{totals.lateInstances}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Overtime Instances:</span>
                        <span className="font-semibold">{totals.overtimeInstances}</span>
                      </div>
                    </div>
                  </div>

                  {selectedRecords.size > 0 && (
                    <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-green-400">Selected Records</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Clock Time:</span>
                          <span className="font-semibold">{formatTime(selectedTotals.totalClockTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Break Time:</span>
                          <span className="font-semibold">{formatTime(selectedTotals.totalBreakTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Late Instances:</span>
                          <span className="font-semibold">{selectedTotals.lateInstances}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Overtime Instances:</span>
                          <span className="font-semibold">{selectedTotals.overtimeInstances}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    checked={selectedRecords.size === clockOutRecords.length && clockOutRecords.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border-white/20"
                  />
                  <span className="text-sm text-white/70">Select All Records ({clockOutRecords.length})</span>
                </div>

                <div className="space-y-3">
                  {clockOutRecords.map((record) => (
                    <div
                      key={record.id}
                      className="bg-zinc-900 rounded-lg p-4 text-white"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Checkbox
                          checked={selectedRecords.has(record.id)}
                          onCheckedChange={() => handleRecordSelect(record.id)}
                          className="border-white/20"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="text-lg font-medium">
                            {format(record.timestamp.toDate(), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex gap-2">
                            {record.isLate && (
                              <Badge variant="destructive" className="text-xs">
                                Late ({record.lateMinutes} mins)
                              </Badge>
                            )}
                            {record.isOvertime && (
                              <Badge variant="secondary" className="text-xs">
                                Overtime ({record.overtimeMinutes} mins)
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-zinc-400">Clock In</div>
                          <div>{format(record.clockInTime?.toDate() || record.timestamp.toDate(), 'h:mm:ss a')}</div>
                        </div>
                        <div>
                          <div className="text-sm text-zinc-400">Clock Out</div>
                          <div>{format(record.clockOutTime?.toDate() || record.timestamp.toDate(), 'h:mm:ss a')}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <div className="text-sm text-zinc-400">Total Time</div>
                          <div className="font-mono">{formatTime(record.totalClockTime || 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-zinc-400">Break Time</div>
                          <div className="font-mono">{formatTime(record.accumulatedBreak || 0)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentActivity.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between border-b border-white/10 pb-4"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-white/70" />
                        <div>
                          <div className="font-medium capitalize">
                            {record.eventType.replace(/_/g, ' ')}
                            {record.isLate && (
                              <span className="ml-2 text-red-400 text-sm">
                                (Late: {record.lateMinutes} mins)
                              </span>
                            )}
                            {record.isOvertime && (
                              <span className="ml-2 text-blue-400 text-sm">
                                (Overtime: {record.overtimeMinutes} mins)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-white/50">
                            {format(record.timestamp.toDate(), 'PPpp')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsDialog;