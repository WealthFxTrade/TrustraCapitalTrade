import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login as loginAPI, register as registerAPI } from '../api/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }) => loginAPI(email, password),

    onMutate: () => {
      toast.loading('Logging in...', { id: 'login' });
    },

    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem('trustra_token', data.token);
      }

      if (data?.user) {
        queryClient.setQueryData(['user'], data.user);
      }

      toast.success('Login successful!', { id: 'login' });
      navigate('/dashboard', { replace: true });

      // Optional: Refresh user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },

    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed. Please try again.';

      toast.error(errorMessage, { id: 'login' });
      console.error('Login error:', error);
    },
  });
};

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
      if (data?.token) {
        localStorage.setItem('trustra_token', data.token);
      }

      if (data?.user) {
        queryClient.setQueryData(['user'], data.user);
      }

      toast.success('Registration successful!', { id: 'register' });
      navigate('/dashboard', { replace: true });

      queryClient.invalidateQueries({ queryKey: ['user'] });
    },

    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed. Please try again.';

      toast.error(errorMessage, { id: 'register' });
      console.error('Registration error:', error);
    },
  });
};
