'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Lead, LeadStatus, KanbanColumn as KanbanColumnType } from '@/lib/types';
import KanbanColumn from './KanbanColumn';
import AddLeadModal from './AddLeadModal';

const columns: Omit<KanbanColumnType, 'leads'>[] = [
  { id: 'lista_leads', title: 'Lista de leads', emoji: '📌' },
  { id: 'primeiro_contato', title: 'Primeiro contato', emoji: '💬' },
  { id: 'follow_up', title: 'Follow-up', emoji: '⏳' },
  { id: 'interessados', title: 'Interessados', emoji: '🤝' },
  { id: 'reuniao_agendada', title: 'Reunião agendada', emoji: '📅' },
  { id: 'fechados', title: 'Fechados', emoji: '✅' },
  { id: 'perdidos', title: 'Perdidos', emoji: '❌' }
];

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<LeadStatus>('lista_leads');
  const [activeTab, setActiveTab] = useState<LeadStatus>('lista_leads');
  const [isMobile, setIsMobile] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchLeads();
    
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
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

  const handleDeleteLead = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLeads(prev => prev.filter(lead => lead.id !== id));
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleOpenModal = (status: LeadStatus) => {
    setModalStatus(status);
    setIsModalOpen(true);
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  };

  const getTotalLeads = () => leads.length;
  const getClosedLeads = () => leads.filter(lead => lead.status === 'fechados').length;
  const getConversionRate = () => {
    const total = getTotalLeads();
    const closed = getClosedLeads();
    return total > 0 ? ((closed / total) * 100).toFixed(1) : '0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                🎯 Prospecção SaaS - Kanban
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Gerencie seu funil de vendas de forma visual e eficiente
              </p>
            </div>
            <div className="flex gap-4 sm:gap-6 text-sm w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{getTotalLeads()}</div>
                <div className="text-gray-600 text-xs sm:text-sm">Total Leads</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{getClosedLeads()}</div>
                <div className="text-gray-600 text-xs sm:text-sm">Fechados</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{getConversionRate()}%</div>
                <div className="text-gray-600 text-xs sm:text-sm">Conversão</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      {isMobile && (
        <div className="bg-white border-b overflow-x-auto">
          <div className="flex min-w-max">
            {columns.map((column) => (
              <button
                key={column.id}
                onClick={() => setActiveTab(column.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === column.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{column.emoji}</span>
                {column.title}
                <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {getLeadsByStatus(column.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="p-4 sm:p-6">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {isMobile ? (
            // Mobile: Single Column View with Tabs
            <div className="w-full">
              {columns
                .filter(column => column.id === activeTab)
                .map((column) => (
                  <div key={column.id} className="w-full">
                    <KanbanColumn
                      id={column.id}
                      title={column.title}
                      emoji={column.emoji}
                      leads={getLeadsByStatus(column.id)}
                      onUpdate={handleUpdateLead}
                      onDelete={handleDeleteLead}
                      onAddLead={handleOpenModal}
                    />
                  </div>
                ))}
            </div>
          ) : (
            // Desktop: Full Kanban Board
            <div className="flex gap-4 overflow-x-auto pb-4">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  emoji={column.emoji}
                  leads={getLeadsByStatus(column.id)}
                  onUpdate={handleUpdateLead}
                  onDelete={handleDeleteLead}
                  onAddLead={handleOpenModal}
                />
              ))}
            </div>
          )}
        </DndContext>
      </div>

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddLead}
        initialStatus={modalStatus}
      />
    </div>
  );
}
