"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { STATIONS } from '@/data/stations';

export default function GraficosPage() {
  const [stationId, setStationId] = useState(STATIONS[0].session);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set default dates to last 7 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const startSecs = Math.floor(new Date(startDate + 'T00:00:00').getTime() / 1000);
        const endSecs = Math.floor(new Date(endDate + 'T23:59:59').getTime() / 1000);
        
        // Sempre pegar um pouco antes para garantir que a linha do gráfico começa certa
        const url = `https://hexacloud.com.br/json_api/influx_compat/getAllData.php?session=${stationId}&since=${startSecs}`;
        
        const res = await fetch(url);
        const json = await res.json();
        
        if (json.success && json.result) {
          const dailyData = {};
          
          const processSerie = (serieKey, serieData, isSum = false) => {
            if (!serieData) return;
            serieData.forEach(item => {
              const itemSecs = item.timestamp / 1000;
              // Filtra os dados que estão DEPOIS da data de fim (já que a API traz até o momento atual)
              if (itemSecs > endSecs) return;

              const date = new Date(item.timestamp);
              const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              
              if (!dailyData[dayKey]) {
                dailyData[dayKey] = {
                  dateStr: dayKey,
                  displayDate: dayKey.split('-').reverse().slice(0,2).join('/'),
                  timestamp: new Date(dayKey + 'T00:00:00').getTime(),
                  Temperatura: null,
                  Umidade: null,
                  Vento: null,
                  Pressao: null,
                  Luminosidade: null,
                  Ultravioleta: null,
                  PM25: null,
                  Pluviometro: 0,
                  countTemp: 0,
                  countUmi: 0,
                  countVento: 0,
                  countPressao: 0,
                  countLumi: 0,
                  countUV: 0,
                  countPM25: 0
                };
              }

              if (isSum) {
                dailyData[dayKey][serieKey] += parseFloat(item.data);
              } else {
                dailyData[dayKey][serieKey] = (dailyData[dayKey][serieKey] || 0) + parseFloat(item.data);
                if (serieKey === 'Temperatura') dailyData[dayKey].countTemp++;
                if (serieKey === 'Umidade') dailyData[dayKey].countUmi++;
                if (serieKey === 'Vento') dailyData[dayKey].countVento++;
                if (serieKey === 'Pressao') dailyData[dayKey].countPressao++;
                if (serieKey === 'Luminosidade') dailyData[dayKey].countLumi++;
                if (serieKey === 'Ultravioleta') dailyData[dayKey].countUV++;
                if (serieKey === 'PM2.5') dailyData[dayKey].countPM25++;
              }
            });
          };

          processSerie('Temperatura', json.result.Temperatura, false);
          processSerie('Umidade', json.result.Umidade, false);
          processSerie('Vento', json.result.Vento, false);
          processSerie('Pressao', json.result.Pressao, false);
          processSerie('Luminosidade', json.result.Luminosidade, false);
          processSerie('Ultravioleta', json.result.Ultravioleta, false);
          processSerie('PM2.5', json.result['PM2.5'], false);
          processSerie('Pluviometro', json.result.Pluviometro, true);

          const finalData = Object.values(dailyData).map(d => {
            return {
              ...d,
              Temperatura: d.countTemp > 0 ? Number((d.Temperatura / d.countTemp).toFixed(1)) : null,
              Umidade: d.countUmi > 0 ? Number((d.Umidade / d.countUmi).toFixed(1)) : null,
              Vento: d.countVento > 0 ? Number((d.Vento / d.countVento).toFixed(1)) : null,
              Pressao: d.countPressao > 0 ? Number((d.Pressao / d.countPressao).toFixed(1)) : null,
              Luminosidade: d.countLumi > 0 ? Number((d.Luminosidade / d.countLumi).toFixed(0)) : null,
              Ultravioleta: d.countUV > 0 ? Number((d.Ultravioleta / d.countUV).toFixed(1)) : null,
              PM25: d.countPM25 > 0 ? Number((d.PM25 / d.countPM25).toFixed(1)) : null,
              Pluviometro: Number(d.Pluviometro.toFixed(2))
            };
          }).sort((a, b) => a.timestamp - b.timestamp);

          setData(finalData);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [stationId, startDate, endDate]);

  return (
    <div className="flex flex-col h-full bg-[#020b1a] text-slate-200 overflow-y-auto min-h-screen print:bg-white print:text-black">
      
      {/* HEADER DE IMPRESSÃO OFICIAL (Escondido na tela, visível só no PDF) */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-black pb-4">
        <h1 className="text-2xl font-black uppercase tracking-widest text-black">Prefeitura de Cachoeiras de Macacu</h1>
        <h2 className="text-lg font-bold text-gray-700 mt-1">Relatório Oficial de Telemetria HexaClima</h2>
        <p className="text-sm text-gray-600 mt-2">
          Estação: {STATIONS.find(s => s.session === stationId)?.nome} | Período: {startDate.split('-').reverse().join('/')} a {endDate.split('-').reverse().join('/')}
        </p>
        <p className="text-xs text-gray-500 mt-1">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
      </div>

      {/* HEADER DA TELA (Escondido na impressão) */}
      <header className="flex-none p-6 border-b border-[#133570] flex items-center justify-between bg-gradient-to-r from-[#03132e] to-[#0a234f] print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            📊 Gráficos Analíticos de Sensores (HexaClima)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visualização nativa dos dados reais das estações de Cachoeiras de Macacu.
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-all shadow-md flex items-center gap-2"
          >
            🖨️ Baixar PDF
          </button>
          <Link href="/operacional">
            <button className="px-4 py-2 bg-[#133570] hover:bg-[#1e4896] text-white rounded-lg text-sm font-bold transition-all shadow-md">
              ← Voltar
            </button>
          </Link>
        </div>
      </header>

      <div className="flex-none p-6 bg-[#03132e] border-b border-[#133570] flex flex-wrap gap-6 items-center justify-between print:hidden">
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Selecione a Estação (Sensor)
          </label>
          <select 
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="bg-[#0a234f] border border-blue-500/50 text-white p-3 rounded-lg font-bold min-w-[250px] outline-none"
          >
            {STATIONS.filter(s => !s.hideFromList).map(st => (
              <option key={st.id} value={st.session}>{st.nome} - {st.regiao}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 print:hidden">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Período de Análise
          </label>
          <div className="flex bg-[#0a234f] border border-[#133570] rounded-lg p-1 items-center gap-2">
            <input 
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-[#03132e] text-white text-sm px-3 py-2 rounded border border-blue-500/30 outline-none focus:border-blue-500"
            />
            <span className="text-slate-400 text-xs font-bold">ATÉ</span>
            <input 
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-[#03132e] text-white text-sm px-3 py-2 rounded border border-blue-500/30 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-8 print:p-0 print:gap-12">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-[#133570] border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Buscando telemetria nativa...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-[#0a234f]/30 border border-[#133570]/50 rounded-2xl">
            <p className="text-slate-400 font-bold">Nenhum dado recebido da estação neste período.</p>
          </div>
        ) : (
          <>
            {/* Gráfico de Chuva (Pluviômetro) */}
            {data.some(d => d.Pluviometro > 0) && (
              <div className="bg-[#0a192f] border border-[#133570] rounded-2xl p-5 shadow-lg print:bg-transparent print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
                <h3 className="text-lg font-black text-blue-300 mb-6 flex items-center gap-2 print:text-black">
                  🌧️ Volume de Chuva Acumulada (mm/dia)
                </h3>
                <div className="h-[250px] w-full print:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#133570" vertical={false} />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#64748b" 
                        fontSize={11}
                      />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#03132e', borderColor: '#1e4896', borderRadius: '8px' }}
                        itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
                      />
                      <Bar dataKey="Pluviometro" name="Chuva (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Gráfico de Temperatura e Umidade */}
            {data.some(d => d.Temperatura !== null) && (
              <div className="bg-[#0a192f] border border-[#133570] rounded-2xl p-5 shadow-lg print:bg-transparent print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
                <h3 className="text-lg font-black text-orange-300 mb-6 flex items-center gap-2 print:text-black">
                  🌡️ Temperatura Média (°C) e Umidade (%)
                </h3>
                <div className="h-[250px] w-full print:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#133570" vertical={false} />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#64748b" 
                        fontSize={11}
                      />
                      <YAxis yAxisId="left" stroke="#f97316" fontSize={11} domain={['auto', 'auto']} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#03132e', borderColor: '#1e4896', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="Temperatura" name="Temp. (°C)" stroke="#f97316" strokeWidth={3} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="Umidade" name="Umidade (%)" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Gráfico de Vento */}
            {data.some(d => d.Vento !== null) && (
              <div className="bg-[#0a192f] border border-[#133570] rounded-2xl p-5 shadow-lg print:bg-transparent print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
                <h3 className="text-lg font-black text-slate-300 mb-6 flex items-center gap-2 print:text-black">
                  💨 Velocidade Média do Vento (km/h)
                </h3>
                <div className="h-[250px] w-full print:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#133570" vertical={false} />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#64748b" 
                        fontSize={11}
                      />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#03132e', borderColor: '#1e4896', borderRadius: '8px' }}
                        itemStyle={{ color: '#cbd5e1', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
                      />
                      <Line type="monotone" dataKey="Vento" name="Vento (km/h)" stroke="#cbd5e1" strokeWidth={2} dot={false} fill="#cbd5e1" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Gráfico de Radiação */}
            {data.some(d => d.Luminosidade !== null || d.Ultravioleta !== null) && (
              <div className="bg-[#0a192f] border border-[#133570] rounded-2xl p-5 shadow-lg print:bg-transparent print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
                <h3 className="text-lg font-black text-yellow-300 mb-6 flex items-center gap-2 print:text-black">
                  ☀️ Radiação Solar (Luminosidade & UV)
                </h3>
                <div className="h-[250px] w-full print:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#133570" vertical={false} />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#64748b" 
                        fontSize={11}
                      />
                      <YAxis yAxisId="left" stroke="#fef08a" fontSize={11} domain={[0, 'auto']} />
                      <YAxis yAxisId="right" orientation="right" stroke="#c084fc" fontSize={11} domain={[0, 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#03132e', borderColor: '#1e4896', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="Luminosidade" name="Luz (Lux)" stroke="#fef08a" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="Ultravioleta" name="Índice UV" stroke="#c084fc" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Gráfico de Qualidade do Ar */}
            {data.some(d => d.PM25 !== null) && (
              <div className="bg-[#0a192f] border border-[#133570] rounded-2xl p-5 shadow-lg print:bg-transparent print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
                <h3 className="text-lg font-black text-emerald-300 mb-6 flex items-center gap-2 print:text-black">
                  🍃 Qualidade do Ar (PM2.5)
                </h3>
                <div className="h-[250px] w-full print:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#133570" vertical={false} />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#64748b" 
                        fontSize={11}
                      />
                      <YAxis stroke="#6ee7b7" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#03132e', borderColor: '#1e4896', borderRadius: '8px' }}
                        itemStyle={{ color: '#6ee7b7', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
                      />
                      <Line type="monotone" dataKey="PM25" name="Partículas PM2.5 (µg/m³)" stroke="#6ee7b7" strokeWidth={2} dot={false} fill="#6ee7b7" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Gráfico de Pressão */}
            {data.some(d => d.Pressao !== null) && (
              <div className="bg-[#0a192f] border border-[#133570] rounded-2xl p-5 shadow-lg print:bg-transparent print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
                <h3 className="text-lg font-black text-rose-300 mb-6 flex items-center gap-2 print:text-black">
                  🗜️ Pressão Atmosférica Média (hPa)
                </h3>
                <div className="h-[250px] w-full print:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#133570" vertical={false} />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#64748b" 
                        fontSize={11}
                      />
                      <YAxis stroke="#fda4af" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#03132e', borderColor: '#1e4896', borderRadius: '8px' }}
                        itemStyle={{ color: '#fda4af', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
                      />
                      <Line type="monotone" dataKey="Pressao" name="Pressão (hPa)" stroke="#fda4af" strokeWidth={2} dot={false} fill="#fda4af" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}
