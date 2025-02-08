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
  