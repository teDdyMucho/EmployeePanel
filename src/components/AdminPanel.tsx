import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Employee, AttendanceRecord, Message, EmployeeStatus, Department } from "@/types/employee";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Activity, 
  Clock, 
  User, 
  Users, 
  LogOut,
  MessageSquare,
  Calendar
} from "lucide-react";
import AdminMessages from "@/components/AdminMessages";
import EmployeeList from "./admin/EmployeeList";
import ActiveEmployees from "./admin/ActiveEmployees";
import AttendanceRecords from "./admin/AttendanceRecords";
import DepartmentSchedule from "@/components/DepartmentSchedule";
import EmployeeDetailsDialog from "@/components/EmployeeDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { checkAndUpdateDepartmentStatus } from '@/lib/scheduleChecker';

const AdminPanel = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<EmployeeStatus[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchActiveEmployees();
    fetchMessages();
    fetchDepartments();

    const unsubscribe = onSnapshot(
      collection(db, "status"),
      (snapshot) => {
        const activeEmps: EmployeeStatus[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.employeeId && data.status) {
            activeEmps.push({
              id: doc.id,
              employeeId: data.employeeId,
              status: data.status,
              stateStartTime: data.stateStartTime || null,
              clockInTime: data.clockInTime || null
            } as EmployeeStatus);
          }
        });
        setActiveEmployees(activeEmps);

        activeEmps.forEach(emp => {
          if (emp.status !== "Working" && emp.status !== "Clocked Out") {
            toast({
              title: "Employee Status Alert",
              description: `${getEmployeeName(emp.employeeId)} is on ${emp.status}`,
              duration: 5000,
            });
          }
        });
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check schedule every minute
    const scheduleInterval = setInterval(() => {
      checkAndUpdateDepartmentStatus();
    }, 60000); // Check every minute

    // Initial check
    checkAndUpdateDepartmentStatus();

    return () => clearInterval(scheduleInterval);
  }, []);

  const fetchEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "employees"));
      const emps: Employee[] = [];
      querySnapshot.forEach((doc) => {
        emps.push({ id: doc.id, ...doc.data() } as Employee);
      });
      setEmployees(emps);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchActiveEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "status"));
      const activeEmps: EmployeeStatus[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.employeeId && data.status) {
          activeEmps.push({
            id: doc.id,
            employeeId: data.employeeId,
            status: data.status,
            stateStartTime: data.stateStartTime || null,
            clockInTime: data.clockInTime || null
          } as EmployeeStatus);
        }
      });
      setActiveEmployees(activeEmps);
    } catch (error) {
      console.error("Error fetching active employees:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "messages"));
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      msgs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "departments"));
      const deps: Department[] = [];
      querySnapshot.forEach((doc) => {
        deps.push({ id: doc.id, ...doc.data() } as Department);
      });
      setDepartments(deps);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleViewEmployeeAttendance = async (employee: Employee) => {
    try {
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("employeeId", "==", employee.employeeId)
      );
      const querySnapshot = await getDocs(attendanceQuery);
      const recentActivity: AttendanceRecord[] = [];
      querySnapshot.forEach((doc) => {
        recentActivity.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
      });
      recentActivity.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

      const attendanceSummary = recentActivity.reduce((acc: Record<string, number>, record) => {
        const type = record.eventType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      setSelectedEmployee(employee);
      setSelectedEmployeeData({
        recentActivity,
        attendanceSummary
      });
      setIsDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching employee attendance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employee attendance records",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedEmployee(null);
    setSelectedEmployeeData(null);
  };

  const getEmployeeName = (employeeId: string | undefined): string => {
    if (!employeeId) return "Unknown";
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee ? employee.name : employeeId;
  };

  const handleLogout = () => {
    localStorage.removeItem("currentEmployee");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <audio ref={audioRef} src="/buzz.wav" />
      <div className="relative min-h-screen flex flex-col">
        <header className="p-4 flex justify-between items-center bg-black/10 backdrop-blur-md">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            Admin Panel
          </motion.h1>
          
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <Link to="/employee">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <User className="w-4 h-4 mr-2" />
                  Employee Panel
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </motion.div>
          </div>
        </header>

        <main className="flex-1 p-4">
          <Tabs defaultValue="employees" className="w-full">
            <TabsList className="w-full grid grid-cols-5 gap-1 bg-black/10 p-1 rounded-lg backdrop-blur-md">
              <TabsTrigger value="employees" className="data-[state=active]:bg-white/20 text-white">
                <Users className="w-4 h-4 mr-2" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white/20 text-white">
                <Activity className="w-4 h-4 mr-2" />
                Active
              </TabsTrigger>
              <TabsTrigger value="attendance" className="data-[state=active]:bg-white/20 text-white">
                <Clock className="w-4 h-4 mr-2" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-white/20 text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-white/20 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees">
              <EmployeeList 
                employees={employees}
                departments={departments}
                onUpdate={fetchEmployees}
              />
            </TabsContent>

            <TabsContent value="active">
              <ActiveEmployees 
                activeEmployees={activeEmployees}
                employees={employees}
                departments={departments}
                onRefresh={fetchActiveEmployees}
              />
            </TabsContent>

            <TabsContent value="attendance">
              <AttendanceRecords 
                employees={employees}
                departments={departments}
                onViewAttendance={handleViewEmployeeAttendance}
                onRefresh={fetchEmployees}
              />
            </TabsContent>

            <TabsContent value="messages">
              <AdminMessages 
                messages={messages} 
                employees={employees} 
                onMessageSent={fetchMessages} 
              />
            </TabsContent>

            <TabsContent value="schedule">
              <DepartmentSchedule onUpdate={fetchDepartments} />
            </TabsContent>
          </Tabs>
        </main>

        {selectedEmployee && selectedEmployeeData && (
          <EmployeeDetailsDialog
            isOpen={isDetailsDialogOpen}
            onClose={handleCloseDialog}
            employee={selectedEmployee}
            attendanceSummary={selectedEmployeeData.attendanceSummary}
            recentActivity={selectedEmployeeData.recentActivity}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;