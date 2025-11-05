'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Lead, LeadStatus, User } from '@/lib/types';
import { Filter, X, Settings, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import DroppableColumn from './DroppableColumn';
import AddLeadModal from './AddLeadModal';
import WhatsAppCampaign from './WhatsAppCampaign';

// Organize leads by status for the kanban structure
const createColumnsFromLeads = (leads: Lead[]) => {
  const columnData = {
    'lista_leads': { title: 'Lista de leads', emoji: '📌', items: [] as Lead[] },
    'primeiro_contato': { title: 'Primeiro contato', emoji: '💬', items: [] as Lead[] },
    'follow_up': { title: 'Follow-up', emoji: '⏳', items: [] as Lead[] },
    'interessados': { title: 'Interessados', emoji: '🤝', items: [] as Lead[] },
    'reuniao_agendada': { title: 'Reunião agendada', emoji: '📅', items: [] as Lead[] },
    'fechados': { title: 'Fechados', emoji: '✅', items: [] as Lead[] },
    'perdidos': { title: 'Perdidos', emoji: '❌', items: [] as Lead[] }
  };

  leads.forEach(lead => {
    if (columnData[lead.status]) {
      columnData[lead.status].items.push(lead);
    }
  });

  return columnData;
};

const Kanban = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedNicho, setSelectedNicho] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<LeadStatus>('lista_leads');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, [user]);

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

  const fetchLeads = async () => {
    try {
      const headers: HeadersInit = {};
      if (user) {
        headers['x-user-id'] = user.id.toString();
        headers['x-user-role'] = user.role;
      }
      
      const response = await fetch('/api/leads', { headers });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const leadId = active.id as number;
    const newStatus = over.id as LeadStatus;

    // Update local state immediately for better UX
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );

    // Update database
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      // Revert on error
      fetchLeads();
    }
  };

  const handleAddLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      if (response.ok) {
        const newLead = await response.json();
        setLeads(prev => [newLead, ...prev]);
      }
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const handleUpdateLead = async (id: number, updates: Partial<Lead>) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedLead = await response.json();
        setLeads(prev =>
          prev.map(lead => lead.id === id ? updatedLead : lead)
        );
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleLeadStatusUpdate = (leadId: number, newStatus: string) => {
    setLeads(prev =>
      prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: newStatus as any }
          : lead
      )
    );
  };


  const handleOpenModal = (status: LeadStatus) => {
    setModalStatus(status);
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setModalStatus(lead.status);
    setIsModalOpen(true);
  };

  const handleDeleteLead = async (leadId: number) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLeads(prev => prev.filter(lead => lead.id !== leadId));
      } else {
        console.error('Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    let filteredLeads = leads.filter(lead => lead.status === status);
    if (selectedNicho) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.nicho?.toLowerCase() === selectedNicho.toLowerCase()
      );
    }
    if (selectedUserId !== '') {
      filteredLeads = filteredLeads.filter(lead => lead.user_id === selectedUserId);
    }
    return filteredLeads;
  };

  // Extrair nichos únicos dos leads existentes
  const getUniqueNichos = () => {
    const nichos = leads
      .map(lead => lead.nicho)
      .filter(nicho => nicho && nicho.trim() !== '')
      .map(nicho => nicho!.trim());
    
    return [...new Set(nichos)].sort();
  };

  const getTotalLeads = () => leads.length;
  const getClosedLeads = () => leads.filter(lead => lead.status === 'fechados').length;
  const getLostLeads = () => leads.filter(lead => lead.status === 'perdidos').length;
  const getConversionRate = () => {
    const total = getTotalLeads();
    const closed = getClosedLeads();
    return total > 0 ? ((closed / total) * 100).toFixed(1) : '0';
  };

  const handleLeadAdded = () => {
    fetchLeads();
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const columns = [
    { id: 'lista_leads', title: 'Lista de leads', emoji: '📌' },
    { id: 'primeiro_contato', title: 'Primeiro contato', emoji: '💬' },
    { id: 'follow_up', title: 'Follow-up', emoji: '⏳' },
    { id: 'interessados', title: 'Interessados', emoji: '🤝' },
    { id: 'reuniao_agendada', title: 'Reunião agendada', emoji: '📅' },
    { id: 'fechados', title: 'Fechados', emoji: '✅' },
    { id: 'perdidos', title: 'Perdidos', emoji: '❌' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando leads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎯 Prospecção SaaS - Kanban
              </h1>
              <p className="text-gray-600">
                Gerencie seu funil de vendas de forma visual e eficiente
              </p>
              {user && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {user.nome} ({user.role === 'gestor' ? '👑 Gestor' : '👨‍💼 Vendedor'})
                    </span>
                  </div>
                  {user.role !== 'gestor' && (
                    <div className="px-3 py-1 bg-green-100 rounded-full">
                      <span className="text-sm font-medium text-green-800">
                        Meta: {user.meta_diaria} leads/dia
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              {user?.role === 'gestor' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <Settings className="w-5 h-5" />
                  Admin
                </Link>
              )}
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
              
              <button
                onClick={() => setIsCampaignOpen(true)}
                disabled={getLeadsByStatus('lista_leads').length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Campanha WhatsApp
              </button>
              
              <button
                onClick={() => handleOpenModal('lista_leads')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Novo Lead
              </button>
            </div>
          </div>
            
          {/* Statistics Cards */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-2xl font-bold">
                {selectedNicho 
                  ? Object.values(columns).reduce((total, col) => total + getLeadsByStatus(col.id as LeadStatus).length, 0)
                  : getTotalLeads()
                }
              </div>
              <div className="text-blue-100 text-sm">
                {selectedNicho ? 'Leads Filtrados' : 'Total Leads'}
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-2xl font-bold">{getLeadsByStatus('fechados').length}</div>
              <div className="text-green-100 text-sm">Fechados</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-2xl font-bold">
                {selectedNicho 
                  ? (() => {
                      const totalFiltered = Object.values(columns).reduce((total, col) => total + getLeadsByStatus(col.id as LeadStatus).length, 0);
                      return totalFiltered > 0 ? Math.round((getLeadsByStatus('fechados').length / totalFiltered) * 100) : 0;
                    })()
                  : getConversionRate()
                }%
              </div>
              <div className="text-purple-100 text-sm">Conversão</div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-2xl font-bold">{getLeadsByStatus('perdidos').length}</div>
              <div className="text-red-100 text-sm">Perdidos</div>
            </div>
          </div>
        </div>
        
        {/* Filtro por Nicho */}
        {getUniqueNichos().length > 0 && (
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filtrar por nicho:</span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedNicho(null)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedNicho === null
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  
                  {getUniqueNichos().map((nicho) => (
                    <button
                      key={nicho}
                      onClick={() => setSelectedNicho(nicho)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedNicho === nicho
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {nicho}
                    </button>
                  ))}
                </div>
                
                {selectedNicho && (
                  <button
                    onClick={() => setSelectedNicho(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Limpar filtro"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Filtro por usuário */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Filtro por usuário */}
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtrar por usuário:</span>
              </div>
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value === '' ? '' : Number(e.target.value))}
                className="px-3 py-1 rounded-full text-sm font-medium border border-gray-300"
                style={{ minWidth: 160 }}
              >
                <option value="">Todos</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
              {/* Filtro por nicho (mantém o código existente) */}
              </div>
            </div>
          </div>
        )
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-6">
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                id={column.id as LeadStatus}
                title={column.title}
                emoji={column.emoji}
                leads={getLeadsByStatus(column.id as LeadStatus)}
                onAddLead={() => handleOpenModal(column.id as LeadStatus)}
                onDeleteLead={handleDeleteLead}
                onEditLead={handleEditLead}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(null);
        }}
        onLeadAdded={handleLeadAdded}
        initialStatus={modalStatus}
        editingLead={editingLead}
      />

      {/* WhatsApp Campaign Modal */}
      <WhatsAppCampaign
        leads={getLeadsByStatus('lista_leads')}
        onClose={() => setIsCampaignOpen(false)}
        isOpen={isCampaignOpen}
        onLeadStatusUpdate={handleLeadStatusUpdate}
      />
    </div>
  );
};

export default Kanban;
