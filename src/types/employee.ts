import { Timestamp } from 'firebase/firestore';

export interface Employee {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  employeeId: string;
  password: string;
  disabled: boolean;
  department?: string;
  basicInfo?: any;
}

export interface Department {
  id: string;
  name: string;
  timezone: string;
  schedule: {
    clockIn: string; // Format: "HH:mm"
    clockOut: string; // Format: "HH:mm"
    gracePeriod: number; // Minutes
    overtimeThreshold: number; // Minutes
  };
}

export interface EmployeeStatus {
  id?: string;
  status: string;
  stateStartTime: Timestamp | null;
  employeeId?: string;
  clockInTime?: Timestamp;
  shouldBuzz?: boolean;
  lastBuzzTime?: Timestamp;
  lastTimerUpdate?: Timestamp;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  eventType: string;
  timestamp: Timestamp;
  clockInTime?: Timestamp;
  clockOutTime?: Timestamp;
  totalClockTime?: number;
  accumulatedBreak?: number;
  isLate?: boolean;
  lateMinutes?: number;
  isOvertime?: boolean;
  overtimeMinutes?: number;
  department?: string | null;
}

export interface MessageReply {
  sender: string;
  message: string;
  timestamp: Timestamp;
}

export interface Message {
  id: string;
  sender?: string;
  message: string;
  timestamp?: Timestamp;
  recipientId?: string;
  reply?: MessageReply;
}

export interface AttendanceSummary {
  id: string;
  employeeId: string;
  date: Timestamp;
  clockInTime?: Timestamp;
  clockOutTime?: Timestamp;
  totalClockTime: number;
  accumulatedBreak: number;
  lateTime?: number;
  overtimeMinutes?: number;
  isLate: boolean;
  isOvertime: boolean;
  department?: string | null;
}

export type BreakType = "Lunch" | "Small Break" | "Pee Break 1" | "Pee Break 2";
export type WorkStatus = "Working" | "Clocked Out" | "Working Idle" | "Standby" | BreakType;