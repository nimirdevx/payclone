import api from './api';
import { 
  User, 
  Transaction, 
  Notification, 
  MoneyRequest, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  CreateMoneyRequestDto, 
  UserAnalytics 
} from '@/types';

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  }
};

// User API
export const userApi = {
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getUserAnalytics: async (id: number): Promise<UserAnalytics> => {
    const response = await api.get(`/users/analytics/${id}`);
    return response.data;
  }
};

// Money Request API
export const requestApi = {
  createRequest: async (requestData: CreateMoneyRequestDto): Promise<MoneyRequest> => {
    const response = await api.post('/requests/create', requestData);
    return response.data;
  },

  getUserRequests: async (userId: number): Promise<MoneyRequest[]> => {
    const response = await api.get(`/requests/user/${userId}`);
    return response.data;
  },

  getIncomingRequests: async (): Promise<MoneyRequest[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    // Decode token to get user ID (simple implementation)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id || payload.sub;
    
    const response = await api.get(`/requests/user/${userId}`);
    return response.data.filter((req: MoneyRequest) => req.recipientId === userId);
  },

  getOutgoingRequests: async (): Promise<MoneyRequest[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    // Decode token to get user ID (simple implementation)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id || payload.sub;
    
    const response = await api.get(`/requests/user/${userId}`);
    return response.data.filter((req: MoneyRequest) => req.requesterId === userId);
  },

  approveRequest: async (requestId: number): Promise<MoneyRequest> => {
    const response = await api.put(`/requests/${requestId}/approve`);
    return response.data;
  },

  rejectRequest: async (requestId: number): Promise<MoneyRequest> => {
    const response = await api.put(`/requests/${requestId}/reject`);
    return response.data;
  },

  cancelRequest: async (requestId: number): Promise<MoneyRequest> => {
    const response = await api.delete(`/requests/${requestId}`);
    return response.data;
  }
};

// Notification API
export const notificationApi = {
  getUserNotifications: async (userId: number): Promise<Notification[]> => {
    const response = await api.get(`/notifications/user?id=${userId}`);
    return response.data.notifications;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  }
};

// Transaction API (existing endpoints)
export const transactionApi = {
  getUserTransactions: async (userId: number): Promise<Transaction[]> => {
    const response = await api.get(`/transactions/user/${userId}`);
    return response.data|| [];
  },

  createTransaction: async (transactionData: any): Promise<Transaction> => {
    const response = await api.post('/transactions/send', transactionData);
    return response.data;
  }
};

// Wallet API
export const walletApi = {
  getUserWallet: async (userId: number): Promise<any | null> => {
    try {
      const response = await api.get(`/wallets/user/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Wallet not found
      }
      throw error; // Re-throw other errors
    }
  },

  createWallet: async (walletData: { userId: number; balance: number; currency: string }): Promise<any> => {
    const response = await api.post('/wallets', walletData);
    return response.data;
  },

  addMoney: async (userId: number, amount: number): Promise<any> => {
    const response = await api.post('/wallets/add', { userId, amount });
    return response.data;
  }
};
