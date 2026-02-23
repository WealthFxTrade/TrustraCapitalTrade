import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword } from '../api/user';

export const useProfile = () => {
  return useQuery(['profile'], getProfile);
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation(updateProfile, {
    onSuccess: () => queryClient.invalidateQueries(['profile']),
  });
};

export const useChangePassword = () => {
  return useMutation(({ currentPassword, newPassword }) => changePassword(currentPassword, newPassword));
};
