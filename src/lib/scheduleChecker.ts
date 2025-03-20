import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Department, Employee, EmployeeStatus } from '@/types/employee';

export async function checkAndUpdateDepartmentStatus() {
  try {
    // Get all departments
    const departmentsSnapshot = await getDocs(collection(db, "departments"));
    const departments: Department[] = [];
    departmentsSnapshot.forEach((doc) => {
      departments.push({ id: doc.id, ...doc.data() } as Department);
    });

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Check each department's schedule
    for (const department of departments) {
      if (currentTime === department.schedule.clockIn) {
        // Get all employees in this department
        const employeesQuery = query(
          collection(db, "employees"),
          where("department", "==", department.id)
        );
        const employeesSnapshot = await getDocs(employeesQuery);
        
        // Update each employee's status
        employeesSnapshot.forEach(async (employeeDoc) => {
          const employee = employeeDoc.data() as Employee;
          const statusRef = doc(db, "status", employee.employeeId);
          
          try {
            const timestamp = Timestamp.now();
            const newStatus: Partial<EmployeeStatus> = {
              status: "Working",
              stateStartTime: timestamp,
              lastTimerUpdate: timestamp
            };
            await updateDoc(statusRef, newStatus);
          } catch (error) {
            console.error(`Error updating status for employee ${employee.employeeId}:`, error);
          }
        });
      }
    }
  } catch (error) {
    console.error("Error in schedule checker:", error);
  }
}