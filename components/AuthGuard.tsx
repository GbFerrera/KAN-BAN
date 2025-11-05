'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import LoginForm from './LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'gestor' | 'vendedor';
}

export default function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (requireRole && user.role !== requireRole && user.role !== 'gestor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500">
            Necessário: {requireRole === 'gestor' ? 'Gestor' : 'Vendedor'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
