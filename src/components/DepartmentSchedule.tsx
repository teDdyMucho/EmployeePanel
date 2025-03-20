import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Department } from "@/types/employee";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Clock, Plus, Edit2, Trash2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DepartmentScheduleProps {
  onUpdate: () => void;
}

const DepartmentSchedule = ({ onUpdate }: DepartmentScheduleProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: "",
    timezone: "UTC",
    schedule: {
      clockIn: "09:00",
      clockOut: "18:00",
      gracePeriod: 15,
      overtimeThreshold: 30
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const { toast } = useToast();

  const timezones = [
    "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "Asia/Tokyo", "Asia/Shanghai", "Europe/London", "Europe/Paris", "Australia/Sydney"
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

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
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    subField?: string
  ) => {
    const value = e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
    
    if (isEditing && selectedDepartment) {
      setSelectedDepartment(prev => ({
        ...prev!,
        [field]: subField 
          ? { ...prev![field as keyof Department], [subField]: value }
          : value
      }));
    } else {
      setNewDepartment(prev => ({
        ...prev,
        [field]: subField 
          ? { ...prev[field as keyof Partial<Department>], [subField]: value }
          : value
      }));
    }
  };

  const handleScheduleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Department["schedule"]
  ) => {
    const value = field === "gracePeriod" || field === "overtimeThreshold"
      ? parseInt(e.target.value)
      : e.target.value;

    if (isEditing && selectedDepartment) {
      setSelectedDepartment(prev => ({
        ...prev!,
        schedule: {
          ...prev!.schedule,
          [field]: value
        }
      }));
    } else {
      setNewDepartment(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule!,
          [field]: value
        }
      }));
    }
  };

  const handleTimezoneChange = (value: string) => {
    if (isEditing && selectedDepartment) {
      setSelectedDepartment(prev => ({
        ...prev!,
        timezone: value
      }));
    } else {
      setNewDepartment(prev => ({
        ...prev,
        timezone: value
      }));
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "departments"), newDepartment);
      setNewDepartment({
        name: "",
        timezone: "UTC",
        schedule: {
          clockIn: "09:00",
          clockOut: "18:00",
          gracePeriod: 15,
          overtimeThreshold: 30
        }
      });
      fetchDepartments();
      onUpdate();
      toast({
        title: "Success",
        description: "Department created successfully",
      });
    } catch (error) {
      console.error("Error creating department:", error);
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    try {
      const departmentRef = doc(db, "departments", selectedDepartment.id);
      await updateDoc(departmentRef, {
        name: selectedDepartment.name,
        timezone: selectedDepartment.timezone,
        schedule: selectedDepartment.schedule
      });
      setIsEditing(false);
      fetchDepartments();
      onUpdate();
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    } catch (error) {
      console.error("Error updating department:", error);
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      await deleteDoc(doc(db, "departments", departmentId));
      fetchDepartments();
      onUpdate();
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting department:", error);
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Department Schedules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6"
        >
          <form onSubmit={isEditing ? handleUpdateDepartment : handleCreateDepartment} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                type="text" 
                placeholder="Department Name" 
                value={isEditing ? selectedDepartment?.name : newDepartment.name}
                onChange={(e) => handleInputChange(e, "name")}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
              
              <Select
                value={isEditing ? selectedDepartment?.timezone : newDepartment.timezone}
                onValueChange={handleTimezoneChange}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Clock In Time</label>
                <Input 
                  type="time" 
                  value={isEditing ? selectedDepartment?.schedule.clockIn : newDepartment.schedule?.clockIn}
                  onChange={(e) => handleScheduleChange(e, "clockIn")}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70">Clock Out Time</label>
                <Input 
                  type="time" 
                  value={isEditing ? selectedDepartment?.schedule.clockOut : newDepartment.schedule?.clockOut}
                  onChange={(e) => handleScheduleChange(e, "clockOut")}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70">Grace Period (minutes)</label>
                <Input 
                  type="number" 
                  min="0"
                  value={isEditing ? selectedDepartment?.schedule.gracePeriod : newDepartment.schedule?.gracePeriod}
                  onChange={(e) => handleScheduleChange(e, "gracePeriod")}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70">Overtime Threshold (minutes)</label>
                <Input 
                  type="number" 
                  min="0"
                  value={isEditing ? selectedDepartment?.schedule.overtimeThreshold : newDepartment.schedule?.overtimeThreshold}
                  onChange={(e) => handleScheduleChange(e, "overtimeThreshold")}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                {isEditing ? (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Update Department
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Department
                  </>
                )}
              </Button>
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedDepartment(null);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>

          <motion.div 
            className="grid gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {departments.map(department => (
              <motion.div
                key={department.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-white/5 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-lg">{department.name}</div>
                    <div className="text-sm text-white/70 flex items-center gap-2 mt-1">
                      <Globe className="w-4 h-4" />
                      {department.timezone}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-sm text-white/70">Schedule</div>
                        <div className="text-white">
                          {department.schedule.clockIn} - {department.schedule.clockOut}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/70">Grace Period</div>
                        <div className="text-white">{department.schedule.gracePeriod} minutes</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedDepartment(department);
                        setIsEditing(true);
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default DepartmentSchedule;