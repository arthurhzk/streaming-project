import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@web/lib/api';
import { useAuth } from '@web/contexts/auth.context';
import type { LoginFormValues } from '@web/schemas/login.schema';
import type { RegisterFormValues } from '@web/schemas/register.schema';

function decodeUserIdFromToken(accessToken: string): string {
  try {
    const payload = accessToken.split('.')[1];
    if (!payload) return '';
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.sub ?? '';
  } catch {
    return '';
  }
}

export function useLoginMutation() {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const res = await api.post<{ accessToken: string }>('/auth/login', values);
      return res.data;
    },
    onSuccess: (data) => {
      const userId = decodeUserIdFromToken(data.accessToken);
      if (userId) {
        setAuthenticated(userId);
      }
      navigate('/dashboard');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error.response?.data?.message ?? 'Login failed. Please check your credentials.';
      toast.error(message);
    },
  });
}

export function useRegisterMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const res = await api.post('/auth/register', {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Account created successfully. Please log in.');
      navigate('/login');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message ?? 'Registration failed. Please try again.';
      toast.error(message);
    },
  });
}
