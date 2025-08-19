import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Lead, LeadStatus } from '@/lib/types';
import TaskCard from './TaskCard';

interface DroppableColumnProps {
  id: LeadStatus;
  title: string;
  emoji: string;
  leads: Lead[];
  onAddLead: (status: LeadStatus) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: number) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  id,
  title,
  emoji,
  leads,
  onAddLead,
  onEditLead,
  onDeleteLead,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const getColumnColor = (columnId: string) => {
    const colors = {
      'lista_leads': 'from-blue-500 to-blue-600',
      'primeiro_contato': 'from-yellow-500 to-yellow-600',
      'follow_up': 'from-orange-500 to-orange-600',
      'interessados': 'from-purple-500 to-purple-600',
      'reuniao_agendada': 'from-indigo-500 to-indigo-600',
      'fechados': 'from-green-500 to-green-600',
      'perdidos': 'from-red-500 to-red-600'
    };
    return colors[columnId as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] flex flex-col bg-white min-w-[320px] rounded-xl shadow-lg border border-gray-200 p-4 transition-all duration-200 ${
        isOver ? 'shadow-xl scale-105 bg-blue-50' : ''
      }`}
    >
      {/* Column Header */}
      <div className={`bg-gradient-to-r ${getColumnColor(id)} text-white px-4 py-3 rounded-lg mb-4 shadow-md`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">
            {emoji} {title}
          </span>
          <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {leads.length}
          </span>
        </div>
      </div>
      
      {/* Leads Container */}
      <div className="flex-1 space-y-3 mb-4">
        {leads.map((lead) => (
          <TaskCard 
            key={lead.id} 
            lead={lead} 
            onEdit={onEditLead}
            onDelete={onDeleteLead}
          />
        ))}
      </div>
      
      {/* Add Lead Button */}
      <button
        onClick={() => onAddLead(id)}
        className={`mt-auto p-3 text-sm font-medium text-white bg-gradient-to-r ${getColumnColor(id)} rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105`}
      >
        + Adicionar Lead
      </button>
    </div>
  );
};

export default DroppableColumn;
