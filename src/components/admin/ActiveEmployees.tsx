import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Employee, EmployeeStatus } from "@/types/employee";
import { doc, deleteDoc, updateDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Activity, User, Clock, Bell, Volume2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { formatTime } from "@/utils/formatTime";
import { useToast } from "@/hooks/use-toast";

interface ActiveEmployeesProps {
  activeEmployees: EmployeeStatus[];
  employees: Employee[];
  departments: { id: string; name: string }[];
  onRefresh: () => void;
}

const ActiveEmployees = ({ activeEmployees, employees, departments, onRefresh }: ActiveEmployeesProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Working":
        return "bg-green-500/10 border-green-500/30";
      case "Working Idle":
        return "bg-red-500/10 border-red-500/30";
      case "Standby":
        return "bg-purple-500/10 border-purple-500/30";
      case "Lunch":
      case "Small Break":
        return "bg-blue-500/10 border-blue-500/30";
      case "Pee Break 1":
      case "Pee Break 2":
        return "bg-red-500/10 border-red-500/30";
      default:
        return "bg-white/5 border-white/20";
    }
  };

  const getStatusTextColor = (status: string): string => {
    switch (status) {
      case "Working":
        return "text-green-400";
      case "Working Idle":
        return "text-red-400";
      case "Standby":
        return "text-purple-400";
      case "Lunch":
      case "Small Break":
        return "text-blue-400";
      case "Pee Break 1":
      case "Pee Break 2":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  const getEmployeeName = (employeeId: string | undefined): string => {
    if (!employeeId) return "Unknown";
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee ? employee.name : employeeId;
  };

  const getActiveTime = (status: EmployeeStatus): string => {
    if (!status.clockInTime) return "00:00:00";
    const now = new Date();
    const clockIn = status.clockInTime.toDate();
    return formatTime(now.getTime() - clockIn.getTime());
  };

  const forceClockOut = async (employeeId: string) => {
    try {
      await addDoc(collection(db, "attendance"), {
        employeeId,
        eventType: "force_clockOut",
        timestamp: Timestamp.now()
      });

      await deleteDoc(doc(db, "status", employeeId));

      toast({
        title: "Force Clock Out",
        description: `${getEmployeeName(employeeId)} has been forcefully clocked out`,
        duration: 3000,
      });

      onRefresh();
    } catch (error) {
      console.error("Error force clocking out:", error);
      toast({
        title: "Error",
        description: "Failed to force clock out employee",
        variant: "destructive",
      });
    }
  };

  const forceBuzz = async (employeeId: string) => {
    try {
      const statusRef = doc(db, "status", employeeId);
      await updateDoc(statusRef, {
        shouldBuzz: true,
        lastBuzzTime: Timestamp.now()
      });

      toast({
        title: "Buzz Sent",
        description: `Notification sent to ${getEmployeeName(employeeId)}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error sending buzz:", error);
      toast({
        title: "Error",
        description: "Failed to send buzz notification",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Active Employees
        </CardTitle>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="text-sm text-white/70">
            Current Time: {format(currentTime, 'h:mm:ss a')}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeEmployees.length === 0 ? (
          <p className="text-center text-white/50 py-8">No active employees</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEmployees.map((status, index) => {
              const employee = employees.find(emp => emp.employeeId === status.employeeId);
              const department = employee?.department ? 
                departments.find(d => d.id === employee.department) : null;

              return (
                <motion.div
                  key={status.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border ${getStatusColor(status.status)}`}>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className={getStatusTextColor(status.status)}>
                          {getEmployeeName(status.employeeId)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Badge 
                            variant={
                              status.status === "Working" ? "default" :
                              status.status === "Working Idle" ? "destructive" :
                              status.status === "Standby" ? "secondary" :
                              "secondary"
                            }
                            className={`capitalize ${getStatusTextColor(status.status)}`}
                          >
                            {status.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-white/70">
                            <Clock className="w-3 h-3" />
                            {getActiveTime(status)}
                          </div>
                        </div>
                        <div className="text-xs text-white/50">
                          <div>Status since: {status.stateStartTime ? format(status.stateStartTime.toDate(), 'h:mm:ss a') : 'N/A'}</div>
                          <div>Clocked in: {status.clockInTime ? format(status.clockInTime.toDate(), 'h:mm a, MMM dd') : 'N/A'}</div>
                          {department && (
                            <div>Department: {department.name}</div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => forceClockOut(status.employeeId!)}
                            className="flex-1"
                          >
                            <Bell className="w-4 h-4 mr-2" />
                            Force Clock Out
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => forceBuzz(status.employeeId!)}
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                          >
                            <Volume2 className="w-4 h-4 mr-2" />
                            Buzz
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveEmployees;