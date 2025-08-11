// Updated data models to match backend changes

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface Transaction {
  id: number;
  senderId: number;
  recipientId: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description?: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'transaction' | 'request' | 'system';
}

export interface MoneyRequest {
  id: number;
  requesterId: number;
  recipientId: number;
  amount: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  name: string; // Backend still returns 'name' as fullName for compatibility
}

export interface UserAnalytics {
  transactions: any;
  wallet: any;
  summary: {
    totalTransactions: number;
    totalSpent: number;
    totalReceived: number;
  };
}

// Request DTOs
export interface CreateMoneyRequestDto {
  requesterId: number;
  recipientId: number;
  amount: number;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
