// src/hooks/useAuthMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login as loginAPI, register as registerAPI } from '../api/auth'; // Your API functions
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for user login mutation
 * @returns {Object} Mutation result from TanStack Query
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }) => loginAPI(email, password),

    onMutate: () => {
      toast.loading('Logging in...', { id: 'login' });
    },

    onSuccess: (data) => {
      // Assuming loginAPI returns { token, user }
      localStorage.setItem('trustra_token', data.token);
      queryClient.setQueryData(['user'], data.user);
      toast.success('Login successful!', { id: 'login' });
      navigate('/dashboard');
    },

    onError: (error) => {
      const msg = error.response?.data?.message 
        || error.message 
        || 'Login failed. Check your credentials.';
      toast.error(msg, { id: 'login' });
      console.error('Login mutation error:', error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

/**
 * Hook for user registration mutation
 * @returns {Object} Mutation result from TanStack Query
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ fullName, email, password, phone }) => 
      registerAPI(fullName, email, password, phone),

    onMutate: () => {
      toast.loading('Creating account...', { id: 'register' });
    },

    onSuccess: (data) => {
      // Assuming registerAPI returns { token, user }
      localStorage.setItem('trustra_token', data.token);
      queryClient.setQueryData(['user'], data.user);
      toast.success('Registration successful! Welcome.', { id: 'register' });
      navigate('/dashboard');
    },

    onError: (error) => {
      const msg = error.response?.data?.message 
        || error.message 
        || 'Registration failed. Please try again.';
      toast.error(msg, { id: 'register' });
      console.error('Register mutation error:', error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

/**
 * Hook for forgot password request
 * @returns {Object} Mutation result from TanStack Query
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: ({ email }) => request('/auth/forgot-password', 'POST', { email }),

    onMutate: () => {
      toast.loading('Sending reset link...', { id: 'forgot' });
    },

    onSuccess: () => {
      toast.success('Password reset link sent to your email!', { id: 'forgot' });
    },

    onError: (error) => {
      const msg = error.response?.data?.message 
        || error.message 
        || 'Failed to send reset link.';
      toast.error(msg, { id: 'forgot' });
      console.error('Forgot password error:', error);
    },
  });
};

/**
 * Hook for reset password (with token)
 * @returns {Object} Mutation result from TanStack Query
 */
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, password }) => 
      request(`/auth/reset-password/${token}`, 'POST', { password }),

    onMutate: () => {
      toast.loading('Resetting password...', { id: 'reset' });
    },

    onSuccess: () => {
      toast.success('Password reset successful! Please login.', { id: 'reset' });
      navigate('/login');
    },

    onError: (error) => {
      const msg = error.response?.data?.message 
        || error.message 
        || 'Password reset failed. Invalid or expired token.';
      toast.error(msg, { id: 'reset' });
      console.error('Reset password error:', error);
    },
  });
};
