// models.ts

export interface Hobby {
    id: string;
    name: string;
    category: string;
  }
  
  export interface User {
    id: string; // Unique identifier for each user
    username: string; // Username of the user
    email: string; // User's email address
  }
  