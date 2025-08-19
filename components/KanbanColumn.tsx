'use client';

import { Lead, LeadStatus } from '@/lib/types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import LeadCard from './LeadCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  id: LeadStatus;
  title: string;
  emoji: string;
  leads: Lead[];
  onUpdate: (id: number, updates: Partial<Lead>) => void;
  onDelete: (id: number) => void;
  onAddLead: (status: LeadStatus) => void;
}

export default function KanbanColumn({ 
  id, 
  title, 
  emoji, 
  leads, 
  onUpdate, 
  onDelete, 
  onAddLead 
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col h-full w-full sm:min-w-[280px] sm:max-w-[280px]">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg border-b">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h2>
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
            {leads.length}
          </span>
        </div>
        <button
          onClick={() => onAddLead(id)}
          className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-200 rounded"
          title="Adicionar lead"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 space-y-3 bg-gray-25 rounded-b-lg min-h-[400px] sm:min-h-[500px] transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : 'bg-gray-25'
        }`}
      >
        <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <div className="text-2xl mb-2">📭</div>
            <p>Nenhum lead nesta etapa</p>
            <button
              onClick={() => onAddLead(id)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Adicionar primeiro lead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
