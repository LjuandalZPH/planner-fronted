// hooks/useLoginForm.ts
import { useState } from 'react';
import { authService } from '../services/auth'; // Ruta relativa que confirmamos con 'ls'
import { useRouter } from 'next/navigation';

export const useLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await authService.login(email, password);
      // Si llega aquí, el login fue exitoso
      router.push('/dashboard'); // Cámbialo a la ruta que quieras tras el login
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin
  };
};