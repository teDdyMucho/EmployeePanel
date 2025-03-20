import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/employee";
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Users, Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface EmployeeListProps {
  employees: Employee[];
  departments: { id: string; name: string }[];
  onUpdate: () => void;
}

const EmployeeList = ({ employees, departments, onUpdate }: EmployeeListProps) => {
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: "",
    employeeId: "",
    password: "",
    department: "",
    isAdmin: false,
    disabled: false
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleEmployeeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    if (selectedEmployee) {
      setSelectedEmployee(prev => ({
        ...prev!,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleDepartmentChange = (value: string) => {
    if (isEditing && selectedEmployee) {
      setSelectedEmployee(prev => ({
        ...prev!,
        department: value
      }));
    } else {
      setNewEmployee(prev => ({
        ...prev,
        department: value
      }));
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "employees"), {
        ...newEmployee,
        isAdmin: newEmployee.isAdmin || false,
        disabled: newEmployee.disabled || false,
        createdAt: Timestamp.now()
      });
      setNewEmployee({
        name: "",
        employeeId: "",
        password: "",
        department: "",
        isAdmin: false,
        disabled: false
      });
      onUpdate();
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const employeeRef = doc(db, "employees", selectedEmployee.id);
      const updateData = {
        name: selectedEmployee.name,
        employeeId: selectedEmployee.employeeId,
        password: selectedEmployee.password,
        department: selectedEmployee.department,
        isAdmin: selectedEmployee.isAdmin || false,
        disabled: selectedEmployee.disabled || false
      };
      
      await updateDoc(employeeRef, updateData);
      setIsEditing(false);
      setSelectedEmployee(null);
      onUpdate();
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      await deleteDoc(doc(db, "employees", employeeId));
      onUpdate();
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          Manage Employees
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6"
        >
          <form onSubmit={isEditing ? handleUpdateEmployee : handleCreateEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              type="text" 
              name="name" 
              placeholder="Name" 
              value={isEditing ? selectedEmployee?.name : newEmployee.name} 
              onChange={isEditing ? handleEmployeeInputChange : handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />
            <Input 
              type="text" 
              name="employeeId" 
              placeholder="Employee ID" 
              value={isEditing ? selectedEmployee?.employeeId : newEmployee.employeeId} 
              onChange={isEditing ? handleEmployeeInputChange : handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />
            <Input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={isEditing ? selectedEmployee?.password : newEmployee.password} 
              onChange={isEditing ? handleEmployeeInputChange : handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />
            <Select
              value={isEditing ? selectedEmployee?.department : newEmployee.department}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Input
                  type="checkbox"
                  name="isAdmin"
                  checked={isEditing ? selectedEmployee?.isAdmin || false : newEmployee.isAdmin}
                  onChange={isEditing ? handleEmployeeInputChange : handleInputChange}
                  className="w-4 h-4"
                />
                <span>Is Admin</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Input
                  type="checkbox"
                  name="disabled"
                  checked={isEditing ? selectedEmployee?.disabled || false : newEmployee.disabled}
                  onChange={isEditing ? handleEmployeeInputChange : handleInputChange}
                  className="w-4 h-4"
                />
                <span>Disabled</span>
              </label>
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 bg-white/20 hover:bg-white/30 text-white"
              >
                {isEditing ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Employee
                  </>
                )}
              </Button>
              {isEditing && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedEmployee(null);
                  }}
                  className="flex-1 text-white hover:bg-white/20"
                >
                  <XCircle className="w-4 h-4 mr-2" />
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
            {employees.map(employee => (
              <motion.div
                key={employee.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-white/5 rounded-lg flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-white/70">
                    {employee.employeeId}
                    {employee.department && (
                      <span className="ml-2">
                        • {departments.find(d => d.id === employee.department)?.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setIsEditing(true);
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default EmployeeList;