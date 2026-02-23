import { useMutation } from '@tanstack/react-query';
import { login as loginAPI, register as registerAPI } from '../api/auth';

export const useLogin = () => {
  return useMutation(({ email, password }) => loginAPI(email, password));
};

export const useRegister = () => {
  return useMutation(({ fullName, email, password }) => registerAPI(fullName, email, password));
};

export const useForgotPassword = () => {
  return useMutation(({ email }) => request('/auth/forgot-password', 'POST', { email }));
};

export const useResetPassword = () => {
  return useMutation(({ token, password }) => request(`/auth/reset-password/${token}`, 'POST', { password }));
};
