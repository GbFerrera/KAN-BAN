export type LeadStatus = 
  | 'lista_leads'
  | 'primeiro_contato'
  | 'follow_up'
  | 'interessados'
  | 'reuniao_agendada'
  | 'fechados'
  | 'perdidos';

export type LeadTag = 'quente' | 'morno' | 'frio';

export interface Lead {
  id: number;
  nome: string;
  nicho: string;
  contato: string;
  data_primeiro_contato: string;
  observacoes: string;
  status: LeadStatus;
  tag: LeadTag;
  meeting_date?: string;
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: LeadStatus;
  title: string;
  emoji: string;
  leads: Lead[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}
