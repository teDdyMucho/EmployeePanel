import { motion } from "framer-motion";
import { AlertTriangle, Globe, Timer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Department, EmployeeStatus } from "@/types/employee";
import { formatTime } from "@/utils/formatTime";

interface StatusCardProps {
  employeeStatus: EmployeeStatus;
  clockInTimer: string;
  breakTimer: string;
  accumulatedBreakMs: number;
  currentDepartment: Department | null;
  isLate: boolean;
  lateMinutes: number;
  isOvertime: boolean;
  overtimeMinutes: number;
  onClockIn: () => void;
  onClockOut: () => void;
  onToggleBreak: (breakType: string) => void;
  onResumeWorking: () => void;
  onToggleStandby: () => void;
  getStatusColor: (status: string) => string;
  getBreakButtonState: (breakType: string) => { visible: boolean; active: boolean; disabled: boolean };
}

const formatScheduleTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export function StatusCard({
  employeeStatus,
  clockInTimer,
  breakTimer,
  accumulatedBreakMs,
  currentDepartment,
  isLate,
  lateMinutes,
  isOvertime,
  overtimeMinutes,
  onClockIn,
  onClockOut,
  onToggleBreak,
  onResumeWorking,
  onToggleStandby,
  getStatusColor,
  getBreakButtonState,
}: StatusCardProps) {
  return (
    <Card className={`${getStatusColor(employeeStatus.status)} backdrop-blur-md text-white`}>
      <CardHeader>
        <div className="flex flex-col space-y-3">
          <CardTitle>Status & Controls</CardTitle>
          {currentDepartment && (
            <CardDescription className="text-white/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-white/70" />
                  <span className="font-medium">{currentDepartment.name}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Schedule:</span>
                    <span className="font-medium">
                      {formatScheduleTime(currentDepartment.schedule.clockIn)} - {formatScheduleTime(currentDepartment.schedule.clockOut)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Grace Period:</span>
                    <span>{currentDepartment.schedule.gracePeriod} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Overtime After:</span>
                    <span>{currentDepartment.schedule.overtimeThreshold} minutes</span>
                  </div>
                </div>
              </div>
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 p-6 rounded-lg backdrop-blur-sm"
            >
              <div className="text-sm text-white/70 mb-2">Current Status</div>
              <div className="space-y-2">
                <Badge 
                  variant={
                    employeeStatus.status === "Clocked Out" ? "outline" : 
                    employeeStatus.status === "Working" ? "default" :
                    employeeStatus.status === "Standby" ? "secondary" :
                    "secondary"
                  }
                  className="text-lg py-2 px-4"
                >
                  {employeeStatus.status}
                </Badge>
                {isLate && employeeStatus.status !== "Clocked Out" && (
                  <div className="flex items-center gap-2 mt-3 bg-yellow-500/10 text-yellow-300 p-2 rounded-lg border border-yellow-500/20">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Late by {lateMinutes} minutes</span>
                  </div>
                )}
                {isOvertime && (
                  <div className="flex items-center gap-2 mt-2 bg-orange-500/10 text-orange-300 p-2 rounded-lg border border-orange-500/20">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-medium">Overtime: {overtimeMinutes} minutes</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 p-6 rounded-lg backdrop-blur-sm"
            >
              <div className="text-sm text-white/70 mb-2">Clock Timer</div>
              <div className="text-3xl font-mono">{clockInTimer}</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 p-6 rounded-lg backdrop-blur-sm"
            >
              <div className="text-sm text-white/70 mb-2">Break Timer</div>
              <div className="text-3xl font-mono">{breakTimer}</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 p-6 rounded-lg backdrop-blur-sm"
            >
              <div className="text-sm text-white/70 mb-2">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Accumulated Break
                </div>
              </div>
              <div className="text-3xl font-mono">{formatTime(accumulatedBreakMs)}</div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {employeeStatus.status === "Clocked Out" ? (
              <Button 
                onClick={onClockIn}
                className="col-span-full h-14 text-lg bg-green-500 hover:bg-green-600"
              >
                Clock In
              </Button>
            ) : (
              <>
                <Button 
                  onClick={onClockOut}
                  variant="destructive" 
                  className="col-span-full h-14 text-lg mb-3"
                >
                  Clock Out
                </Button>

                {employeeStatus.status === "Working" && (
                  <Button
                    onClick={onToggleStandby}
                    variant="outline"
                    className="col-span-full h-12 text-white border-white/30 hover:bg-white/10 mb-3"
                  >
                    Go to Standby
                  </Button>
                )}

                {employeeStatus.status === "Standby" && (
                  <Button
                    onClick={onToggleStandby}
                    variant="outline"
                    className="col-span-full h-12 bg-white/20 text-white hover:bg-white/30 mb-3"
                  >
                    Resume Working
                  </Button>
                )}

                {["Lunch", "Pee Break 1", "Pee Break 2", "Small Break"].map(breakType => {
                  const { visible, active, disabled } = getBreakButtonState(breakType);
                  if (!visible) return null;
                  return (
                    <Button
                      key={breakType}
                      onClick={() => onToggleBreak(breakType)}
                      variant={active ? "default" : "outline"}
                      disabled={disabled && !active}
                      className={`h-12 ${
                        active ? 'bg-white/20 text-white' : 'text-white border-white/30'
                      }`}
                    >
                      {active ? `End ${breakType}` : breakType}
                    </Button>
                  );
                })}

                {employeeStatus.status === "Working Idle" && (
                  <Button 
                    onClick={onResumeWorking} 
                    className="col-span-full h-12 bg-white/20 text-white hover:bg-white/30"
                  >
                    Resume Working
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}