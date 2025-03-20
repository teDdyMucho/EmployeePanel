import { motion } from "framer-motion";
import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttendanceRecord } from "@/types/employee";
import { formatTime } from "@/utils/formatTime";

interface HistoryCardProps {
  attendanceHistory: AttendanceRecord[];
  onRefresh: () => void;
}

export function HistoryCard({
  attendanceHistory,
  onRefresh
}: HistoryCardProps) {
  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>History</CardTitle>
        <Button 
          variant="ghost" 
          onClick={onRefresh}
          className="text-white hover:bg-white/20"
        >
          <History className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {attendanceHistory.length === 0 ? (
          <p className="text-center text-white/70 py-8">No history found</p>
        ) : (
          <div className="space-y-4">
            {attendanceHistory.map(record => (
              <motion.div
                key={record.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">
                      {record.eventType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-white/70">
                      {record.timestamp.toDate().toLocaleString()}
                    </span>
                  </div>
                  
                  {record.eventType === "clockOut" && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <div className="text-sm text-white/70">Clock In</div>
                          <div>{record.clockInTime?.toDate().toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/70">Clock Out</div>
                          <div>{record.clockOutTime?.toDate().toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <div className="text-sm text-white/70">Total Time</div>
                          <div>{formatTime(record.totalClockTime || 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/70">Break Time</div>
                          <div>{formatTime(record.accumulatedBreak || 0)}</div>
                        </div>
                      </div>

                      {(record.isLate || record.isOvertime) && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {record.isLate && (
                            <div className="text-yellow-400">
                              <div className="text-sm">Late</div>
                              <div>{record.lateMinutes} minutes</div>
                            </div>
                          )}
                          {record.isOvertime && (
                            <div className="text-blue-400">
                              <div className="text-sm">Overtime</div>
                              <div>{record.overtimeMinutes} minutes</div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}