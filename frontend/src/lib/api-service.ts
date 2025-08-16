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

// A helper function to safely extract userId from the dummy token
const getUserIdFromToken = (token: string): number | null => {
  if (token.startsWith("dummy-jwt-token-for-")) {
    try {
      return parseInt(token.replace("dummy-jwt-token-for-", ""), 10);
    } catch (e) {
      console.error("Could not parse user ID from dummy token", e);
      return null;
    }
  }
  // If a real JWT is ever used, the decoding logic would go here
  // For now, we only support the dummy token
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.sub;
  } catch (e) {
    // This will catch the 'atob' error for the dummy token and prevent the crash
    console.warn("Token is not a standard JWT. Falling back to dummy token parsing.");
    return null;
  }
};


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
  },

  changePassword: async (userId: number, data: any): Promise<any> => {
    const response = await api.put(`/users/${userId}/password`, data);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<any> => {
    const response = await api.delete(`/users/${userId}`);
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
    return response.data.requests;
  },

  getIncomingRequests: async (): Promise<MoneyRequest[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const userId = getUserIdFromToken(token);
    if (!userId) throw new Error('Invalid token format');
    
    const response = await api.get(`/requests/user/${userId}`);
    return response.data.requests.filter((req: MoneyRequest) => req.recipientId === userId);
  },

  getOutgoingRequests: async (): Promise<MoneyRequest[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const userId = getUserIdFromToken(token);
    if (!userId) throw new Error('Invalid token format');
    
    const response = await api.get(`/requests/user/${userId}`);
    return response.data.requests.filter((req: MoneyRequest) => req.requesterId === userId);
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
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    await api.put(`/notifications/user/${userId}/read-all`);
  },

  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  getUnreadCount: async (userId: number): Promise<{ unreadCount: number }> => {
    const response = await api.get(`/notifications/user/${userId}/unread-count`);
    return response.data;
  },
};

// Transaction API
export const transactionApi = {
  getUserTransactions: async (userId: number): Promise<Transaction[]> => {
    const response = await api.get(`/transactions/user/${userId}`);
    return response.data|| [];
  },

  createTransaction: async (transactionData: any): Promise<Transaction> => {
    const response = await api.post('/transactions', transactionData);
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

  createWallet: async (walletData: { userId: number }): Promise<any> => {
    const response = await api.post('/wallets', { userId: walletData.userId });
    return response.data;
  },

  addMoney: async (userId: number, amount: number): Promise<any> => {
    const response = await api.post('/wallets/add', { userId, amount });
    return response.data;
  }
};