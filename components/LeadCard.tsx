'use client';

import { Lead, LeadTag, LeadStatus } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Pencil, Trash2, Phone, Mail, MessageCircle, ArrowRight, Calendar } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onUpdate: (id: number, updates: Partial<Lead>) => void;
  onDelete: (id: number) => void;
}

const tagColors = {
  quente: 'bg-red-100 text-red-800 border-red-200',
  morno: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  frio: 'bg-blue-100 text-blue-800 border-blue-200'
};

const statusLabels = {
  lista_leads: 'Lista de leads',
  primeiro_contato: 'Primeiro contato',
  follow_up: 'Follow-up',
  interessados: 'Interessados',
  reuniao_agendada: 'Reunião agendada',
  fechados: 'Fechados',
  perdidos: 'Perdidos'
};

export default function LeadCard({ lead, onUpdate, onDelete }: LeadCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(lead);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(lead.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(lead);
    setIsEditing(false);
  };

  const getContactIcon = (contato: string) => {
    switch (contato) {
      case 'WhatsApp': return '📱';
      case 'Instagram': return '📸';
      case 'Email': return '📧';
      case 'Facebook': return '📘';
      case 'LinkedIn': return '💼';
      case 'Telefone': return '☎️';
      case 'Site': return '🌐';
      case 'Indicação': return '🤝';
      default: return '📞';
    }
  };

  const getNichoIcon = (nicho: string) => {
    const nichoLower = nicho.toLowerCase();
    if (nichoLower.includes('restaurante') || nichoLower.includes('food')) return '🍽️';
    if (nichoLower.includes('clínica') || nichoLower.includes('saúde') || nichoLower.includes('médic')) return '🏥';
    if (nichoLower.includes('e-commerce') || nichoLower.includes('loja') || nichoLower.includes('venda')) return '🛒';
    if (nichoLower.includes('consultoria') || nichoLower.includes('consult')) return '💼';
    if (nichoLower.includes('tecnologia') || nichoLower.includes('tech') || nichoLower.includes('software')) return '💻';
    if (nichoLower.includes('educação') || nichoLower.includes('escola') || nichoLower.includes('curso')) return '📚';
    if (nichoLower.includes('imobiliária') || nichoLower.includes('imóvel') || nichoLower.includes('casa')) return '🏠';
    if (nichoLower.includes('beleza') || nichoLower.includes('estética') || nichoLower.includes('salão')) return '💄';
    if (nichoLower.includes('fitness') || nichoLower.includes('academia') || nichoLower.includes('exercício')) return '💪';
    if (nichoLower.includes('advocacia') || nichoLower.includes('advogad') || nichoLower.includes('jurídic')) return '⚖️';
    if (nichoLower.includes('contabilidade') || nichoLower.includes('contador')) return '📊';
    if (nichoLower.includes('marketing') || nichoLower.includes('publicidade')) return '📈';
    if (nichoLower.includes('arquitetura') || nichoLower.includes('arquitet')) return '🏗️';
    if (nichoLower.includes('odontologia') || nichoLower.includes('dentista')) return '🦷';
    if (nichoLower.includes('veterinária') || nichoLower.includes('pet') || nichoLower.includes('animal')) return '🐾';
    return '🏢'; // Ícone padrão para outros nichos
  };

  const getNichoStyle = (nicho: string) => {
    const nichoLower = nicho.toLowerCase();
    if (nichoLower.includes('restaurante')) return 'bg-red-50 text-red-700 border-red-200';
    if (nichoLower.includes('clínica') || nichoLower.includes('saúde')) return 'bg-green-50 text-green-700 border-green-200';
    if (nichoLower.includes('e-commerce') || nichoLower.includes('loja')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (nichoLower.includes('consultoria')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (nichoLower.includes('tecnologia')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (nichoLower.includes('educação')) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (nichoLower.includes('imobiliária')) return 'bg-lime-50 text-lime-700 border-lime-200';
    if (nichoLower.includes('beleza')) return 'bg-pink-50 text-pink-700 border-pink-200';
    if (nichoLower.includes('fitness')) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-gray-50 text-gray-700 border-gray-200'; // Estilo padrão
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    onUpdate(lead.id, { status: newStatus });
    setShowStatusDropdown(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
        <input
          type="text"
          value={editData.nome}
          onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
          className="w-full p-2 border rounded text-sm font-medium"
          placeholder="Nome do lead"
        />
        
        <input
          type="text"
          value={editData.nicho}
          onChange={(e) => setEditData({ ...editData, nicho: e.target.value })}
          className="w-full p-2 border rounded text-sm"
          placeholder="Nicho (ex: restaurante, clínica)"
        />
        
        <select
          value={editData.contato}
          onChange={(e) => setEditData({ ...editData, contato: e.target.value })}
          className="w-full p-2 border rounded text-sm"
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
        
        <input
          type="date"
          value={editData.data_primeiro_contato}
          onChange={(e) => setEditData({ ...editData, data_primeiro_contato: e.target.value })}
          className="w-full p-2 border rounded text-sm"
        />
        
        {editData.status === 'reuniao_agendada' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Data da Reunião
            </label>
            <input
              type="datetime-local"
              value={editData.meeting_date ? new Date(editData.meeting_date).toISOString().slice(0, 16) : ''}
              onChange={(e) => setEditData({ ...editData, meeting_date: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        )}
        
        <select
          value={editData.tag}
          onChange={(e) => setEditData({ ...editData, tag: e.target.value as LeadTag })}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="quente">🔥 Quente</option>
          <option value="morno">🟡 Morno</option>
          <option value="frio">🧊 Frio</option>
        </select>
        
        <textarea
          value={editData.observacoes}
          onChange={(e) => setEditData({ ...editData, observacoes: e.target.value })}
          className="w-full p-2 border rounded text-sm resize-none"
          rows={2}
          placeholder="Observações (ex: quer ver demo semana que vem)"
        />
        
        {(lead.user || lead.user_id) && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <span className="font-medium">
              Criado por: {lead.user ? lead.user.nome : `Usuário #${lead.user_id}`}
            </span>
            {lead.user?.role === 'gestor' && <span className="ml-1">👑</span>}
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Salvar
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 text-sm pr-2">{lead.nome}</h3>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowStatusDropdown(!showStatusDropdown);
            }}
            className="text-gray-400 hover:text-blue-600 p-1 sm:hidden"
            title="Mover para"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lead.id);
            }}
            className="text-gray-400 hover:text-red-600 p-1"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Status Dropdown for Mobile */}
      {showStatusDropdown && (
        <div className="absolute top-12 right-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
          {Object.entries(statusLabels).map(([status, label]) => (
            <button
              key={status}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(status as LeadStatus);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                lead.status === status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {lead.nicho && (
            <span className={`text-xs px-2 py-1 rounded border ${getNichoStyle(lead.nicho)}`}>
              {getNichoIcon(lead.nicho)} {lead.nicho}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded border ${tagColors[lead.tag]}`}>
            {lead.tag === 'quente' && '🔥'} 
            {lead.tag === 'morno' && '🟡'} 
            {lead.tag === 'frio' && '🧊'} 
            {lead.tag}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-600">
          {getContactIcon(lead.contato)}
          <span className="truncate">{lead.contato}</span>
        </div>
        
        <div className="text-xs text-gray-500">
          1º contato: {(() => {
            const date = new Date(lead.data_primeiro_contato + 'T00:00:00');
            return date.toLocaleDateString('pt-BR');
          })()}
        </div>
        
        {lead.user && (
          <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            <span className="font-medium">👤 {lead.user.nome}</span>
            {lead.user.role === 'gestor' && <span className="text-xs">👑</span>}
          </div>
        )}
        
        {lead.status === 'reuniao_agendada' && lead.meeting_date && (
          <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
            <Calendar className="w-3 h-3" />
            <span className="font-medium">
              Reunião: {new Date(lead.meeting_date).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
        
        {lead.observacoes && (
          <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
            {lead.observacoes}
          </div>
        )}
      </div>
    </div>
  );
}
