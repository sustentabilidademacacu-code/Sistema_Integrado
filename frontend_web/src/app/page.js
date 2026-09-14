import MapWrapper from './MapWrapper';
import FormNovaOcorrencia from './FormNovaOcorrencia';

export const dynamic = 'force-dynamic';

// --- COMPONENTES DA INTERFACE ---

function Navbar() {
  return (
    <header className="w-full bg-white h-24 border-b-[6px] border-[#022888] flex items-center shrink-0 z-20 shadow-md">
      
      {/* LOGOS (CAIXA DA ESQUERDA) */}
      <div className="w-80 h-full flex items-center justify-center gap-5 shrink-0 border-r border-slate-200 px-4">
        <img src="/prefeitura_logo_sem_fundo_quadrada.png" alt="Prefeitura" className="h-14 w-auto object-contain" />
        <div className="h-10 w-[2px] bg-slate-200 rounded-full"></div>
        <img src="/logo_secretaria_logo_sem_fundo_comprida.png" alt="Sustentabilidade" className="h-10 w-auto object-contain" />
      </div>

      {/* TÍTULOS E STATUS (CAIXA DA DIREITA) */}
      <div className="flex-1 flex items-center justify-between px-10">
        
        {/* Títulos do Sistema */}
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-[#022888] tracking-wide">
            Sistema Municipal Integrado de Inteligência Climática
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
            Secretaria Municipal de Sustentabilidade, Clima, Ecossistema, Recursos Hídricos e Projetos Estratégicos
          </p>
        </div>
        
        {/* Widget de Status Operacional */}
        <div className="flex flex-col items-center justify-center bg-slate-50 px-6 py-2 rounded-xl border border-slate-200 shadow-inner shrink-0">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1.5">
            Status Operacional
          </span>
          <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[11px] font-black shadow-sm border border-emerald-600 tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-sm"></span>
            NÍVEL 0 - NORMALIDADE
          </div>
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1.5">
            Sem ameaça relevante
          </span>
        </div>

      </div>
    </header>
  );
}

function Sidebar({ secretarias }) {
  return (
    <aside className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col z-10 shadow-2xl">
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-2 px-2">Articulação Intersetorial</p>
        <ul className="space-y-1">
          {secretarias.map(sec => (
            <li key={sec.id}>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#022888] hover:text-white transition-all border border-transparent hover:border-blue-700">
                {sec.nome}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-6 border-t border-slate-800">
        <button className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          ⚙️ Configurações Gerais
        </button>
      </div>
    </aside>
  );
}

function OcorrenciaCard({ oco }) {
  return (
    <div className="bg-slate-900 border-l-4 border-[#022888] p-6 rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 text-xs font-black tracking-wider rounded bg-red-950 text-red-500 border border-red-900">
            {oco.prioridade_acao}
          </span>
          <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 uppercase tracking-wider">
            {oco.status_publico}
          </span>
        </div>
        <h4 className="text-lg font-bold text-white mb-2">{oco.categoria}</h4>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 font-medium">
          Vulnerabilidade Associada: <span className="text-slate-300">{oco.vulnerabilidade ? 'Sim (Cadastrada)' : 'Não'}</span>
        </p>
      </div>
    </div>
  );
}


// --- PÁGINA PRINCIPAL ---

export default async function Home() {
  let secretarias = [];
  let ocorrencias = [];
  let estacoes = []; 
  
  try {
    const resSec = await fetch('http://127.0.0.1:8000/api/secretarias/', { cache: 'no-store' });
    if (resSec.ok) secretarias = await resSec.json();
    
    const resOco = await fetch('http://127.0.0.1:8000/api/ocorrencias/', { cache: 'no-store' });
    if (resOco.ok) ocorrencias = await resOco.json();

    const resEst = await fetch('http://127.0.0.1:8000/api/estacoes-meteorologicas/', { cache: 'no-store' });
    if (resEst.ok) estacoes = await resEst.json();

  } catch (error) {
    console.error("Erro ao conectar com o Django:", error);
  }

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden bg-slate-950">
      
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        
        <Sidebar secretarias={secretarias} />

        <main className="flex-1 overflow-y-auto p-10 bg-slate-900">
          
          <MapWrapper ocorrencias={ocorrencias} estacoes={estacoes} />

          <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Sala de Situação Climática</h2>
              <p className="text-sm text-slate-400 mt-1">Monitoramento da Matriz Municipal de Vulnerabilidade Climática (MMVC) e Eventos Extremos</p>
            </div>
            
            {/* ✨ AQUI ESTÁ A NOSSA MÁGICA: O botão alinhado com o Total Ativo */}
            <div className="flex items-center gap-4">
              <FormNovaOcorrencia />
              
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 font-medium border border-slate-700">
                Total Ativo: <span className="font-bold text-white text-base">{ocorrencias.length}</span>
              </div>
            </div>

          </div>
          
          {ocorrencias.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
              {ocorrencias.map(oco => (
                <OcorrenciaCard key={oco.id} oco={oco} />
              ))}
            </div>
          ) : (
            <div className="w-full p-10 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-center">
              <p className="text-slate-500">Nenhum evento climático extremo ou vulnerabilidade crítica registrada em operação no momento.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}