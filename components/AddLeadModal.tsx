'use client';

import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, LeadTag } from '@/lib/types';
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
    if (!dateString) return new Date().toISOString().split('T')[0];
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
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
    meeting_date: formatDateForInput(editingLead?.meeting_date)
  });

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
        meeting_date: formatDateForInput(editingLead.meeting_date)
      });
    } else {
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
        // Ensure meeting_date is properly formatted or null
        meeting_date: formData.meeting_date ? formData.meeting_date : null,
        // Ensure data_primeiro_contato is properly formatted
        data_primeiro_contato: formData.data_primeiro_contato || new Date().toISOString().split('T')[0]
      };
      
      console.log('Submitting data:', submitData); // Debug log
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onLeadAdded();
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
      <DialogContent className="sm:max-w-[500px]">
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <input
                type="text"
                value={formData.nicho}
                onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="ex: restaurante, clínica, e-commerce"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contato
              </label>
              <input
                type="text"
                value={formData.contato}
                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="WhatsApp, Instagram, email"
              />
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
            <div>
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
