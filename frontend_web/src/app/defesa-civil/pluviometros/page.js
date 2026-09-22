'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import LogoutButton from '../../LogoutButton';
import LoginWrapper from '../../LoginWrapper';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

function Navbar({ secCor }) {
  return (
    <header 
      className="w-full bg-white h-24 border-b-[6px] flex items-center shrink-0 z-20 shadow-md transition-colors duration-500"
      style={{ borderBottomColor: secCor || '#022888' }}
    >
      <Link href="/" className="w-80 h-full flex items-center justify-center gap-5 shrink-0 border-r border-neutral-200 px-4 hover:bg-neutral-50 transition-colors cursor-pointer">
        <img src="/prefeitura_logo_sem_fundo_quadrada.png" alt="Prefeitura" className="h-14 w-auto object-contain" />
        <div className="h-10 w-[2px] bg-neutral-200 rounded-full"></div>
        <img src="/logo_secretaria_logo_sem_fundo_comprida.png" alt="Sustentabilidade" className="h-10 w-auto object-contain" />
      </Link>
      
      <div className="flex-1 flex items-center justify-between pl-8 pr-6">
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-500 font-black tracking-widest uppercase mb-1 flex items-center gap-2">
            Módulo de Execução <span className="w-1 h-1 bg-neutral-300 rounded-full"></span> Plataforma SMIIC
          </span>
          <h1 className="text-xl md:text-2xl font-black uppercase leading-tight text-[#022888]">
            PAINEL OPERACIONAL — DEFESA CIVIL
          </h1>
        </div>
        
        <div className="flex items-center gap-5 border-l border-neutral-200 pl-6 h-14">
          <Link href="/operacional" className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors px-4 py-2 rounded-lg mr-4">
            Voltar ao Mapa
          </Link>
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Sessão Ativa</span>
            <span className="text-[11px] font-bold text-neutral-600 uppercase">Operador Autorizado</span>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

// Tooltip customizado para o gráfico
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#03132e] border border-[#133570] p-3 rounded-xl shadow-2xl">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-blue-400">{payload[0].value} <span className="text-[10px] text-slate-500">mm</span></p>
      </div>
    );
  }
  return null;
};

// Componente do Cartão de Estação com Gráfico
function StationCard({ st }) {
  const [viewMode, setViewMode] = useState('24h'); // '24h' ou '7d'
  
  const chartData = viewMode === '24h' ? st.series24h : st.series7d;
  const total = viewMode === '24h' ? st.total24h : st.total7d;

  return (
    <div className="bg-[#0a234f] border border-[#133570] rounded-2xl overflow-hidden shadow-xl hover:border-orange-900/50 transition-colors flex flex-col">
      {/* Header do Card */}
      <div className="p-4 bg-[#051838] border-b border-[#133570] flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-white">{st.nome}</h3>
          <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mt-1">
            📍 {st.bairro} — {st.localidade}
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Status Sensor</span>
          {st.lastUpdated ? (
            <span className="text-[10px] bg-emerald-950/50 text-emerald-500 border border-emerald-900/50 px-2 py-0.5 rounded flex items-center gap-1 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          ) : (
            <span className="text-[10px] bg-slate-800 text-slate-500 border border-slate-700 px-2 py-0.5 rounded w-max">
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Controles e Resumo */}
      <div className="p-4 flex items-center justify-between bg-gradient-to-r from-[#03132e] to-[#0a234f] border-b border-[#133570]">
        <div className="flex gap-2 bg-[#051838] p-1 rounded-lg border border-[#133570]">
          <button 
            onClick={() => setViewMode('24h')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === '24h' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            24 Horas
          </button>
          <button 
            onClick={() => setViewMode('7d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === '7d' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            7 Dias
          </button>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block">Acumulado ({viewMode})</span>
          <div className="flex items-end justify-end gap-1">
            <span className="text-2xl font-black text-white leading-none">{total}</span>
            <span className="text-xs text-slate-400 font-bold mb-0.5">mm</span>
          </div>
        </div>
      </div>

      {/* Área do Gráfico */}
      <div className="p-4 flex-1 h-[250px] bg-[#0a234f] relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="label" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 10 }} 
              axisLine={false} 
              tickLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#133570', opacity: 0.4 }} />
            
            {/* Linha de Referência (Alerta 50mm) - Opcional, mostra apenas se a visualização for 24h ou se o eixo Y alcançar */}
            <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.6} label={{ position: 'insideTopLeft', value: 'Alerta 50mm', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
            
            <Bar dataKey="rain" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.rain > 0 ? '#3b82f6' : '#1e3a8a'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function PluviometrosPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [secCor, setSecCor] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window !== 'undefined') {
         setSecCor(localStorage.getItem('smiic_secretaria_cor') || '#ea580c');
      }
      try {
        const res = await fetch('/api/pluviometros');
        const json = await res.json();
        if (json.success) setData(json.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    setTimeout(() => {
      fetchData();
    }, 0);
  }, []);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter(st => 
      st.nome.toLowerCase().includes(lower) ||
      st.bairro.toLowerCase().includes(lower) ||
      st.localidade.toLowerCase().includes(lower)
    );
  }, [data, search]);

  return (
    <LoginWrapper>
      <div className="min-h-screen bg-[#03132e] font-sans flex flex-col text-slate-200">
        <Navbar secCor={secCor} />

        <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 flex flex-col">
          {/* TOP BAR: SEARCH & SUMMARY */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-[#0a234f] p-6 rounded-2xl border border-[#133570] shadow-lg">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="text-3xl">📊</span> Hietogramas (Chuva)
              </h2>
              <p className="text-slate-400 text-sm mt-2 font-medium">Séries temporais e intensidade de chuva na Rede Municipal.</p>
            </div>

            <div className="relative w-full md:w-96 shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar estação, bairro ou localidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#03132e] border border-[#1e4896] text-white text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* CARDS LIST */}
          {loading ? (
            <div className="w-full h-64 flex items-center justify-center bg-[#0a234f]/50 border border-[#133570] rounded-2xl">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-t-2 border-orange-500 animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Montando Hietogramas...</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="w-full py-20 text-center bg-[#0a234f]/30 border border-[#133570] border-dashed rounded-2xl">
              <span className="text-4xl opacity-50 mb-4 block">🌧️</span>
              <h3 className="text-lg font-bold text-slate-400">Nenhuma estação encontrada</h3>
              <p className="text-slate-500 text-sm mt-1">Tente buscar por outro termo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
              {filteredData.map(st => (
                <StationCard key={st.id} st={st} />
              ))}
            </div>
          )}
        </main>
      </div>
    </LoginWrapper>
  );
}
