import LoginWrapper from '../LoginWrapper';
import LogoutButton from '../LogoutButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getOcorrenciasResolvidas() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/ocorrencias/', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter(oco => oco.status_publico === 'Concluido');
  } catch (e) {
    return [];
  }
}

export default async function HistoricoPage() {
  const ocorrencias = await getOcorrenciasResolvidas();

  return (
    <LoginWrapper>
      <div className="min-h-screen w-full flex flex-col bg-slate-950 font-sans text-slate-200">
        
        {/* NAVBAR SIMPLIFICADA */}
        <header className="w-full bg-white min-h-20 md:h-24 border-b-[6px] border-[#022888] flex items-center shrink-0 z-20 shadow-md py-3 md:py-0">
          <div className="w-auto md:w-80 h-auto md:h-full flex items-center justify-center gap-2 md:gap-5 shrink-0 border-r border-slate-200 px-3 md:px-4">
            <img src="/prefeitura_logo_sem_fundo_quadrada.png" alt="Prefeitura" className="h-10 md:h-14 w-auto object-contain" />
            <div className="h-10 w-[2px] bg-slate-200 rounded-full"></div>
            <img src="/logo_secretaria_logo_sem_fundo_comprida.png" alt="Sustentabilidade" className="h-8 md:h-10 w-auto object-contain" />
          </div>
          <div className="flex-1 flex items-center justify-between px-4 md:px-10 gap-4">
            <div className="flex flex-col">
              <h1 className="text-sm md:text-xl font-extrabold text-[#022888] tracking-wide leading-tight">
                Histórico de Ocorrências Resolvidas
              </h1>
              <p className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                Sala de Situação Climática
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link href="/" className="px-3 md:px-5 py-2.5 bg-[#022888] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap">
                ← VOLTAR AO MAPA
              </Link>
              <div className="h-12 w-px bg-slate-200 mx-2"></div>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-950">
          <div className="max-w-6xl mx-auto">
            
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Acervo de Ocorrências</h2>
                <p className="text-slate-500 mt-1">Registro de todas as ações solucionadas pela Prefeitura.</p>
              </div>
              <div className="bg-emerald-900/30 text-emerald-500 px-4 py-2 rounded-lg border border-emerald-900 font-bold text-sm">
                {ocorrencias.length} Registros Encontrados
              </div>
            </div>

            {ocorrencias.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ocorrencias.map(oco => (
                  <div key={oco.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg hover:border-slate-700 transition-colors flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2.5 py-1 text-[10px] font-black tracking-wider rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {oco.prioridade_acao}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-900 uppercase tracking-wider">
                        RESOLVIDO
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-white mb-2">{oco.categoria}</h4>
                    
                    {oco.logradouro && (
                      <p className="text-xs text-slate-400 mb-4 flex items-start gap-1">
                        <span className="mt-0.5">📍</span> 
                        <span>{oco.logradouro}{oco.numero ? `, ${oco.numero}` : ''} - {oco.bairro || oco.localidade}</span>
                      </p>
                    )}

                    <div className="flex-1 bg-slate-950 rounded-lg p-3 border border-slate-800 mb-4 flex flex-col gap-2">
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Problema Relatado</p>
                        <p className="text-xs text-slate-300 italic">&quot;{oco.descricao}&quot;</p>
                      </div>
                      <div className="w-full h-px bg-slate-800 my-1"></div>
                      <div>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Relatório de Solução</p>
                        <p className="text-xs text-emerald-400 font-medium">{oco.relatorio_resolucao || 'Sem relatório detalhado.'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-600 font-medium">
                        Registrado em: {new Date(oco.data_registro).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full py-20 bg-slate-900 rounded-2xl border border-dashed border-slate-700 text-center flex flex-col items-center justify-center">
                <span className="text-4xl mb-4">🗂️</span>
                <h3 className="text-lg font-bold text-slate-300">Nenhum histórico encontrado</h3>
                <p className="text-slate-500 mt-2">As ocorrências marcadas como &quot;Resolvidas&quot; aparecerão aqui.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </LoginWrapper>
  );
}
