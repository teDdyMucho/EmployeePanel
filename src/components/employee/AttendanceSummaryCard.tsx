import { motion } from "framer-motion";
import { RefreshCw, Clock, AlertTriangle, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/utils/formatTime";

interface AttendanceSummaryCardProps {
  attendanceSummaries: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function AttendanceSummaryCard({
  attendanceSummaries,
  isLoading,
  onRefresh
}: AttendanceSummaryCardProps) {
  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Attendance Summary</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-white hover:bg-white/20"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {attendanceSummaries.length === 0 ? (
          <div className="text-center text-white/70 py-8 flex flex-col items-center gap-4">
            <p>No summary records found</p>
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isLoading}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Load Attendance Summary
            </Button>
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {attendanceSummaries.map(summary => (
              <motion.div
                key={summary.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/70" />
                      <span className="font-medium">
                        {new Date(summary.date.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-sm text-white/70">
                      {new Date(summary.date.seconds * 1000).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-white/70">Clock In</div>
                      <div>{summary.clockInTime?.toDate().toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/70">Clock Out</div>
                      <div>{summary.clockOutTime?.toDate().toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-white/70">Total Time</div>
                      <div className="font-mono">{formatTime(summary.totalClockTime)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/70">Break Time</div>
                      <div className="font-mono">{formatTime(summary.accumulatedBreak)}</div>
                    </div>
                  </div>

                  {(summary.isLate || summary.isOvertime) && (
                    <div className="grid grid-cols-2 gap-4">
                      {summary.isLate && (
                        <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-300 p-2 rounded-lg border border-yellow-500/20">
                          <AlertTriangle className="w-4 h-4" />
                          <div>
                            <div className="text-sm">Late</div>
                            <div>{summary.lateMinutes} minutes</div>
                          </div>
                        </div>
                      )}
                      {summary.isOvertime && (
                        <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 p-2 rounded-lg border border-blue-500/20">
                          <Timer className="w-4 h-4" />
                          <div>
                            <div className="text-sm">Overtime</div>
                            <div>{summary.overtimeMinutes} minutes</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}