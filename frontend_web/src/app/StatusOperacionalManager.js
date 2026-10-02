'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const NIVEIS_SISTEMA = [
  { 
    nivel: 'Nível 0 - Normalidade', 
    short: 'NÍVEL 0 - NORMALIDADE',
    sub: 'Sem ameaça relevante',
    color: 'bg-emerald-500', 
    border: 'border-emerald-600', 
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    descricao: 'Condições meteorológicas e hidrológicas normais. Monitoramento de rotina.' 
  },
  { 
    nivel: 'Nível 1 - Atenção', 
    short: 'NÍVEL 1 - ATENÇÃO',
    sub: 'Possibilidade de chuvas / ventos',
    color: 'bg-yellow-500', 
    border: 'border-yellow-600', 
    badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    descricao: 'Previsão de chuvas moderadas ou ocorrências pontuais que demandam estado de prontidão.' 
  },
  { 
    nivel: 'Nível 2 - Alerta', 
    short: 'NÍVEL 2 - ALERTA',
    sub: 'Risco moderado de alagamentos',
    color: 'bg-orange-500', 
    border: 'border-orange-600', 
    badgeBg: 'bg-orange-50 text-orange-800 border-orange-300',
    descricao: 'Ocorrências em andamento, risco de alagamentos e deslizamentos em áreas vulneráveis.' 
  },
  { 
    nivel: 'Nível 3 - Alerta Máximo', 
    short: 'NÍVEL 3 - ALERTA MÁXIMO',
    sub: 'Alto risco de desastre',
    color: 'bg-red-600', 
    border: 'border-red-700', 
    badgeBg: 'bg-red-50 text-red-800 border-red-300',
    descricao: 'Eventos severos com impactos generalizados. Equipes em campo em capacidade total.' 
  },
  { 
    nivel: 'Nível 4 - Emergência', 
    short: 'NÍVEL 4 - EMERGÊNCIA',
    sub: 'Situação de desastre instalada',
    color: 'bg-purple-700', 
    border: 'border-purple-800', 
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-300',
    descricao: 'Declaração de emergência / calamidade pública. Acionamento de planos de contingência máximos.' 
  },
];

const PRESETS_ALERTAS = [
  {
    titulo: 'Alerta Meteorológico: Chuva Forte',
    nivel: 'Nível 1 - Atenção',
    msg: 'Defesa Civil avisa: Previsão de pancadas de chuva moderadas a fortes com descargas elétricas nas próximas horas. Evite áreas alagadas.'
  },
  {
    titulo: 'Alerta Geológico: Risco de Deslizamento de Encosta',
    nivel: 'Nível 2 - Alerta',
    msg: 'Defesa Civil avisa: Devido ao acumulado de chuva, o solo está encharcado. Moradores de encostas devem ficar atentos a trincas e estalos.'
  },
  {
    titulo: 'Alerta Hidrológico: Cheia do Rio Macacu',
    nivel: 'Nível 2 - Alerta',
    msg: 'Defesa Civil avisa: Monitoramento de rios indica elevação do nível das águas. Risco de transbordamento em pontos baixos do município.'
  },
  {
    titulo: 'Alerta de Vendaval e Queda de Árvores',
    nivel: 'Nível 1 - Atenção',
    msg: 'Defesa Civil avisa: Rajadas de vento fortes previstas para a região. Não se abrigue debaixo de árvores e não estacione veículos próximos a torres.'
  },
  {
    titulo: 'Alerta de Queimadas e Baixa Umidade',
    nivel: 'Nível 1 - Atenção',
    msg: 'Defesa Civil e Sec. de Meio Ambiente: Tempo seco com alto risco de fogo em vegetação. Proibido queimar lixo ou pastagem.'
  },
  {
    titulo: 'Retorno à Normalidade',
    nivel: 'Nível 0 - Normalidade',
    msg: 'Defesa Civil informa: As condições climáticas estabilizaram no município. Ocorrências atendidas e monitoramento em rotina.'
  }
];

export default function StatusOperacionalManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('emitir'); // 'emitir' | 'historico'
  
  // Dados do alerta atual
  const [alertaAtual, setAlertaAtual] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Form de novo alerta
  const [formNivel, setFormNivel] = useState('Nível 1 - Atenção');
  const [formTitulo, setFormTitulo] = useState('Alerta Meteorológico: Chuva Forte');
  const [formMensagem, setFormMensagem] = useState('Defesa Civil avisa: Previsão de pancadas de chuva moderadas a fortes nas próximas horas. Em caso de emergência ligue 199.');
  
  // Dados do usuário logado
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSec, setUserSec] = useState('');
  const [userPerfil, setUserPerfil] = useState('');

  const carregarAlertas = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Busca alerta ativo
      const { data: ativoData } = await supabase
        .from('alertas_defesa_civil')
        .select('*')
        .eq('ativo', true)
        .order('data_emissao', { ascending: false })
        .limit(1);

      if (ativoData && ativoData.length > 0) {
        setAlertaAtual(ativoData[0]);
      } else {
        setAlertaAtual(null);
      }

      // 2. Busca histórico completo
      const { data: histData } = await supabase
        .from('alertas_defesa_civil')
        .select('*')
        .order('data_emissao', { ascending: false })
        .limit(20);

      setHistorico(histData || []);
    } catch (err) {
      console.error('Erro ao buscar alertas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const resolveUser = async () => {
      let nome = '';
      let email = '';
      let sec = '';
      let perfil = '';

      if (typeof window !== 'undefined') {
        nome = localStorage.getItem('smiic_user_nome') || '';
        email = localStorage.getItem('smiic_user_email') || '';
        sec = localStorage.getItem('smiic_secretaria_nome') || '';
        perfil = localStorage.getItem('smiic_perfil') || '';
      }

      if (!nome || !email) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            email = session.user.email;
            const rawEmail = session.user.email.replace('@sistema.local', '');
            const { data: perfilData } = await supabase
              .from('solicitacao_acesso')
              .select('nome_completo, email_institucional, perfil, secretarias(nome)')
              .eq('email_institucional', rawEmail)
              .single();

            if (perfilData) {
              nome = perfilData.nome_completo || session.user.email;
              sec = perfilData.secretarias?.nome || sec || 'Secretaria de Defesa Civil';
              perfil = perfilData.perfil || perfil;

              if (typeof window !== 'undefined') {
                localStorage.setItem('smiic_user_nome', nome);
                localStorage.setItem('smiic_user_email', email);
                localStorage.setItem('smiic_secretaria_nome', sec);
                localStorage.setItem('smiic_perfil', perfil);
              }
            }
          }
        } catch (e) {
          console.error('Erro ao resolver perfil do operador:', e);
        }
      }

      setUserName(nome || 'Operador Defesa Civil');
      setUserEmail(email);
      setUserSec(sec || 'Secretaria de Defesa Civil');
      setUserPerfil(perfil || 'operacional');
    };

    resolveUser();
    carregarAlertas();
  }, [carregarAlertas]);

  // Regra Estrita: APENAS quem é da Secretaria de Defesa Civil pode emitir alertas
  const isDefesaCivil = 
    userSec?.toLowerCase().includes('defesa civil') ||
    userPerfil === 'defesa_civil';

  const aplicarPreset = (preset) => {
    setFormNivel(preset.nivel);
    setFormTitulo(preset.titulo);
    setFormMensagem(preset.msg);
  };

  const handleEmitirAlerta = async (e) => {
    e.preventDefault();
    if (!isDefesaCivil) {
      alert('Acesso Negado: Apenas a Secretaria de Defesa Civil possui permissão para emitir alertas.');
      return;
    }

    if (!formTitulo.trim() || !formMensagem.trim()) {
      alert('Por favor, preencha o título e a mensagem do alerta.');
      return;
    }

    setSalvando(true);
    try {
      // 1. Desativar alertas anteriores
      await supabase
        .from('alertas_defesa_civil')
        .update({ 
          ativo: false, 
          data_encerramento: new Date().toISOString(),
          encerrado_por: `${userName} (${userEmail})`
        })
        .eq('ativo', true);

      // 2. Inserir novo alerta com auditoria completa
      const { error } = await supabase
        .from('alertas_defesa_civil')
        .insert([
          {
            nivel_cidade: formNivel,
            tipo_alerta: formTitulo.trim(),
            mensagem: formMensagem.trim(),
            ativo: formNivel !== 'Nível 0 - Normalidade',
            data_emissao: new Date().toISOString(),
            emissor: `Secretaria de Defesa Civil — ${userName}`,
            emissor_nome: userName,
            emissor_email: userEmail,
            emissor_secretaria: 'Secretaria de Defesa Civil'
          }
        ]);

      if (error) throw error;

      alert('Alerta da Defesa Civil emitido e transmitido com sucesso!');
      setModalOpen(false);
      carregarAlertas();
    } catch (err) {
      alert('Erro ao emitir alerta: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleNormalizarCidade = async () => {
    if (!isDefesaCivil) {
      alert('Acesso Negado: Apenas a Secretaria de Defesa Civil pode alterar o nível operacional do município.');
      return;
    }

    if (!confirm('Deseja retornar o município para NÍVEL 0 (NORMALIDADE) e encerrar todos os alertas ativos?')) return;
    
    setSalvando(true);
    try {
      await supabase
        .from('alertas_defesa_civil')
        .update({ 
          ativo: false, 
          data_encerramento: new Date().toISOString(),
          encerrado_por: `${userName} (${userEmail})`
        })
        .eq('ativo', true);

      await supabase
        .from('alertas_defesa_civil')
        .insert([
          {
            nivel_cidade: 'Nível 0 - Normalidade',
            tipo_alerta: 'Monitoramento Normal',
            mensagem: 'Condições meteorológicas estáveis. Sem alertas vigentes.',
            ativo: false,
            data_emissao: new Date().toISOString(),
            emissor: `Secretaria de Defesa Civil — ${userName}`,
            emissor_nome: userName,
            emissor_email: userEmail,
            emissor_secretaria: 'Secretaria de Defesa Civil'
          }
        ]);

      setModalOpen(false);
      carregarAlertas();
    } catch (err) {
      alert('Erro ao normalizar: ' + err.message);
    } finally {
      setSalvando(false);
    }
  };

  const nivelAtivoConfig = NIVEIS_SISTEMA.find(n => alertaAtual?.nivel_cidade?.toUpperCase().includes(n.short.split(' - ')[1]) || alertaAtual?.nivel_cidade === n.nivel) || NIVEIS_SISTEMA[0];

  return (
    <div className="flex items-center gap-3">
      
      {/* BOTÃO EXCLUSIVO DA DEFESA CIVIL: Só aparece se o usuário for da Defesa Civil */}
      {isDefesaCivil && (
        <button
          onClick={() => {
            setActiveTab('emitir');
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-900/40 border-2 border-amber-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Painel exclusivo da Defesa Civil para emitir alertas e controlar o nível municipal"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          <span>🚨 Emitir Alerta (Defesa Civil)</span>
        </button>
      )}

      {/* STATUS OPERACIONAL ATUAL (Para todos os usuários) */}
      <button 
        onClick={() => {
          setActiveTab(isDefesaCivil ? 'emitir' : 'historico');
          setModalOpen(true);
        }}
        className="flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all px-4 py-1.5 rounded-xl border border-slate-200 shadow-inner group text-left cursor-pointer"
        title="Clique para ver detalhes do nível operacional da cidade"
      >
        <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.15em] mb-0.5">
          Status Operacional
        </span>

        <div className={`px-2.5 py-0.5 ${nivelAtivoConfig.color} text-white rounded-full text-[10px] font-black shadow-sm border ${nivelAtivoConfig.border} tracking-wider flex items-center gap-1.5`}>
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm"></span>
          {alertaAtual?.nivel_cidade?.toUpperCase() || 'NÍVEL 0 - NORMALIDADE'}
        </div>
      </button>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a234f] border border-[#133570] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header Modal */}
            <div className="px-6 py-4 bg-[#03132e] border-b border-[#133570] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <h2 className="text-white font-black text-lg tracking-wide uppercase">
                    Defesa Civil Municipal
                  </h2>
                  <p className="text-xs text-slate-400 font-bold">
                    {isDefesaCivil ? 'Painel Operacional de Emissão de Alertas' : 'Consulta de Nível e Alertas Emitidos'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Abas (se for Defesa Civil mostra as duas abas) */}
            {isDefesaCivil && (
              <div className="flex border-b border-[#133570] bg-[#071d43]">
                <button
                  onClick={() => setActiveTab('emitir')}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${activeTab === 'emitir' ? 'bg-[#0a234f] text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
                >
                  📢 Emitir Alerta
                </button>
                <button
                  onClick={() => setActiveTab('historico')}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${activeTab === 'historico' ? 'bg-[#0a234f] text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
                >
                  📜 Histórico de Alertas ({historico.length})
                </button>
              </div>
            )}

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              
              {isDefesaCivil && activeTab === 'emitir' ? (
                <form onSubmit={handleEmitirAlerta} className="space-y-5">
                  
                  {/* Badge de Autoridade */}
                  <div className="bg-amber-950/40 border border-amber-500/50 p-3 rounded-xl flex items-center gap-3 text-amber-300 text-xs font-bold">
                    <span>🛡️</span>
                    <span>Setor Oficial: <strong>Secretaria de Defesa Civil</strong> • Operador: <strong className="text-white">{userName}</strong></span>
                  </div>

                  {/* Status Atual */}
                  <div className="bg-[#03132e] p-4 rounded-xl border border-[#133570] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">
                        Status Atual da Cidade:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${nivelAtivoConfig.color}`}></span>
                        <span className="text-white font-black text-sm">
                          {alertaAtual?.nivel_cidade || 'Nível 0 - Normalidade'}
                        </span>
                      </div>
                      {alertaAtual && (
                        <p className="text-xs text-slate-400 mt-1">
                          "{alertaAtual.tipo_alerta}" • Emitido por: <strong className="text-slate-300">{alertaAtual.emissor_nome || alertaAtual.emissor}</strong>
                        </p>
                      )}
                    </div>
                    {alertaAtual && (
                      <button
                        type="button"
                        onClick={handleNormalizarCidade}
                        disabled={salvando}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        ✓ Retornar a Normalidade
                      </button>
                    )}
                  </div>

                  {/* Modelos Rápidos */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                      ⚡ Modelos de Alerta da Defesa Civil:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESETS_ALERTAS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => aplicarPreset(p)}
                          className="text-left p-2.5 bg-[#0e2c63] hover:bg-[#153b82] border border-[#1e4896] rounded-lg text-xs transition-colors"
                        >
                          <span className="text-blue-300 font-bold block truncate">{p.titulo}</span>
                          <span className="text-[10px] text-slate-400">{p.nivel}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seleção do Nível */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                      1. Selecione o Nível Operacional da Cidade:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {NIVEIS_SISTEMA.map((n) => (
                        <label 
                          key={n.nivel}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formNivel === n.nivel ? 'bg-[#123677] border-blue-400 shadow-md' : 'bg-[#071d43] border-[#133570] hover:bg-[#0e2c63]'}`}
                        >
                          <input 
                            type="radio" 
                            name="nivel_cidade"
                            value={n.nivel}
                            checked={formNivel === n.nivel}
                            onChange={(e) => setFormNivel(e.target.value)}
                            className="mt-1"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${n.color}`}></span>
                              <span className="text-white font-bold text-xs">{n.nivel}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{n.sub}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Título do Alerta */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                      2. Título do Alerta:
                    </label>
                    <input 
                      type="text"
                      value={formTitulo}
                      onChange={(e) => setFormTitulo(e.target.value)}
                      placeholder="Ex: Alerta Meteorológico de Chuva Forte"
                      className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2.5 text-sm font-bold focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  {/* Mensagem para o Cidadão */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                      3. Mensagem Oficial da Defesa Civil (Exibida no App Cidadão):
                    </label>
                    <textarea 
                      rows={3}
                      value={formMensagem}
                      onChange={(e) => setFormMensagem(e.target.value)}
                      placeholder="Orientações e avisos da Defesa Civil aos moradores..."
                      className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  {/* Identificação do Funcionário */}
                  <div className="bg-[#03132e] p-3 rounded-lg border border-[#133570] flex items-center justify-between text-xs">
                    <div className="text-slate-400">
                      <span>👤 Funcionário Emissor: </span>
                      <strong className="text-white">{userName}</strong>
                      <span className="text-slate-500"> ({userEmail})</span>
                    </div>
                    <span className="text-emerald-400 font-mono text-[10px]">● Auditoria Registrada</span>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white font-bold text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvando}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-900/30 flex items-center gap-2"
                    >
                      {salvando ? 'Transmitindo...' : '📢 Transmitir Alerta Oficial'}
                    </button>
                  </div>

                </form>
              ) : (
                /* MODO VISUALIZAÇÃO / HISTÓRICO */
                <div className="space-y-4">
                  {!isDefesaCivil && (
                    <div className="bg-blue-950/40 border border-blue-500/40 p-3.5 rounded-xl flex items-center gap-3 text-blue-300 text-xs">
                      <span className="text-lg">ℹ️</span>
                      <span>Esta seção exibe o histórico e o status atual determinado pela <strong>Secretaria de Defesa Civil</strong>.</span>
                    </div>
                  )}

                  {/* Alerta Atual */}
                  {alertaAtual && (
                    <div className="bg-[#03132e] p-4 rounded-xl border border-amber-500/50">
                      <span className="text-[10px] text-amber-400 uppercase font-black tracking-widest block mb-1">
                        ● Alerta Vigente no Município
                      </span>
                      <h3 className="text-white font-black text-sm mb-1">{alertaAtual.tipo_alerta}</h3>
                      <p className="text-xs text-slate-300 bg-[#0a234f] p-2.5 rounded border border-[#133570] mb-2">
                        {alertaAtual.mensagem}
                      </p>
                      <div className="text-[10px] text-slate-400">
                        Emitido em: <strong>{new Date(alertaAtual.data_emissao).toLocaleString('pt-BR')}</strong> por <strong>{alertaAtual.emissor_nome || alertaAtual.emissor}</strong>
                      </div>
                    </div>
                  )}

                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mt-4">
                    Histórico de Alertas Anteriores:
                  </h4>
                  
                  {historico.length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-6">Nenhum alerta registrado até o momento.</p>
                  ) : (
                    historico.map((item) => (
                      <div key={item.id} className="bg-[#03132e] p-3.5 rounded-xl border border-[#133570] flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.ativo ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                              {item.ativo ? '● Ativo' : 'Encerrado'}
                            </span>
                            <span className="text-white font-bold">{item.nivel_cidade}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.data_emissao).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="font-bold text-blue-300">{item.tipo_alerta}</p>
                        <p className="text-slate-400 text-[11px]">{item.mensagem}</p>
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-[#133570]/40">
                          👤 Emitido por: <strong className="text-slate-300">{item.emissor_nome || item.emissor}</strong> ({item.emissor_email || 'Defesa Civil'})
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
