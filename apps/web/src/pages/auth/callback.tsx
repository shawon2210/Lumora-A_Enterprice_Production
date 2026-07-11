import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { LoadingScreen } from '@/components/loading-screen';
import { toast } from '@lumora/ui';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const error = searchParams.get('error');

    if (error || !accessToken) {
      if (error) toast({ title: 'Authentication failed', description: error, variant: 'destructive' });
      navigate('/login', { replace: true });
      return;
    }

    setAccessToken(accessToken);
    navigate('/dashboard', { replace: true });
  }, [searchParams, navigate, setAccessToken]);

  return <LoadingScreen message="Completing sign in..." />;
}
