'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { STATIONS } from '@/data/stations';
import { STATION_FORMULAS, DEFAULT_WEIGHTS, OPTIONS } from '@/data/irif';

// Helper function to find nearest option
function nearestOption(group, val) {
  let best = OPTIONS[group][0][0];
  let bd = Infinity;
  OPTIONS[group].forEach(([v]) => {
    const d = Math.abs(v - val);
    if (d < bd) { bd = d; best = v; }
  });
  return best;
}

export default function IrifEditorPage() {
  const [weights, setWeights] = useState({});
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]?.session || '');
  const [stationFeatures, setStationFeatures] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smiic_irif_weights');
      if (stored) {
        setWeights(JSON.parse(stored));
      } else {
        setWeights(STATION_FORMULAS);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedStation) return;
    const st = STATIONS.find(s => s.session === selectedStation);
    if (!st) return;

    if (typeof window !== 'undefined') {
      const storedFeats = localStorage.getItem('smiic_station_features_' + selectedStation);
      if (storedFeats) {
        setStationFeatures(JSON.parse(storedFeats));
      } else {
        setStationFeatures({
          decliv: nearestOption('decliv', st.decliv_score),
          acesso: 20,
          veg: nearestOption('veg', st.fv_score),
          antrop: nearestOption('antrop', st.fa_score),
          dist: nearestOption('dist', st.fd_score),
        });
      }
    }
  }, [selectedStation]);

  const handleSave = () => {
    localStorage.setItem('smiic_irif_weights', JSON.stringify(weights));
    localStorage.setItem('smiic_station_features_' + selectedStation, JSON.stringify(stationFeatures));
    
    // Reset any cached runtime state for this station so it recalculates immediately
    const st = STATIONS.find(s => s.session === selectedStation);
    if (st) localStorage.removeItem('irif_' + st.id);

    alert('Fórmula salva com sucesso! Os dashboards já utilizarão os novos pesos e especificações.');
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar as fórmulas e configurações originais (cravadas no código) para todas as estações?')) {
      localStorage.removeItem('smiic_irif_weights');
      STATIONS.forEach(s => localStorage.removeItem('smiic_station_features_' + s.session));
      setWeights(STATION_FORMULAS);
      
      const st = STATIONS.find(s => s.session === selectedStation);
      if (st) {
        setStationFeatures({
          decliv: nearestOption('decliv', st.decliv_score),
          acesso: 20,
          veg: nearestOption('veg', st.fv_score),
          antrop: nearestOption('antrop', st.fa_score),
          dist: nearestOption('dist', st.fd_score),
        });
        localStorage.removeItem('irif_' + st.id);
      }
      alert('Tudo restaurado!');
    }
  };

  const handleWeightChange = (factor, value) => {
    if (!selectedStation) return;
    const currentObj = weights[selectedStation] || DEFAULT_WEIGHTS;
    
    setWeights(prev => ({
      ...prev,
      [selectedStation]: {
        ...currentObj,
        [factor]: parseFloat(value)
      }
    }));
  };

  const handleFeatureChange = (feature, value) => {
    setStationFeatures(prev => ({
      ...prev,
      [feature]: parseInt(value, 10)
    }));
  };

  const stName = STATIONS.find(s => s.session === selectedStation)?.nome || selectedStation;
  const curr = weights[selectedStation] || DEFAULT_WEIGHTS;
  
  const total = Math.round((curr.fc + curr.ff + curr.fv + curr.fa + curr.fd) * 100);

  return (
    <div className="min-h-screen bg-[#03132e] font-sans text-slate-200">
      <div className="w-full bg-[#0a234f] border-b border-[#133570] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500 flex items-center justify-center">
            <span className="text-lg">⚙️</span>
          </div>
          <div>
            <h1 className="text-white font-black text-lg tracking-wide">Editor da Fórmula IRIF</h1>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Ajuste de Pesos do Risco de Incêndio</p>
          </div>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-[#133570] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all">
          ← Voltar ao Admin
        </Link>
      </div>

      <div className="max-w-5xl mx-auto p-8 mt-4">
        
        {/* EXPLICAÇÃO DA FÓRMULA */}
        <div className="bg-[#0a234f] border border-blue-500/30 rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center shrink-0">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h2 className="text-blue-400 font-black text-lg tracking-wide mb-2 uppercase">Como funciona a fórmula do IRIF?</h2>
              <div className="text-slate-300 text-sm leading-relaxed space-y-3 font-medium">
                <p>
                  O <strong className="text-white">Índice de Risco de Incêndio Florestal (IRIF)</strong> é um modelo matemático que cruza dados climáticos em tempo real com características fixas (geográficas) de cada região. O resultado é um número de <strong className="text-white">0 a 100%</strong>, dividido em 5 níveis de alerta (N1 a N5).
                </p>
                <div className="bg-[#03132e]/50 p-4 rounded-xl border border-[#133570] flex flex-col gap-2 my-4">
                  <p className="font-black text-blue-200">A fórmula base:</p>
                  <p className="font-mono text-emerald-400 text-xs bg-[#0a234f] p-2 rounded border border-[#133570]">
                    IRIF = (FC × Peso) + (FF × Peso) + (FV × Peso) + (FA × Peso) + (FD × Peso)
                  </p>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-xs">
                  <li><strong className="text-white">Fator Climático (FC):</strong> Calculado a cada instante pelos sensores da HexaCloud (Umidade, Temperatura, Vento e Dias sem chuva). Caso estejamos na estação seca (Sazonalidade), ele recebe um multiplicador de periculosidade (+15%).</li>
                  <li><strong className="text-white">Fator Fisiográfico (FF):</strong> Junção da Declividade (relevo) e do grau de Dificuldade de Acesso. Fogo sobe morro mais rápido.</li>
                  <li><strong className="text-white">Fator de Vegetação (FV):</strong> Tipo de "combustível" predominante. Pastagens (capim seco) queimam rápido, enquanto matas fechadas seguram umidade.</li>
                  <li><strong className="text-white">Fator Antrópico (FA):</strong> Nível de ocupação. Áreas de interface urbano-rural ou com muita queima agrícola possuem maior risco de ignição humana.</li>
                  <li><strong className="text-white">Fator de Distância (FD):</strong> Tempo e distância que as equipes de emergência levam para chegar ao local.</li>
                </ul>
                <p className="text-amber-400/90 text-xs font-bold mt-2">
                  Abaixo, você pode configurar qual a importância (Peso) de cada um desses 5 fatores na nota final, além de alterar as características físicas da região. A soma dos pesos deve ser obrigatoriamente 100%.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0a234f] border border-[#133570] rounded-2xl p-8 shadow-2xl relative">
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Selecione a Estação / Região</label>
              <select 
                value={selectedStation} 
                onChange={e => setSelectedStation(e.target.value)}
                className="bg-[#03132e] border-2 border-[#133570] text-white px-4 py-2 rounded-lg font-bold outline-none focus:border-amber-500 min-w-[300px]"
              >
                {STATIONS.map(st => (
                  <option key={st.id} value={st.session}>{st.nome}</option>
                ))}
              </select>
            </div>
            
            <div className={`flex flex-col items-end ${total !== 100 ? 'text-red-400' : 'text-emerald-400'}`}>
              <span className="text-[10px] font-black uppercase tracking-widest mb-1">Total dos Pesos</span>
              <span className="text-3xl font-black">{total}%</span>
              {total !== 100 && <span className="text-xs font-bold mt-1 bg-red-900/50 px-2 py-1 rounded">O total deve ser 100%</span>}
            </div>
          </div>

          <div className="space-y-6 bg-[#03132e]/50 p-6 rounded-xl border border-[#133570]/50">
            <h3 className="text-amber-500 font-black uppercase tracking-widest mb-4">Composição do Risco para {stName}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="flex justify-between text-xs font-bold mb-2">
                  <span>🌤️ Fator Climático (FC)</span>
                  <span className="text-amber-400">{Math.round(curr.fc * 100)}%</span>
                </label>
                <input type="range" min="0" max="1" step="0.01" value={curr.fc} onChange={e => handleWeightChange('fc', e.target.value)} className="w-full accent-amber-500" />
                <p className="text-[10px] text-slate-500 mt-1">Peso da Temperatura, Umidade, Vento e Dias sem chuva.</p>
              </div>

              <div>
                <label className="flex justify-between text-xs font-bold mb-2">
                  <span>⛰️ Fator Fisiográfico (FF)</span>
                  <span className="text-amber-400">{Math.round(curr.ff * 100)}%</span>
                </label>
                <input type="range" min="0" max="1" step="0.01" value={curr.ff} onChange={e => handleWeightChange('ff', e.target.value)} className="w-full accent-amber-500" />
                <p className="text-[10px] text-slate-500 mt-1">Peso do Relevo (declividade) e Dificuldade de Acesso.</p>
              </div>

              <div>
                <label className="flex justify-between text-xs font-bold mb-2">
                  <span>🌲 Fator de Vegetação (FV)</span>
                  <span className="text-amber-400">{Math.round(curr.fv * 100)}%</span>
                </label>
                <input type="range" min="0" max="1" step="0.01" value={curr.fv} onChange={e => handleWeightChange('fv', e.target.value)} className="w-full accent-amber-500" />
                <p className="text-[10px] text-slate-500 mt-1">Peso do tipo de combustível (Mata fechada, pastagem, etc).</p>
              </div>

              <div>
                <label className="flex justify-between text-xs font-bold mb-2">
                  <span>🏙️ Fator Antrópico (FA)</span>
                  <span className="text-amber-400">{Math.round(curr.fa * 100)}%</span>
                </label>
                <input type="range" min="0" max="1" step="0.01" value={curr.fa} onChange={e => handleWeightChange('fa', e.target.value)} className="w-full accent-amber-500" />
                <p className="text-[10px] text-slate-500 mt-1">Risco gerado por proximidade humana e agropecuária.</p>
              </div>

              <div>
                <label className="flex justify-between text-xs font-bold mb-2">
                  <span>🚒 Fator de Distância (FD)</span>
                  <span className="text-amber-400">{Math.round(curr.fd * 100)}%</span>
                </label>
                <input type="range" min="0" max="1" step="0.01" value={curr.fd} onChange={e => handleWeightChange('fd', e.target.value)} className="w-full accent-amber-500" />
                <p className="text-[10px] text-slate-500 mt-1">Distância de resposta dos Bombeiros/Defesa Civil.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-[#03132e]/50 p-6 rounded-xl border border-[#133570]/50 mt-8">
            <h3 className="text-amber-500 font-black uppercase tracking-widest mb-4">Especificações Físicas da Estação (Chumbadas)</h3>
            <p className="text-xs text-slate-400 mb-6 -mt-2">
              Edite as características físicas do local onde a estação está instalada. 
              Isso afeta diretamente o cálculo do risco base.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold mb-2">Relevo (Declividade)</label>
                <select 
                  value={stationFeatures.decliv ?? ''}
                  onChange={e => handleFeatureChange('decliv', e.target.value)}
                  className="w-full bg-[#133570] border border-[#1e4896] text-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500"
                >
                  {OPTIONS.decliv.map(([val, label]) => (
                    <option key={`decliv-${val}`} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2">Dificuldade de Acesso</label>
                <select 
                  value={stationFeatures.acesso ?? ''}
                  onChange={e => handleFeatureChange('acesso', e.target.value)}
                  className="w-full bg-[#133570] border border-[#1e4896] text-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500"
                >
                  {OPTIONS.acesso.map(([val, label]) => (
                    <option key={`acesso-${val}`} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2">Tipo de Vegetação Predominante</label>
                <select 
                  value={stationFeatures.veg ?? ''}
                  onChange={e => handleFeatureChange('veg', e.target.value)}
                  className="w-full bg-[#133570] border border-[#1e4896] text-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500"
                >
                  {OPTIONS.veg.map(([val, label]) => (
                    <option key={`veg-${val}`} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2">Fator Antrópico (Ocupação Urbana)</label>
                <select 
                  value={stationFeatures.antrop ?? ''}
                  onChange={e => handleFeatureChange('antrop', e.target.value)}
                  className="w-full bg-[#133570] border border-[#1e4896] text-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500"
                >
                  {OPTIONS.antrop.map(([val, label]) => (
                    <option key={`antrop-${val}`} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-2">Distância da Resposta (Bombeiros/Defesa Civil)</label>
                <select 
                  value={stationFeatures.dist ?? ''}
                  onChange={e => handleFeatureChange('dist', e.target.value)}
                  className="w-full bg-[#133570] border border-[#1e4896] text-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500"
                >
                  {OPTIONS.dist.map(([val, label]) => (
                    <option key={`dist-${val}`} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4 justify-end">
            <button onClick={handleReset} className="px-6 py-3 bg-red-900/30 hover:bg-red-900 border border-red-900/50 text-red-400 font-bold rounded-lg transition-colors">
              Restaurar Original
            </button>
            <button onClick={handleSave} disabled={total !== 100} className={`px-8 py-3 font-bold rounded-lg transition-all shadow-lg ${total === 100 ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
              Salvar Alterações
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
