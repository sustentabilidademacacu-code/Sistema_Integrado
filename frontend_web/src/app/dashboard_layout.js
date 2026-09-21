import MapWrapper from './MapWrapper';
import FormNovaOcorrencia from './FormNovaOcorrencia';
import LoginWrapper from './LoginWrapper';
import LogoutButton from './LogoutButton';
import OcorrenciaCard from './OcorrenciaCard';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// --- COMPONENTES DA INTERFACE ---

function Navbar() {
  return (
    <header className="w-full bg-white h-24 border-b-[6px] border-[#022888] flex items-center shrink-0 z-20 shadow-md">
      
      {/* LOGOS (CAIXA DA ESQUERDA) */}
      <Link href="/" className="w-80 h-full flex items-center justify-center gap-5 shrink-0 border-r border-slate-200 px-4 hover:bg-slate-50 transition-colors cursor-pointer">
        <img src="/prefeitura_logo_sem_fundo_quadrada.png" alt="Prefeitura" className="h-14 w-auto object-contain" />
        <div className="h-10 w-[2px] bg-slate-200 rounded-full"></div>
        <img src="/logo_secretaria_logo_sem_fundo_comprida.png" alt="Sustentabilidade" className="h-10 w-auto object-contain" />
      </Link>

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
        
        {/* Widget de Status Operacional e Logout */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-center justify-center bg-slate-50 px-6 py-2 rounded-xl border border-slate-200 shadow-inner">
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

          {/* NOVO BOTÃO DE SAIR AQUI */}
          <div className="h-12 w-px bg-slate-200 mx-2"></div>
          <LogoutButton />
        </div>

      </div>
    </header>
  );
}

function Sidebar({ secretarias, estacoes }) {
  return (
    <aside className="w-80 bg-[#03132e] border-r border-[#133570] flex flex-col z-10 shadow-2xl">
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-2 px-2">Articulação Intersetorial</p>
        <ul className="space-y-1 mb-8">
          {secretarias.map(sec => (
            <li key={sec.id}>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#022888] hover:text-white transition-all border border-transparent hover:border-blue-700">
                {sec.nome}
              </button>
            </li>
          ))}
        </ul>

        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
          <span>🗂️</span> Acervo
        </p>
        <div className="mb-8 px-1">
          <Link href="/historico">
            <button className="w-full bg-[#0a234f] border border-[#133570] text-left px-4 py-3 rounded-lg text-sm font-bold text-slate-300 hover:bg-[#133570] hover:text-white transition-all shadow-sm flex items-center justify-between">
              Histórico de Ocorrências
              <span>→</span>
            </button>
          </Link>
        </div>

        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
          <span>📡</span> Sensores e Estações
        </p>
        <div className="space-y-3 px-1">
          {estacoes.map(est => (
            <div key={est.id} className="bg-[#0a234f] border border-[#133570] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">{est.nome}</span>
                <span className={`w-2 h-2 rounded-full ${est.ativa ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`}></span>
              </div>
              {est.ultima_leitura ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {est.ultima_leitura.chuva_mm !== null && (
                    <div className="bg-[#03132e] rounded p-2 flex flex-col items-center justify-center border border-[#133570]/50">
                      <span className="text-[10px] text-slate-500 uppercase mb-1">Chuva</span>
                      <span className="text-sm font-black text-blue-400">{est.ultima_leitura.chuva_mm}mm</span>
                    </div>
                  )}
                  {est.ultima_leitura.nivel_rio_metros !== null && (
                    <div className="bg-[#03132e] rounded p-2 flex flex-col items-center justify-center border border-[#133570]/50">
                      <span className="text-[10px] text-slate-500 uppercase mb-1">Nível Rio</span>
                      <span className="text-sm font-black text-emerald-400">{est.ultima_leitura.nivel_rio_metros}m</span>
                    </div>
                  )}
                  {est.ultima_leitura.temperatura_c !== null && (
                    <div className="bg-[#03132e] rounded p-2 flex flex-col items-center justify-center border border-[#133570]/50">
                      <span className="text-[10px] text-slate-500 uppercase mb-1">Temp.</span>
                      <span className="text-sm font-black text-orange-400">{est.ultima_leitura.temperatura_c}ºC</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 mt-2 text-center">Nenhuma leitura recebida.</div>
              )}
            </div>
          ))}
        </div>
      </nav>
      
      <div className="p-6 border-t border-[#133570]">
        <button className="w-full bg-[#0a234f] hover:bg-[#133570] text-slate-400 border border-[#1e4896] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          ⚙️ Configurações Gerais
        </button>
      </div>
    </aside>
  );
}

// --- PÁGINA PRINCIPAL ---

export default async function Home() {
  let secretarias = [];
  let ocorrencias = [];
  let estacoes = []; 
  
  try {
    const [resSec, resOco, resEst] = await Promise.all([
      supabase.from('secretarias').select('*'),
      supabase.from('ocorrencias').select('*'),
      supabase.from('mapa_atual').select('*')
    ]);

    if (resSec.data) {
      secretarias = resSec.data;
    }
    if (resOco.data) {
      ocorrencias = resOco.data.filter(oco => oco.status_publico !== 'Concluido');
    }
    if (resEst.data) {
      estacoes = resEst.data.map((est, index) => ({
        id: index,
        nome: est.nome_escola,
        ativa: true,
        ultima_leitura: {
          chuva_mm: est.pluviometro || 0,
          nivel_rio_metros: null,
          temperatura_c: null
        }
      }));
    }

  } catch (error) {
    console.error("Erro ao conectar com o Supabase:", error);
  }

  return (
    <LoginWrapper>
      <div className="h-screen flex flex-col font-sans overflow-hidden bg-[#03132e]">
        
        <Navbar />

        <div className="flex flex-1 overflow-hidden">
          
          <Sidebar secretarias={secretarias} estacoes={estacoes} />

          <main className="flex-1 overflow-y-auto p-8 bg-[#0a234f]">
            
            {/* CABEÇALHO DA PÁGINA (Antes ficava embaixo do mapa) */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Sala de Situação Climática</h2>
                <p className="text-sm text-slate-400 mt-1">Monitoramento da Matriz Municipal de Vulnerabilidade Climática (MMVC) e Eventos Extremos</p>
              </div>
              
              <div className="flex items-center gap-4">
                
                <div className="px-4 py-2 bg-[#133570] rounded-lg text-sm text-slate-300 font-medium border border-[#1e4896]">
                  Total Ativo: <span className="font-bold text-white text-base">{ocorrencias.length}</span>
                </div>
              </div>
            </div>

            {/* MAPA */}
            <MapWrapper ocorrencias={ocorrencias} estacoes={estacoes} />

            {/* LISTA DE OCORRÊNCIAS */}
            <div className="mt-8 mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Ocorrências em Andamento
              </h3>
            </div>
            
            {ocorrencias.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                {ocorrencias.map(oco => (
                  <OcorrenciaCard key={oco.id} oco={oco} />
                ))}
              </div>
            ) : (
              <div className="w-full p-10 bg-[#03132e] rounded-xl border border-dashed border-[#133570] text-center shadow-inner">
                <p className="text-slate-500 font-medium">Nenhum evento climático extremo ou vulnerabilidade crítica registrada em operação no momento.</p>
              </div>
            )}

          </main>
        </div>
      </div>
    </LoginWrapper>
  );
}