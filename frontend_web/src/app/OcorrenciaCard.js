'use client';
import { useState } from 'react';

export default function OcorrenciaCard({ oco, isOperacional = false }) {
  const [loading, setLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [relatorio, setRelatorio] = useState('');

  const handleConfirmResolve = async () => {
    if (relatorio.trim() === '') {
      alert("Por favor, preencha o relatório de resolução.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/ocorrencias/${oco.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status_publico: 'Concluido',
          relatorio_resolucao: relatorio 
        })
      });
      
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Erro ao atualizar a ocorrência.");
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert("Falha de conexão com o servidor.");
      setLoading(false);
    }
  };

  if (oco.status_publico === 'Concluido') {
    return null; 
  }

  const corSec = oco.cor_secretaria || '#f97316'; 

  return (
    <div 
      className="bg-black border border-neutral-800 border-l-[6px] p-6 rounded-xl shadow-lg flex flex-col justify-between group transition-transform hover:-translate-y-1"
      style={{ borderLeftColor: corSec }}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 text-xs font-black tracking-wider rounded bg-red-950 text-red-500 border border-red-900">
            {oco.prioridade_acao}
          </span>
          <span className="text-[10px] font-semibold text-neutral-300 bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700 uppercase tracking-wider">
            {oco.status_publico}
          </span>
        </div>
        <h4 className="text-lg font-bold text-white mb-2">{oco.categoria}</h4>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] uppercase font-bold text-neutral-500">Resp:</span>
          <span 
            className="text-[11px] uppercase font-black px-2 py-0.5 rounded border"
            style={{ 
              color: corSec, 
              backgroundColor: `${corSec}20`,
              borderColor: `${corSec}50`
            }}
          >
            {oco.nome_secretaria || 'Defesa Civil'}
          </span>
        </div>

        {oco.logradouro && (
          <p className="text-xs text-neutral-400 mb-3">
            📍 {oco.logradouro}{oco.numero ? `, ${oco.numero}` : ''} - {oco.bairro || oco.localidade}
          </p>
        )}
        
        <p className="text-sm text-neutral-300 mb-4 bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
          "{oco.descricao}"
        </p>
      </div>
      
      {!isResolving ? (
        <div className="mt-2 pt-4 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
              Vuln. Associada:
            </p>
            {oco.vulnerabilidade ? (
              <p className="text-[11px] font-bold text-red-400 max-w-[150px] truncate" title={oco.vulnerabilidade_detalhe}>
                ⚠ {oco.vulnerabilidade_detalhe}
              </p>
            ) : (
              <p className="text-[11px] font-bold text-neutral-500">NENHUMA</p>
            )}
          </div>
          
          {isOperacional ? (
            <button 
              onClick={() => setIsResolving(true)}
              className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-600/30 font-bold py-1.5 px-4 rounded-lg text-xs transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              RESOLVER
            </button>
          ) : (
            <button 
              onClick={() => alert("Acionamento de Secretaria será integrado ao módulo de mensagens em breve.")}
              className="hover:text-white border font-bold py-1.5 px-4 rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm"
              style={{ 
                color: corSec, 
                borderColor: `${corSec}50`,
                backgroundColor: `${corSec}10`
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              ACIONAR
            </button>
          )}
        </div>
      ) : (
        <div className="mt-2 pt-4 border-t border-neutral-800 flex flex-col gap-3">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Relatório de Resolução (Como foi resolvido?)</label>
          <textarea 
            rows="2"
            className="w-full bg-black border border-neutral-700 rounded-lg p-2 text-sm text-neutral-200 outline-none focus:border-emerald-500 transition-colors"
            placeholder="Ex: Equipe enviada ao local, desobstrução da via realizada..."
            value={relatorio}
            onChange={(e) => setRelatorio(e.target.value)}
          ></textarea>
          
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setIsResolving(false)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirmResolve}
              disabled={loading}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Confirmar Resolução'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}