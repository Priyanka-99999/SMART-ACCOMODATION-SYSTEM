import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      set({ user: res.data, token: res.data.token, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },
  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      set({ user: res.data, token: res.data.token, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, wishlist: [] });
  },
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
