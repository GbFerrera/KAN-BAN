'use client';

import React, { useState, useEffect } from 'react';
import { Lead } from '@/lib/types';
import { Play, Pause, Square, MessageCircle, Clock, Users, CheckCircle, Filter, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WhatsAppCampaignProps {
  leads: Lead[];
  onClose: () => void;
  isOpen: boolean;
  onLeadStatusUpdate?: (leadId: number, newStatus: string) => void;
}

interface CampaignStatus {
  isRunning: boolean;
  currentIndex: number;
  sentCount: number;
  totalLeads: number;
  nextSendTime: Date | null;
  completedLeads: number[];
}

const WhatsAppCampaign: React.FC<WhatsAppCampaignProps> = ({ leads, onClose, isOpen, onLeadStatusUpdate }) => {
  const [message, setMessage] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<number[]>(leads.map(lead => lead.id));
  const [selectedNicho, setSelectedNicho] = useState<string | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>({
    isRunning: false,
    currentIndex: 0,
    sentCount: 0,
    totalLeads: leads.length,
    nextSendTime: null,
    completedLeads: []
  });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Função para enviar mensagem WhatsApp
  const enviarMensagemWhatsApp = async (numero: string, texto: string): Promise<boolean> => {
    try {
      // Remover espaços e caracteres especiais do número
      let numeroLimpo = numero.replace(/\D/g, '');
      
      // Adicionar +55 se não começar com 55
      if (!numeroLimpo.startsWith('55')) {
        numeroLimpo = '55' + numeroLimpo;
      }
      
      const response = await fetch('https://evo.linksystem.tech/message/sendText/fd75802fde9aae1c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiKey': 'e934b315ece0f8a5b5e91eeec5b4b664'
        },
        body: JSON.stringify({
          number: numeroLimpo,
          text: texto
        })
      });

      const data = await response.json();
      console.log('Mensagem enviada com sucesso:', data);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  };

  // Função para gerar tempo aleatório entre 60s e 150s (1m a 2m30s)
  const getRandomDelay = (): number => {
    return Math.floor(Math.random() * (150000 - 60000 + 1)) + 60000; // 60s a 150s em ms
  };

  // Função para obter leads filtrados
  const getFilteredLeads = () => {
    let filteredLeads = leads.filter(lead => selectedLeads.includes(lead.id));
    
    if (selectedNicho) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.nicho?.toLowerCase() === selectedNicho.toLowerCase()
      );
    }
    
    return filteredLeads;
  };

  // Função para obter nichos únicos
  const getUniqueNichos = () => {
    const nichos = leads
      .map(lead => lead.nicho)
      .filter(nicho => nicho && nicho.trim() !== '')
      .map(nicho => nicho!.trim());
    
    return [...new Set(nichos)].sort();
  };

  // Função para processar próximo lead usando padrão recursivo
  const processNextLead = async (index: number = 0) => {
    const filteredLeads = getFilteredLeads();
    
    // Verificar se chegou ao fim da lista
    if (index >= filteredLeads.length) {
      setCampaignStatus(prev => ({
        ...prev,
        isRunning: false,
        nextSendTime: null
      }));
      
      // Limpar timeout se existir
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      // Usar setTimeout para garantir que o estado seja atualizado antes do alert
      setTimeout(() => {
        setCampaignStatus(current => {
          console.log(`Campanha finalizada. Total enviado: ${current.sentCount}`);
          alert(`🎉 Campanha finalizada!\n\nTotal de mensagens enviadas: ${current.sentCount}\nTotal de leads processados: ${filteredLeads.length}`);
          return current;
        });
      }, 100);
      return;
    }

    const currentLead = filteredLeads[index];
    
    if (!currentLead) {
      console.error(`Lead at index ${index} is undefined. Total leads: ${filteredLeads.length}`);
      return;
    }

    // Atualizar status atual
    setCampaignStatus(prev => ({
      ...prev,
      currentIndex: index
    }));

    try {
      // Enviar mensagem
      const success = await enviarMensagemWhatsApp(currentLead.contato, message);
      
      if (success) {
        // Atualizar status do lead para "primeiro_contato"
        try {
          await fetch(`/api/leads/${currentLead.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'primeiro_contato' }),
          });
          
          // Notificar o componente pai sobre a mudança de status
          if (onLeadStatusUpdate) {
            onLeadStatusUpdate(currentLead.id, 'primeiro_contato');
          }
        } catch (error) {
          console.error('Erro ao atualizar status do lead:', error);
        }

        // Atualizar contadores
        setCampaignStatus(prev => ({
          ...prev,
          sentCount: prev.sentCount + 1,
          completedLeads: [...prev.completedLeads, currentLead.id]
        }));
        
        console.log(`Mensagem enviada para ${currentLead.nome} (${currentLead.contato})`);
      } else {
        console.error(`Falha ao enviar mensagem para ${currentLead.nome} (${currentLead.contato})`);
      }
    } catch (error) {
      console.error(`Erro ao processar lead ${currentLead.nome}:`, error);
    }

    // Gerar intervalo aleatório e agendar próximo envio
    const delay = getRandomDelay();
    const nextTime = new Date(Date.now() + delay);
    
    setCampaignStatus(prev => ({
      ...prev,
      nextSendTime: nextTime
    }));
    
    console.log(`Aguardando ${delay/1000} segundos antes de enviar a próxima mensagem...`);
    
    // Agendar próximo envio após o intervalo aleatório
    const timeout = setTimeout(() => {
      processNextLead(index + 1);
    }, delay);
    
    setTimeoutId(timeout);
  };

  // Iniciar campanha
  const startCampaign = () => {
    if (!message.trim()) {
      alert('Por favor, digite uma mensagem antes de iniciar a campanha.');
      return;
    }

    const filteredLeads = getFilteredLeads();
    if (filteredLeads.length === 0) {
      alert('Nenhum lead selecionado para a campanha.');
      return;
    }

    setCampaignStatus(prev => ({
      ...prev,
      isRunning: true,
      totalLeads: filteredLeads.length
    }));

    // Iniciar o processamento com o primeiro lead (índice 0)
    processNextLead(0);
  };

  // Pausar campanha
  const pauseCampaign = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    setCampaignStatus(prev => ({
      ...prev,
      isRunning: false,
      nextSendTime: null
    }));
  };

  // Parar campanha completamente
  const stopCampaign = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    setCampaignStatus({
      isRunning: false,
      currentIndex: 0,
      sentCount: 0,
      totalLeads: getFilteredLeads().length,
      nextSendTime: null,
      completedLeads: []
    });
  };

  // Funções de seleção de leads
  const toggleLeadSelection = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    const filteredByNicho = selectedNicho 
      ? leads.filter(lead => lead.nicho?.toLowerCase() === selectedNicho.toLowerCase())
      : leads;
    setSelectedLeads(filteredByNicho.map(lead => lead.id));
  };

  const deselectAllLeads = () => {
    setSelectedLeads([]);
  };

  // Atualizar seleção quando filtro de nicho muda
  useEffect(() => {
    if (selectedNicho) {
      const nichoLeads = leads.filter(lead => 
        lead.nicho?.toLowerCase() === selectedNicho.toLowerCase()
      );
      setSelectedLeads(prev => prev.filter(id => 
        nichoLeads.some(lead => lead.id === id)
      ));
    }
  }, [selectedNicho, leads]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Formatar tempo restante
  const formatTimeRemaining = (nextTime: Date): string => {
    const now = new Date();
    const diff = nextTime.getTime() - now.getTime();
    
    if (diff <= 0) return '0s';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-green-600" />
            Campanha WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Filtro por Nicho */}
          {getUniqueNichos().length > 0 && (
            <div className="mb-6">
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
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Selecionados</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{getFilteredLeads().length}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Enviadas</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{campaignStatus.sentCount}</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Restantes</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {getFilteredLeads().length - campaignStatus.sentCount}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Status</span>
              </div>
              <div className="text-sm font-bold text-purple-900">
                {campaignStatus.isRunning ? 'Ativa' : 'Parada'}
              </div>
            </div>
          </div>

          {/* Next Send Timer */}
          {campaignStatus.nextSendTime && campaignStatus.isRunning && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Próximo envio em:</h3>
                  <p className="text-2xl font-bold">
                    {formatTimeRemaining(campaignStatus.nextSendTime)}
                  </p>
                </div>
                <Clock className="w-8 h-8 opacity-80" />
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem da Campanha
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem que será enviada para todos os leads..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={campaignStatus.isRunning}
            />
            <p className="text-sm text-gray-500 mt-1">
              Intervalo aleatório entre mensagens: 1m a 2m30s
            </p>
          </div>

          {/* Seleção de Leads */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Seleção de Leads</h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllLeads}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Selecionar Todos
                </button>
                <button
                  onClick={deselectAllLeads}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Desselecionar Todos
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {getFilteredLeads().length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso da Campanha</span>
                <span>{Math.round((campaignStatus.sentCount / getFilteredLeads().length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(campaignStatus.sentCount / getFilteredLeads().length) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!campaignStatus.isRunning ? (
              <button
                onClick={startCampaign}
                disabled={!message.trim() || getFilteredLeads().length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Play className="w-4 h-4" />
                {campaignStatus.sentCount > 0 ? 'Continuar' : 'Iniciar'} Campanha
              </button>
            ) : (
              <button
                onClick={pauseCampaign}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                <Pause className="w-4 h-4" />
                Pausar Campanha
              </button>
            )}
            
            <button
              onClick={stopCampaign}
              disabled={campaignStatus.sentCount === 0 && !campaignStatus.isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Square className="w-4 h-4" />
              Parar Campanha
            </button>
          </div>

          {/* Leads List */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Leads Disponíveis ({leads.length})
            </h3>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {leads
                .filter(lead => selectedNicho ? lead.nicho?.toLowerCase() === selectedNicho.toLowerCase() : true)
                .map((lead, index) => {
                  const isSelected = selectedLeads.includes(lead.id);
                  const isCompleted = campaignStatus.completedLeads.includes(lead.id);
                  const filteredLeads = getFilteredLeads();
                  const currentLeadIndex = filteredLeads.findIndex(l => l.id === lead.id);
                  const isCurrentLead = currentLeadIndex === campaignStatus.currentIndex && campaignStatus.isRunning;
                  
                  return (
                    <div
                      key={lead.id}
                      className={`p-3 border-b border-gray-100 last:border-b-0 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                        isCompleted
                          ? 'bg-green-50'
                          : isCurrentLead
                          ? 'bg-blue-50'
                          : isSelected
                          ? 'bg-blue-25'
                          : 'bg-white'
                      }`}
                      onClick={() => !campaignStatus.isRunning && toggleLeadSelection(lead.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleLeadSelection(lead.id)}
                          disabled={campaignStatus.isRunning}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{lead.nome}</div>
                          <div className="text-sm text-gray-600">{lead.contato}</div>
                          <div className="text-xs text-gray-500">{lead.nicho}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {isCurrentLead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppCampaign;
