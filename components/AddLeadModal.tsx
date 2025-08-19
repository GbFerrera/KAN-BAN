'use client';

import { useState } from 'react';
import { Lead, LeadStatus, LeadTag } from '@/lib/types';
import { X } from 'lucide-react';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => void;
  initialStatus: LeadStatus;
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

export default function AddLeadModal({ isOpen, onClose, onAdd, initialStatus }: AddLeadModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    nicho: '',
    contato: '',
    data_primeiro_contato: new Date().toISOString().split('T')[0],
    observacoes: '',
    status: initialStatus,
    tag: 'morno' as LeadTag,
    meeting_date: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    
    onAdd(formData);
    setFormData({
      nome: '',
      nicho: '',
      contato: '',
      data_primeiro_contato: new Date().toISOString().split('T')[0],
      observacoes: '',
      status: initialStatus,
      tag: 'morno',
      meeting_date: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Adicionar Novo Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Lead *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nome completo ou empresa"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nicho
            </label>
            <input
              type="text"
              value={formData.nicho}
              onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="ex: restaurante, clínica, e-commerce"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contato
            </label>
            <input
              type="text"
              value={formData.contato}
              onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="WhatsApp, Instagram, email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do 1º Contato
            </label>
            <input
              type="date"
              value={formData.data_primeiro_contato}
              onChange={(e) => setFormData({ ...formData, data_primeiro_contato: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <select
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value as LeadTag })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="quente">🔥 Quente</option>
              <option value="morno">🟡 Morno</option>
              <option value="frio">🧊 Frio</option>
            </select>
          </div>

          {formData.status === 'reuniao_agendada' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data e Hora da Reunião
              </label>
              <input
                type="datetime-local"
                value={formData.meeting_date ? new Date(formData.meeting_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              placeholder="ex: quer ver demo semana que vem, interessado em plano premium"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Adicionar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
