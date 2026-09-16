"use client";
import { useState, useEffect } from 'react';

// Função para extrair o nome padronizado dos arquivos geográficos
const extrairNome = (props) => {
  return props.NOME ?? props.nome ?? props.nome_localidade ?? props.BAIRRO ?? props.bairro ?? props.localidade ?? props.name ?? "";
};

export default function FormNovaOcorrencia() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [listaLocalidades, setListaLocalidades] = useState([]);
  const [listaBairros, setListaBairros] = useState([]); // Fallback
  const [bairrosPorLocalidade, setBairrosPorLocalidade] = useState({});
  const [listaRuas, setListaRuas] = useState([]);
  const [geojsons, setGeojsons] = useState({ logs: null });

  const [listaVulnerabilidades, setListaVulnerabilidades] = useState([]);

  // Estado que controla o menu suspenso de categoria
  const [categoriaSelect, setCategoriaSelect] = useState('Deslizamento de Terra');

  const [formData, setFormData] = useState({
    categoria: 'Deslizamento de Terra', // inicia com o valor padrão do menu
    descricao: '',
    localidade: '', 
    bairro: '', 
    logradouro: '',
    numero: '',     
    prioridade_acao: 'P2', 
    status_publico: 'Recebido',
    latitude: '',
    longitude: '',
    vulnerabilidade: ''
  });

  // Função para limpar números do início (ex: "1º Distrito" -> "Distrito") para ordenar pelas letras
  const limparNumeros = (str) => {
    return (str || '').replace(/^[0-9\sºª.-]+/, '').trim().toUpperCase();
  };

  const sortLetras = (a, b) => limparNumeros(a).localeCompare(limparNumeros(b), 'pt-BR');

  // Lê os arquivos geográficos no início
  useEffect(() => {
    async function carregarDados() {
      try {
        const [resLoc, resBai, resLog] = await Promise.all([
          fetch('/geojson/localidades.geojson'),
          fetch('/geojson/bairros.geojson'),
          fetch('/geojson/logradouros.geojson')
        ]);
        
        let dataLog = null;

        if (resLoc.ok) {
          const dataLoc = await resLoc.json();
          const nomes = dataLoc.features.map(f => extrairNome(f.properties)).filter(n => n);
          setListaLocalidades([...new Set(nomes)].sort(sortLetras)); 
        }

        if (resBai.ok) {
          const dataBai = await resBai.json();
          const nomes = dataBai.features.map(f => extrairNome(f.properties)).filter(n => n);
          setListaBairros([...new Set(nomes)].sort(sortLetras));
        }

        if (resLog.ok) {
          dataLog = await resLog.json();
          const dicionario = {};
          
          // O mapRuasDetalhadas vai guardar a opção do Datalist "RUA - LOC - BAI" 
          // e mapear para os dados separados { rua, loc, bai } para autocompletar mágico!
          const mapRuasDetalhadas = new Map();

          dataLog.features.forEach(f => {
            const p = f.properties || {};
            const nomeRua = p.NOME_LOGRADOURO || p.NOM_LOGRAD;
            const loc = p.LOCALIDADE;
            const bai = p.BAIRRO;

            if (nomeRua) {
              let label = nomeRua;
              if (loc) label += ` - ${loc}`;
              if (bai) label += ` - ${bai}`;
              mapRuasDetalhadas.set(label, { rua: nomeRua, loc, bai });
            }

            if (loc) {
              if (!dicionario[loc]) dicionario[loc] = new Set();
              if (bai && bai.trim().length > 0) dicionario[loc].add(bai);
            }
          });

          // Converte o dicionário de Sets para Arrays ordenados
          const dicLimpo = {};
          Object.keys(dicionario).forEach(k => {
            dicLimpo[k] = [...dicionario[k]].sort(sortLetras);
          });
          
          setBairrosPorLocalidade(dicLimpo);
          
          // Lista do datalist
          setListaRuas([...mapRuasDetalhadas.keys()].sort(sortLetras));
          
          // Guardar o mapa de ruas para usar no onChange
          setGeojsons({ locs: null, bairs: null, logs: dataLog, mapaRuas: mapRuasDetalhadas });
        } else {
          setGeojsons({ logs: null });
        }

      } catch (err) {
        console.error("Erro carregando arquivos geojson:", err);
      }
    };

    const fetchVulnerabilidades = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/vulnerabilidades-mmvc/');
        if (res.ok) setListaVulnerabilidades(await res.json());
      } catch (e) { console.error(e); }
    };

    if (isOpen) {
      carregarDados();
      fetchVulnerabilidades();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const nomeCampo = e.target.name;
    const valor = e.target.value;
    
    let novosDados = { ...formData, [nomeCampo]: valor };

    // MÁGICA: Se a pessoa selecionou uma rua do Datalist que tem "RUA - LOC - BAIRRO"
    if (nomeCampo === 'logradouro' && geojsons.mapaRuas && geojsons.mapaRuas.has(valor)) {
      const infoDaRua = geojsons.mapaRuas.get(valor);
      novosDados.logradouro = infoDaRua.rua; // Salva só o nome da rua limpo
      if (infoDaRua.loc) novosDados.localidade = infoDaRua.loc;
      if (infoDaRua.bai) novosDados.bairro = infoDaRua.bai;
    }

    // Se mudar a localidade manualmente, limpa o bairro antigo
    if (nomeCampo === 'localidade') {
      novosDados.bairro = '';
    }

    setFormData(novosDados);
  };

  // Função especial para lidar com a Categoria "Outros"
  const handleChangeCategoriaSelect = (e) => {
    const valor = e.target.value;
    setCategoriaSelect(valor);
    
    if (valor === 'Outros') {
      setFormData({ ...formData, categoria: '' });
    } else {
      setFormData({ ...formData, categoria: valor });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Agora enviamos exatamente o que a pessoa digitou, sem coordenadas
    const payload = { ...formData };
    if (!payload.vulnerabilidade) {
      payload.vulnerabilidade = null;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/ocorrencias/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsOpen(false);
        window.location.reload(); 
      } else {
        const erroDoDjango = await res.json();
        alert('O Django recusou salvar! Motivo exato:\n' + JSON.stringify(erroDoDjango, null, 2));
      }
    } catch (error) {
      console.error(error);
      alert('Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const bairrosAtuais = formData.localidade 
    ? (bairrosPorLocalidade[formData.localidade] || []) 
    : listaBairros;
    
  const bairroDesabilitado = formData.localidade && bairrosAtuais.length === 0;

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center gap-2">
        <span>➕</span> Nova Ocorrência
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl border border-slate-200 my-auto max-h-[calc(100vh-1rem)] sm:max-h-[85vh]">
            
            <div className="bg-[#022888] p-3 flex justify-between items-center text-white rounded-t-xl">
              <h2 className="font-bold text-sm tracking-wide">Registrar Nova Ocorrência</h2>
              <button type="button" aria-label="Fechar formulário" onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white font-bold text-lg leading-none p-2 -mr-2">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[calc(100vh-5rem)] sm:max-h-[calc(85vh-4rem)] overflow-y-auto">
              
              {/* === BLOCO 1: ENDEREÇO MANUAL === */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                <label className="block text-[11px] font-bold text-[#022888] uppercase mb-3 tracking-wide border-b border-slate-200 pb-2">
                  1. Endereço da Ocorrência
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Localidade *</label>
                    <select required name="localidade" value={formData.localidade} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-[#022888] bg-white">
                      <option value="">Selecione...</option>
                      {listaLocalidades.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bairro</label>
                    <select 
                      name="bairro" 
                      value={formData.bairro} 
                      onChange={handleChange} 
                      disabled={bairroDesabilitado}
                      className="w-full p-2 border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-[#022888] bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {bairroDesabilitado ? "Não há bairros nesta localidade" : "Selecione... (Opcional)"}
                      </option>
                      {bairrosAtuais.map(bai => (
                        <option key={bai} value={bai}>{bai}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-[3]">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rua / Logradouro *</label>
                    <input list="lista-ruas" required type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} placeholder="Ex: Rua das Flores" className="w-full p-2 border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-[#022888] bg-white" />
                    <datalist id="lista-ruas">
                      {listaRuas.map(rua => (
                        <option key={rua} value={rua} />
                      ))}
                    </datalist>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Número</label>
                    <input type="text" name="numero" value={formData.numero} onChange={handleChange} placeholder="Ex: 123, S/N" className="w-full p-2 border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-[#022888] bg-white" />
                  </div>
                </div>
              </div>
              {/* ======================= */}

              {/* === BLOCO 2: DADOS DA OCORRÊNCIA === */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Categoria</label>
                  <select value={categoriaSelect} onChange={handleChangeCategoriaSelect} className="w-full p-2 border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-[#022888]">
                    <option value="Deslizamento de Terra">Deslizamento de Terra</option>
                    <option value="Alagamento">Alagamento</option>
                    <option value="Inundação">Inundação</option>
                    <option value="Vendaval">Vendaval</option>
                    <option value="Queda de Árvore">Queda de Árvore</option>
                    <option value="Outros">Outros (Especificar)</option>
                  </select>
                  
                  {/* Campo extra que só aparece se escolher 'Outros' */}
                  {categoriaSelect === 'Outros' && (
                    <input required type="text" name="categoria" value={formData.categoria} onChange={handleChange} placeholder="Ex: Incêndio, Desabamento..." className="w-full p-2 mt-2 border-2 border-amber-300 rounded text-sm text-slate-700 outline-none focus:border-[#022888] bg-amber-50" />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prioridade</label>
                  <select name="prioridade_acao" value={formData.prioridade_acao} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-[#022888]">
                    <option value="P5">BAIXA</option>
                    <option value="P4">MÉDIA</option>
                    <option value="P2">ALTA</option>
                    <option value="P1">CRÍTICA</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vulnerabilidade (MMVC) Associada</label>
                  <select name="vulnerabilidade" value={formData.vulnerabilidade} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-[#022888]">
                    <option value="">Nenhuma (Registro Avulso)</option>
                    {listaVulnerabilidades.map(vuln => (
                      <option key={vuln.id} value={vuln.id}>
                        {vuln.categoria} ({vuln.prioridade_acao})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descrição Detalhada</label>
                  <textarea required rows="3" name="descricao" value={formData.descricao} onChange={handleChange} placeholder="Descreva a situação..." className="w-full p-2 border border-slate-300 rounded text-sm text-slate-700 outline-none focus:border-[#022888]"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-[#022888] hover:bg-blue-900 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Salvar no Sistema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}