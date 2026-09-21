export const LEVELS = [
  {
    max: 20, code: 'N1', label: 'Sem Risco', desc: 'Condições desfavoráveis à ignição.', color: '#1b4332',
    actions: 'Ações Recomendadas:\n- Evitar acumulação de entulhos ou lixo seco próximo a matas;\n- Não realizar queima de lixo ou folhas secas ao ar livre;\n- Fazer a limpeza preventiva de terrenos e aceiros.\n\nContatos úteis para comunicação de ocorrências:\n- Corpo de Bombeiros: 193 / (21) 2649-1191\n- Defesa Civil: 199 / (21) 95947-9945'
  },
  {
    max: 40, code: 'N2', label: 'Baixo', desc: 'Risco controlável.', color: '#52b788',
    actions: 'Ações Recomendadas:\n- Redobrar a atenção ao descartar pontas de cigarro acessas e materiais inflamáveis próximo a qualquer tipo de vegetação;\n- Mantenha calhas, telhados e acessos livres de folhas secas acumuladas;\n- Evite o uso de fogo nas proximidades de áreas florestadas.\n\nContatos úteis para comunicação de ocorrências:\n- Corpo de Bombeiros: 193 / (21) 2649-1191\n- Defesa Civil: 199 / (21) 95947-9945'
  },
  {
    max: 60, code: 'N3', label: 'Moderado', desc: 'Condições propícias à ignição.', color: '#e9c46a',
    actions: 'Ações Recomendadas:\n- Suspender qualquer atividade de queima controlada ou de limpeza de lotes;\n- Monitorar áreas propensas a focos de calor na sua região;\n- Evitar operar ferramentas ou máquinas que gerem faíscas próximas à vegetação seca.\n\nContatos úteis para comunicação de ocorrências:\n- Corpo de Bombeiros: 193 / (21) 2649-1191\n- Defesa Civil: 199 / (21) 95947-9945'
  },
  {
    max: 80, code: 'N4', label: 'Alto', desc: 'Risco elevado de propagação rápida.', color: '#ef4444',
    actions: 'Ações Recomendadas:\n- É proibido realizar qualquer tipo de queima ao ar livre;\n- Informar imediatamente qualquer foco de fumaça ou focos de fogo;\n- Em caso de observação de fumaça intensa na região, mantenha portas e janelas fechadas e evite exposição desnecessária.\n\nContatos úteis para comunicação de ocorrências:\n- Corpo de Bombeiros: 193 / (21) 2649-1191\n- Defesa Civil: 199 / (21) 95947-9945'
  },
  {
    max: 100, code: 'N5', label: 'Grave', desc: 'Situação crítica — risco extremo de incêndios florestais.', color: '#c1121f',
    actions: 'Ações Recomendadas:\n- Em caso de qualquer sinal de incêndio, comunicar imediatamente os órgãos responsáveis;\n- Não realizar qualquer atividade que possa gerar fogo ou faíscas;\n- Evitar permanecer em áreas de vegetação, especialmente durante os períodos mais quentes e secos do dia;\n- Em caso de emissão de alertas ou orientações de evacuação, seguir imediatamente;\n- Manter documentos, medicamentos e itens essenciais em local de fácil acesso e procura abrigar-se em áreas seguras ou em locais indicados pelas autoridades municipais.\n\nContatos úteis para comunicação de ocorrências:\n- Corpo de Bombeiros: 193 / (21) 2649-1191\n- Defesa Civil: 199 / (21) 95947-9945'
  },
];

export const DEFAULT_WEIGHTS = { fc: 0.35, ff: 0.20, fv: 0.20, fa: 0.15, fd: 0.10 };

export const STATION_FORMULAS = {
  EMCASTALIA: { fc: 0.30, ff: 0.20, fv: 0.25, fa: 0.15, fd: 0.10 },
  SUSTENTABILIDADE1: { fc: 0.30, ff: 0.20, fv: 0.20, fa: 0.20, fd: 0.10 },
  CARMEMCM: { fc: 0.30, ff: 0.20, fv: 0.22, fa: 0.18, fd: 0.10 },
  TIRADENTESCM: { fc: 0.35, ff: 0.15, fv: 0.25, fa: 0.15, fd: 0.10 },
  EMLUCY: { fc: 0.35, ff: 0.20, fv: 0.20, fa: 0.15, fd: 0.10 },
  BRANDAOCM1: { fc: 0.30, ff: 0.20, fv: 0.25, fa: 0.15, fd: 0.10 },
  ALMERINDACM: { fc: 0.33, ff: 0.20, fv: 0.22, fa: 0.15, fd: 0.10 },
  ELIASCM: { fc: 0.35, ff: 0.18, fv: 0.22, fa: 0.15, fd: 0.10 },
  EMFUNCHALCM2: { fc: 0.35, ff: 0.18, fv: 0.22, fa: 0.15, fd: 0.10 },
  EMRPEDRAS: { fc: 0.30, ff: 0.18, fv: 0.25, fa: 0.17, fd: 0.10 },
  EM7SETEMBRO1: { fc: 0.30, ff: 0.20, fv: 0.20, fa: 0.20, fd: 0.10 },
};

export function stationWeights(st) {
  return STATION_FORMULAS[st.session] || DEFAULT_WEIGHTS;
}

export const OPTIONS = {
  ur: [[0, '≥ 70%'], [25, '60–69%'], [50, '50–59%'], [75, '40–49%'], [100, '< 40%']],
  dias: [[0, '0–3 dias'], [25, '4–7 dias'], [50, '8–14 dias'], [75, '15–21 dias'], [100, '> 21 dias']],
  temp: [[0, '≤ 25°C'], [33, '26–30°C'], [67, '31–35°C'], [100, '> 35°C']],
  vento: [[0, '≤ 10 km/h'], [33, '11–20 km/h'], [67, '21–30 km/h'], [100, '> 30 km/h']],
  decliv: [[20, 'Plano ≤5%'], [40, 'Suave 6–15%'], [70, 'Moderada 16–30%'], [100, 'Íngreme >30%']],
  acesso: [[20, 'Pavimentada'], [50, 'Terra'], [100, 'Trilha / sem acesso']],
  veg: [[20, 'Mata fechada'], [50, 'Mata secundária'], [60, 'Agricultura'], [70, 'Borda de mata'], [80, 'Capineira/capim'], [85, 'Taboal'], [90, 'Pastagem']],
  antrop: [[10, 'Natural/sem ocupação'], [30, 'Rural extensiva'], [60, 'Agropecuária intensa'], [80, 'Interface urbano-rural'], [100, 'Uso irregular']],
  dist: [[10, '≤ 2 km'], [30, '3–5 km'], [50, '6–10 km'], [70, '11–20 km'], [85, '21–40 km'], [100, '> 40 km']],
};

export function nearestOption(group, val) {
  let best = OPTIONS[group][0][0];
  let bd = Infinity;
  OPTIONS[group].forEach(([v]) => {
    const d = Math.abs(v - val);
    if (d < bd) {
      bd = d;
      best = v;
    }
  });
  return best;
}

export function levelFor(irif) {
  return LEVELS.find(l => irif <= l.max) || LEVELS[LEVELS.length - 1];
}

export function defaultStateFor(st) {
  return {
    ur: null,
    dias: null,
    temp: null,
    vento: null,
    sazonal: false,
    decliv: nearestOption('decliv', st.decliv_score),
    acesso: 20,
    veg: nearestOption('veg', st.fv_score),
    antrop: nearestOption('antrop', st.fa_score),
    dist: nearestOption('dist', st.fd_score),
    unlock: { ff: false, fv: false, fa: false, fd: false },
  };
}

export function loadState(st) {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('irif_' + st.id);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) { }
  return defaultStateFor(st);
}

export function saveState(st, state) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('irif_' + st.id, JSON.stringify(state));
    }
  } catch (e) { }
}

export function computeIRIF(state, st) {
  const { ur, dias, temp, vento, decliv, acesso, veg, antrop, dist, sazonal } = state;
  if (
    ur === null || ur === undefined ||
    dias === null || dias === undefined ||
    temp === null || temp === undefined ||
    vento === null || vento === undefined
  ) {
    return null;
  }

  const weights = stationWeights(st);
  const fcBase = ur * 0.35 + dias * 0.30 + temp * 0.20 + vento * 0.15;
  const fc = Math.min(sazonal ? fcBase * 1.15 : fcBase, 100);

  if (decliv === null || decliv === undefined || acesso === null || acesso === undefined) {
    return null;
  }
  const ff = decliv * 0.60 + acesso * 0.40;

  if (
    veg === null || veg === undefined ||
    antrop === null || antrop === undefined ||
    dist === null || dist === undefined
  ) {
    return null;
  }

  const weighted = {
    fc: fc * weights.fc,
    ff: ff * weights.ff,
    fv: veg * weights.fv,
    fa: antrop * weights.fa,
    fd: dist * weights.fd,
  };
  const irif = Math.min(100, weighted.fc + weighted.ff + weighted.fv + weighted.fa + weighted.fd);
  return { irif, fcBase, fc, ff, weighted, weights, level: levelFor(irif) };
}
