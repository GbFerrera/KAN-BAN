'use client';

import React, { useState } from 'react';
import DailyMetrics from '@/components/DailyMetrics';
import UserManagement from '@/components/UserManagement';
import AuthGuard from '@/components/AuthGuard';
import { BarChart3, Users, Settings } from 'lucide-react';

type TabType = 'metrics' | 'users';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('metrics');

  const tabs = [
    {
      id: 'metrics' as TabType,
      name: 'Métricas',
      icon: BarChart3,
      description: 'Acompanhe o desempenho diário da equipe'
    },
    {
      id: 'users' as TabType,
      name: 'Usuários',
      icon: Users,
      description: 'Gerencie a equipe de vendas'
    }
  ];

  return (
    <AuthGuard requireRole="gestor">
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">🎯 Painel Administrativo</h1>
                <p className="text-sm text-gray-600">Gerencie sua equipe e acompanhe as metas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <p className="text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {activeTab === 'metrics' && <DailyMetrics />}
        {activeTab === 'users' && <UserManagement />}
      </div>
    </div>
    </AuthGuard>
  );
}
