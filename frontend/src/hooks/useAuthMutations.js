// src/hooks/useAuthMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login as loginAPI, register as registerAPI } from '../api/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for user login mutation
 * Handles login API call, token storage, user state update, and navigation
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
      // data should contain { user, token } from backend
      if (data.token) {
        // localStorage is kept for backward compatibility
        // but main auth now uses httpOnly cookie from backend
        localStorage.setItem('trustra_token', data.token);
      }

      queryClient.setQueryData(['user'], data.user);
      toast.success('Login successful!', { id: 'login' });
      navigate('/dashboard', { replace: true });
    },

    onError: (error) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials and try again.';

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
 * Handles registration API call, token storage, user state update, and navigation
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
      // data should contain { user, token } from backend
      if (data.token) {
        localStorage.setItem('trustra_token', data.token);
      }

      queryClient.setQueryData(['user'], data.user);
      toast.success('Registration successful! Welcome.', { id: 'register' });
      navigate('/dashboard', { replace: true });
    },

    onError: (error) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please check your details and try again.';

      toast.error(msg, { id: 'register' });
      console.error('Register mutation error:', error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

/**
 * Hook for forgot password request (sends OTP email)
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
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to send reset link. Please check the email address.';

      toast.error(msg, { id: 'forgot' });
      console.error('Forgot password error:', error);
    },
  });
};

/**
 * Hook for reset password using OTP
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
      navigate('/login', { replace: true });
    },

    onError: (error) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Password reset failed. Invalid or expired token.';

      toast.error(msg, { id: 'reset' });
      console.error('Reset password error:', error);
    },
  });
};
