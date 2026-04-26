import { create } from 'zustand';
import api from '../services/api';

const getSafeUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getSafeUser(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  login: async (email, password, selectedRole) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.role !== selectedRole) {
        set({ 
          error: `Invalid email or password.`, 
          loading: false 
        });
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      set({ user: res.data, token: res.data.token, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false });
      throw error;
    }
  },
  register: async (name, email, password, role, phone) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role, phone });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      set({ user: res.data, token: res.data.token, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', loading: false });
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, wishlist: [], error: null });
  },
  clearError: () => set({ error: null }),
  wishlist: [],
  fetchWishlist: async () => {
    try {
      const res = await api.get('/users/wishlist');
      set({ wishlist: res.data.map(p => p._id ? p._id : p) });
    } catch (err) {
      console.error(err);
    }
  },
  toggleWishlist: async (propertyId) => {
    try {
      const res = await api.post(`/users/wishlist/${propertyId}`);
      set({ wishlist: res.data });
    } catch (err) {
      console.error(err);
    }
  }
}));

export default useAuthStore;
