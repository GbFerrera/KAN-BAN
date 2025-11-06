'use client';

import React, { useState, useEffect } from 'react';
import { DailyMetrics as DailyMetricsType, User } from '@/lib/types';
import { Calendar, Target, TrendingUp, Users } from 'lucide-react';

export default function DailyMetrics() {
  const [metrics, setMetrics] = useState<DailyMetricsType[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [selectedDate, selectedUserId]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ date: selectedDate });
      if (typeof selectedUserId === 'number') {
        query.set('user_id', String(selectedUserId));
      }
      const response = await fetch(`/api/metrics/daily?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const totalLeads = metrics.reduce((sum, metric) => sum + metric.leads_created, 0);
  const totalMeta = metrics.reduce((sum, metric) => sum + metric.meta_diaria, 0);
  const overallPercentage = totalMeta > 0 ? (totalLeads / totalMeta) * 100 : 0;

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPerformanceEmoji = (percentage: number) => {
    if (percentage >= 100) return '🎯';
    if (percentage >= 80) return '⚡';
    return '🔥';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">📊 Métricas Diárias</h2>
            <p className="text-sm text-gray-600">Acompanhe o desempenho da equipe</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os usuários</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-700">Total de Leads</p>
              <p className="text-2xl font-bold text-blue-900">{totalLeads}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-700">Meta Total</p>
              <p className="text-2xl font-bold text-purple-900">{totalMeta}</p>
            </div>
          </div>
        </div>
        
        <div className={`border rounded-lg p-4 ${getPerformanceColor(overallPercentage)}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getPerformanceEmoji(overallPercentage)}</span>
            <div>
              <p className="text-sm font-medium">Performance Geral</p>
              <p className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Performance Individual</h3>
        {typeof selectedUserId === 'number' && (
          <p className="text-sm text-gray-600 mb-2">Filtrando por: {users.find(u => u.id === selectedUserId)?.nome} — {selectedDate}</p>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : metrics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum dado encontrado para esta data</p>
          </div>
        ) : (
          metrics.map((metric) => (
            <div
              key={metric.user_id}
              className={`border rounded-lg p-4 ${getPerformanceColor(metric.percentage)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getPerformanceEmoji(metric.percentage)}</span>
                  <div>
                    <h4 className="font-semibold">{metric.user_name}</h4>
                    <p className="text-sm opacity-75">
                      {metric.leads_created} de {metric.meta_diaria} leads
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">{metric.percentage.toFixed(1)}%</div>
                  <div className="w-24 bg-white bg-opacity-50 rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(metric.percentage, 100)}%`,
                        backgroundColor: metric.percentage >= 100 ? '#059669' : 
                                       metric.percentage >= 80 ? '#d97706' : '#dc2626'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
