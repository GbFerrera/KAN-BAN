'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { Plus, Edit, Trash2, UserPlus, Crown, Briefcase } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'vendedor' as UserRole,
    meta_diaria: 5
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ativo: true
        }),
      });

      if (response.ok) {
        await fetchUsers();
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao salvar usuário');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Erro ao salvar usuário');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      role: user.role,
      meta_diaria: user.meta_diaria
    });
    setShowAddForm(true);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) return;
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        alert('Erro ao desativar usuário');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erro ao desativar usuário');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      role: 'vendedor',
      meta_diaria: 5
    });
    setEditingUser(null);
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <UserPlus className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">👥 Gerenciar Usuários</h2>
            <p className="text-sm text-gray-600">Adicione e gerencie a equipe de vendas</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Formulário */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingUser ? '✏️ Editar Usuário' : '➕ Novo Usuário'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Função
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="vendedor">👨‍💼 Vendedor</option>
                  <option value="gestor">👑 Gestor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Diária
                </label>
                <input
                  type="number"
                  value={formData.meta_diaria}
                  onChange={(e) => setFormData({ ...formData, meta_diaria: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="1"
                  placeholder="5"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                {editingUser ? '💾 Salvar Alterações' : '➕ Criar Usuário'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Usuários */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum usuário cadastrado</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${user.role === 'gestor' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                  {user.role === 'gestor' ? (
                    <Crown className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900">{user.nome}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.role === 'gestor' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'gestor' ? '👑 Gestor' : '👨‍💼 Vendedor'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Meta: {user.meta_diaria} leads/dia
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Editar usuário"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Desativar usuário"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
