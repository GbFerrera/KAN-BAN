import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Lead } from '@/lib/types';
import { Edit, Trash2, Calendar, Clock } from 'lucide-react';

interface TaskCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ lead, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lead.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'quente':
        return 'bg-red-100 text-red-800';
      case 'morno':
        return 'bg-yellow-100 text-yellow-800';
      case 'frio':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={`relative group flex flex-col justify-between p-4 min-h-[140px] rounded-lg bg-white shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-3 scale-105' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Action Buttons */}
      {showActions && (onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(lead);
              }}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Editar lead"
            >
              <Edit className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Tem certeza que deseja excluir este lead?')) {
                  onDelete(lead.id);
                }
              }}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="Excluir lead"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Draggable Area */}
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="cursor-grab flex-1"
      >
      <div>
        <div className="font-semibold text-sm text-gray-900 mb-3 line-clamp-2">
          {lead.nome}
        </div>
        
        <div className="flex flex-col gap-2 text-xs text-gray-600">
          {lead.nicho && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span className="font-medium">Nicho:</span> 
              <span className="truncate">{lead.nicho}</span>
            </div>
          )}
          {lead.contato && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="font-medium">Contato:</span> 
              <span className="truncate">{lead.contato}</span>
            </div>
          )}
          {lead.data_primeiro_contato && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-purple-400" />
              <span className="font-medium">1º Contato:</span> 
              <span className="truncate">{formatDate(lead.data_primeiro_contato)}</span>
            </div>
          )}
          {lead.meeting_date && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-orange-400" />
              <span className="font-medium">Reunião:</span> 
              <span className="truncate">{formatDateTime(lead.meeting_date)}</span>
            </div>
          )}
          {lead.observacoes && (
            <div className="flex items-start gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1"></span>
              <span className="font-medium">Obs:</span> 
              <span className="text-xs line-clamp-2">{lead.observacoes}</span>
            </div>
          )}
        </div>
      </div>
      
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${getTagColor(lead.tag)}`}>
          {lead.tag}
        </span>
        <div className="text-xs text-gray-400">
          ID: {lead.id}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
