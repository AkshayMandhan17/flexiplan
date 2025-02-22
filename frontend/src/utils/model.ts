// models.ts

export interface Hobby {
    id: number;
    name: string;
    category: string;
  }
  
  export interface User {
    id: number; // Unique identifier for each user
    username: string; // Username of the user
    email: string; // User's email address
  }
  
  export interface Task {
    id: number;
    task_name: string;
    description?: string | null;
    time_required?: string | null;  // Format: "HH:MM:SS"
    days_associated: string[];
    priority: string;
    created_at: string;  // ISO timestamp
    is_fixed_time: boolean;
    fixed_time_slot?: string | null;  // Format: "HH:MM:SS"
    user: number;
    routine?: number | null;
}

export interface TaskFormData {
  task_name: string;
  description: string | null;
  time_required: string | null;
  days_associated: string[];
  priority: string;
  is_fixed_time: boolean;
  fixed_time_slot: string | null;
}

export interface Activity {
  id?: string;
  activity: string;
  start_time: string;
  end_time: string;
  type: string;
  completed?: boolean;
}

export interface RoutineData {
  Monday?: Activity[];
  Tuesday?: Activity[];
  Wednesday?: Activity[];
  Thursday?: Activity[];
  Friday?: Activity[];
  Saturday?: Activity[];
  Sunday?: Activity[];
}

export interface UserRoutineResponse {
  routine_data: RoutineData;
}