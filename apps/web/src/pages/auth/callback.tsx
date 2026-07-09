import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { LoadingScreen } from '@/components/loading-screen';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error || !accessToken || !refreshToken) {
      navigate('/login', { replace: true });
      return;
    }

    setTokens(accessToken, refreshToken);
    navigate('/dashboard', { replace: true });
  }, [searchParams, navigate, setTokens]);

  return <LoadingScreen message="Completing sign in..." />;
}
