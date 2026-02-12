import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const navigate = useNavigate();
  const { accessToken, user, setTokens, setUser, logout: clearAuth } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login(email, password);
      const { access_token, refresh_token } = response.data;
      setTokens(access_token, refresh_token);

      const meResponse = await authApi.me();
      setUser(meResponse.data.data);

      navigate('/');
    },
    [navigate, setTokens, setUser],
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  return {
    isAuthenticated: !!accessToken,
    user,
    login,
    logout,
  };
}
