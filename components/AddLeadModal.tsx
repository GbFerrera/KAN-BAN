'use client';

import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, LeadTag, User } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: () => void;
  initialStatus: LeadStatus;
  editingLead?: Lead | null;
}

const statusLabels = {
  lista_leads: 'Lista de leads',
  primeiro_contato: 'Primeiro contato',
  follow_up: 'Follow-up',
  interessados: 'Interessados',
  reuniao_agendada: 'Reunião agendada',
  fechados: 'Fechados',
  perdidos: 'Perdidos'
};

export default function AddLeadModal({ isOpen, onClose, onLeadAdded, initialStatus, editingLead }: AddLeadModalProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [availableNichos, setAvailableNichos] = useState<string[]>([]);
  const [showCustomNicho, setShowCustomNicho] = useState(false);
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // Format for datetime-local input
    } catch {
      return '';
    }
  };

  const formatDateOnly = (dateString: string | null | undefined) => {
    if (!dateString) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    try {
      const date = new Date(dateString + 'T00:00:00');
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  const [formData, setFormData] = useState({
    nome: editingLead?.nome || '',
    nicho: editingLead?.nicho || '',
    contato: editingLead?.contato || '',
    data_primeiro_contato: formatDateOnly(editingLead?.data_primeiro_contato),
    observacoes: editingLead?.observacoes || '',
    status: editingLead?.status || initialStatus,
    tag: (editingLead?.tag as LeadTag) || 'morno',
    meeting_date: formatDateForInput(editingLead?.meeting_date),
    // Sempre atribuir o usuário atual como criador do lead; evitar null no select
    user_id: editingLead?.user_id ?? (currentUser?.id ?? '')
  });

  // Nichos predefinidos
  const predefinedNichos = [
    'Restaurante', 'Clínica', 'E-commerce', 'Consultoria', 'Tecnologia',
    'Educação', 'Imobiliária', 'Beleza', 'Fitness', 'Advocacia',
    'Contabilidade', 'Marketing', 'Arquitetura', 'Odontologia', 'Veterinária'
  ];

  // Load users and existing nichos on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchExistingNichos = async () => {
      try {
        const response = await fetch('/api/leads/nichos');
        if (response.ok) {
          const existingNichos = await response.json();
          // Combinar nichos predefinidos com os existentes, removendo duplicatas
          const allNichos = [...new Set([...predefinedNichos, ...existingNichos])];
          setAvailableNichos(allNichos.sort());
        } else {
          // Se a API não existir ainda, usar apenas os predefinidos
          setAvailableNichos(predefinedNichos);
        }
      } catch (error) {
        console.error('Error fetching existing nichos:', error);
        setAvailableNichos(predefinedNichos);
      }
    };
    
    if (isOpen) {
      fetchUsers();
      fetchExistingNichos();
    }
  }, [isOpen]);

  // Update form when editingLead changes
  useEffect(() => {
    if (editingLead) {
      setFormData({
        nome: editingLead.nome,
        nicho: editingLead.nicho || '',
        contato: editingLead.contato || '',
        data_primeiro_contato: formatDateOnly(editingLead.data_primeiro_contato),
        observacoes: editingLead.observacoes || '',
        status: editingLead.status,
        tag: editingLead.tag as LeadTag,
        meeting_date: formatDateForInput(editingLead.meeting_date),
        user_id: editingLead.user_id ?? ''
      });
    } else {
      setFormData({
        nome: '',
        nicho: '',
        contato: '',
        data_primeiro_contato: (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })(),
        observacoes: '',
        status: initialStatus,
        tag: 'morno',
        meeting_date: '',
        // Em criação, sempre usar o ID do usuário atual; evitar null para o select
        user_id: currentUser?.id ?? ''
      });
    }
  }, [editingLead, initialStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    
    try {
      const url = editingLead ? `/api/leads/${editingLead.id}` : '/api/leads';
      const method = editingLead ? 'PUT' : 'POST';
      
      // Clean up the data before sending
      const submitData = {
        ...formData,
        // Garantir que o user_id enviado ao backend seja numérico ou null
        user_id: typeof formData.user_id === 'number' 
          ? formData.user_id 
          : (currentUser?.id ?? null),
        // Garantir que meeting_date seja corretamente formatado ou nulo
        meeting_date: formData.meeting_date ? formData.meeting_date : null,
        // Garantir que data_primeiro_contato esteja corretamente formatada
        data_primeiro_contato: formData.data_primeiro_contato || (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })()
      };
      
      console.log('Submitting data:', submitData); // Debug log
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onLeadAdded();
        
        // Clear form data after successful creation (only for new leads, not edits)
        if (!editingLead) {
          setFormData({
            nome: '',
            nicho: '',
            contato: '',
            data_primeiro_contato: (() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            })(),
            observacoes: '',
            status: initialStatus,
            tag: 'morno',
            meeting_date: '',
            user_id: currentUser?.id ?? ''
          });
        }
      } else {
        const errorData = await response.text();
        console.error('Failed to save lead:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {editingLead ? '✏️ Editar Lead' : '✨ Adicionar Novo Lead'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {editingLead 
              ? 'Edite as informações do lead selecionado.'
              : 'Preencha as informações do novo lead para adicionar ao funil de vendas.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do Lead *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Nome completo ou empresa"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nicho
              </label>
              {!showCustomNicho ? (
                <div className="space-y-2">
                  <select
                    value={formData.nicho}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomNicho(true);
                        setFormData({ ...formData, nicho: '' });
                      } else {
                        setFormData({ ...formData, nicho: e.target.value });
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Selecione um nicho</option>
                    {availableNichos.map((nicho) => (
                      <option key={nicho} value={nicho}>
                        {nicho}
                      </option>
                    ))}
                    <option value="custom">✏️ Outro (personalizado)</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.nicho}
                    onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Digite o nicho personalizado"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomNicho(false);
                      setFormData({ ...formData, nicho: '' });
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    ← Voltar para lista predefinida
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contato
              </label>
              <select
                value={formData.contato}
                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Selecione o meio de contato</option>
                <option value="WhatsApp">📱 WhatsApp</option>
                <option value="Instagram">📸 Instagram</option>
                <option value="Email">📧 Email</option>
                <option value="Facebook">📘 Facebook</option>
                <option value="LinkedIn">💼 LinkedIn</option>
                <option value="Telefone">☎️ Telefone</option>
                <option value="Site">🌐 Site</option>
                <option value="Indicação">🤝 Indicação</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data do 1º Contato
              </label>
              <input
                type="date"
                value={formData.data_primeiro_contato}
                onChange={(e) => setFormData({ ...formData, data_primeiro_contato: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentUser?.role === 'gestor' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Responsável
                </label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Selecione o responsável</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nome} ({user.role === 'gestor' ? '👑 Gestor' : '👨‍💼 Vendedor'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={currentUser?.role === 'gestor' ? '' : 'md:col-span-2'}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🌡️ Prioridade
              </label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value as LeadTag })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="quente">🔥 Quente</option>
                <option value="morno">🟡 Morno</option>
                <option value="frio">🧊 Frio</option>
              </select>
            </div>
          </div>

          {formData.status === 'reuniao_agendada' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Data e Hora da Reunião
              </label>
              <input
                type="datetime-local"
                value={formData.meeting_date}
                onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              rows={3}
              placeholder="ex: quer ver demo semana que vem, interessado em plano premium"
            />
          </div>

          <DialogFooter className="gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {editingLead ? '💾 Salvar Alterações' : '✨ Adicionar Lead'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
