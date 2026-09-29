import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ActivityIndicator,
  Modal,
  Linking,
  ScrollView
} from 'react-native';
import MapView, { Marker, Callout, Polygon } from 'react-native-maps';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AccessibilityBar from '../components/AccessibilityBar';

// Importa o contorno do município
const contornoData = require('../../assets/geojson/contorno_macacu.json');

// Coordenadas e enquadramento ideal de Cachoeiras de Macacu (zoom equilibrado)
const MACACU_REGION = {
  latitude: -22.4850,
  longitude: -42.7150,
  latitudeDelta: 0.38,
  longitudeDelta: 0.38,
};

function getPolygonCoords(): { latitude: number; longitude: number }[] {
  try {
    const feature = contornoData.features[0];
    const coords = feature.geometry.coordinates[0];
    return coords.map((c: number[]) => ({
      latitude: c[1],
      longitude: c[0],
    }));
  } catch {
    return [];
  }
}

type AlertaDefesaCivil = {
  id?: string;
  nivel_cidade?: string;
  tipo_alerta?: string;
  mensagem?: string;
  ativo?: boolean;
  emissor?: string;
};

const TELEFONES_EMERGENCIA = [
  { nome: 'Defesa Civil Municipal', numero: '199', desc: 'Desastres, alagamentos e deslizamentos', icon: '🚨' },
  { nome: 'Corpo de Bombeiros', numero: '193', desc: 'Incêndios, resgates e acidentes', icon: '🚒' },
  { nome: 'SAMU (Ambulância)', numero: '192', desc: 'Urgências e emergências médicas', icon: '🚑' },
  { nome: 'Guarda Municipal', numero: '153', desc: 'Segurança e trânsito municipal', icon: '👮' },
  { nome: 'Polícia Militar', numero: '190', desc: 'Ocorrências policiais e emergências', icon: '🚓' },
  { nome: 'Ouvidoria da Prefeitura', numero: '0800 000 0000', desc: 'Atendimento geral ao cidadão', icon: '🏛️' },
];

export default function CidadaoHome() {
  const router = useRouter();
  const { isDark, colors, fontScale } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [alerta, setAlerta] = useState<AlertaDefesaCivil | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalEmergenciaVisible, setModalEmergenciaVisible] = useState(false);
  const contornoCoords = getPolygonCoords();

  const fetchDados = useCallback(async () => {
    try {
      // 1. Carrega ocorrências públicas
      const { data: ocoData } = await supabase
        .from('ocorrencias')
        .select('*')
        .order('data_registro', { ascending: false });
      setOcorrencias(ocoData || []);

      // 2. Carrega alerta ativo emitido pela Defesa Civil
      const { data: alertaData } = await supabase
        .from('alertas_defesa_civil')
        .select('*')
        .eq('ativo', true)
        .order('data_emissao', { ascending: false })
        .limit(1);

      if (alertaData && alertaData.length > 0) {
        setAlerta(alertaData[0]);
      } else {
        setAlerta(null);
      }
    } catch (e) {
      console.log('Erro ao carregar dados do cidadão:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDados();
    }, [fetchDados])
  );

  const getPinColor = (prioridade?: string) => {
    const p = prioridade?.toUpperCase();
    if (p === 'P1' || p === 'CRÍTICA' || p === 'CRITICA') return '#7e22ce'; // roxo
    if (p === 'P2' || p === 'ALTA') return '#dc2626'; // vermelho
    if (p === 'P3' || p === 'MÉDIA' || p === 'MEDIA') return '#f59e0b'; // amarelo
    if (p === 'P4' || p === 'BAIXA') return '#f97316'; // laranja
    return '#0f40d4'; // azul default
  };

  const getNivelStyle = () => {
    if (!alerta || !alerta.nivel_cidade) {
      return {
        bg: isDark ? '#064e3b' : '#f0fdf4',
        border: isDark ? '#059669' : '#bbf7d0',
        dot: '#22c55e',
        text: 'Nível da Cidade: NORMALIDADE',
      };
    }
    const n = alerta.nivel_cidade.toUpperCase();
    if (n.includes('EMERGÊNCIA') || n.includes('MÁXIMO') || n.includes('NÍVEL 4') || n.includes('NÍVEL 3')) {
      return {
        bg: isDark ? '#450a0a' : '#fef2f2',
        border: isDark ? '#dc2626' : '#fecaca',
        dot: '#ef4444',
        text: alerta.nivel_cidade,
      };
    }
    if (n.includes('ALERTA') || n.includes('ATENÇÃO') || n.includes('NÍVEL 2') || n.includes('NÍVEL 1')) {
      return {
        bg: isDark ? '#451a03' : '#fefce8',
        border: isDark ? '#d97706' : '#fde68a',
        dot: '#f59e0b',
        text: alerta.nivel_cidade,
      };
    }
    return {
      bg: isDark ? '#064e3b' : '#f0fdf4',
      border: isDark ? '#059669' : '#bbf7d0',
      dot: '#22c55e',
      text: alerta.nivel_cidade,
    };
  };

  const nivelInfo = getNivelStyle();

  const ligarPara = (numero: string) => {
    const cleanNum = numero.replace(/\D/g, '');
    Linking.openURL(`tel:${cleanNum}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBg }]}>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        
        {/* Header Oficial */}
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: colors.bgSecondary }]}
              onPress={() => router.back()}
              activeOpacity={0.7}
              accessibilityLabel="Voltar para a tela inicial"
              accessibilityRole="button"
            >
              <Text style={[styles.backBtnArrow, { color: colors.primary }]}>‹</Text>
              <Text style={[styles.backBtnText, { color: colors.primary, fontSize: 13 * fontScale }]}>Início</Text>
            </TouchableOpacity>

            <View style={styles.headerLogos}>
              <Image 
                source={require('../../assets/images/prefeitura_logo.png')} 
                style={styles.logoPrefeitura}
                resizeMode="contain"
              />
              <Image 
                source={require('../../assets/images/sustentabilidade_logo.png')} 
                style={styles.logoSustentabilidade}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Barra de Perfil / Acesso do Cidadão */}
          {isAuthenticated && user?.tipo === 'cidadao' ? (
            <View style={[styles.citizenBar, { backgroundColor: colors.primaryLight, borderColor: colors.badgeBorder }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.citizenName, { color: colors.primary, fontSize: 12 * fontScale }]}>
                  👤 Olá, <Text style={{ fontWeight: '800' }}>{user.nome}</Text> • {user.bairro || 'Cachoeiras de Macacu'}
                </Text>
              </View>
              <TouchableOpacity onPress={logout} style={styles.logoutCitizenBtn}>
                <Text style={[styles.logoutCitizenText, { color: colors.textMuted, fontSize: 11 * fontScale }]}>Sair</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.citizenBar, { backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder }]}>
              <Text style={[styles.citizenName, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
                Navegando como Visitante
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/cidadao')} style={styles.loginCitizenBtn}>
                <Text style={[styles.loginCitizenBtnText, { color: colors.primary, fontSize: 11 * fontScale }]}>
                  Entrar / Cadastrar ›
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Barra de Acessibilidade (Tema Claro/Escuro & Tamanho de Fonte) */}
          <View style={styles.accessibilityWrap}>
            <AccessibilityBar />
          </View>

          {/* Badge do Nível da Cidade */}
          <View style={[styles.levelBadge, { backgroundColor: nivelInfo.bg, borderColor: nivelInfo.border }]}>
            <View style={[styles.levelDot, { backgroundColor: nivelInfo.dot }]} />
            <Text style={[styles.levelText, { color: isDark ? '#f8fafc' : '#0f172a', fontSize: 12 * fontScale }]}>
              {nivelInfo.text}
            </Text>
          </View>
        </View>

        {/* Map Area */}
        <View style={styles.mapArea}>
          <MapView
            style={styles.map}
            initialRegion={MACACU_REGION}
            showsUserLocation={true}
            showsMyLocationButton={true}
            mapType="satellite"
          >
            {/* Contorno oficial do município */}
            {contornoCoords.length > 0 && (
              <Polygon
                coordinates={contornoCoords}
                strokeColor="#2563eb"
                strokeWidth={3}
                fillColor={colors.mapOverlay}
              />
            )}

            {/* Marcadores de ocorrências */}
            {ocorrencias
              .filter(oco => oco.latitude != null && oco.longitude != null)
              .map(oco => (
                <Marker
                  key={oco.id}
                  coordinate={{
                    latitude: Number(oco.latitude),
                    longitude: Number(oco.longitude),
                  }}
                  pinColor={getPinColor(oco.prioridade_acao)}
                >
                  <Callout>
                    <View style={styles.callout}>
                      <Text style={styles.calloutCategory}>{oco.categoria || 'Ocorrência'}</Text>
                      <Text style={styles.calloutDesc}>{oco.descricao || 'Sem descrição'}</Text>
                      {(oco.logradouro || oco.bairro) && (
                        <Text style={styles.calloutAddr}>
                          📍 {oco.logradouro ? `${oco.logradouro}` : ''}{oco.numero ? `, ${oco.numero}` : ''} {oco.bairro ? `(${oco.bairro})` : ''}
                        </Text>
                      )}
                    </View>
                  </Callout>
                </Marker>
              ))}
          </MapView>

          <View style={styles.sourceTag}>
            <Text style={styles.sourceText}>Fonte: CIGEO — Cachoeiras de Macacu</Text>
          </View>
        </View>

        {/* Bottom Sheet */}
        <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handleBar, { backgroundColor: isDark ? '#334155' : '#cbd5e1' }]} />

          <Text style={[styles.sheetTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
            Canal de Atendimento ao Cidadão
          </Text>
          
          {/* Alerta emitido pela Defesa Civil */}
          <View style={[
            styles.alertCard, 
            !alerta && styles.alertCardNormal,
            isDark && (alerta ? styles.alertCardDark : styles.alertCardNormalDark)
          ]}>
            <View style={styles.alertIconWrap}>
              <Text style={styles.alertIcon}>{alerta ? '⚠️' : '🛡️'}</Text>
            </View>
            <View style={styles.alertBody}>
              <Text style={[
                styles.alertCardTitle, 
                !alerta && styles.alertCardTitleNormal,
                { fontSize: 13 * fontScale }
              ]}>
                {alerta?.tipo_alerta || 'Monitoramento Ativo'}
              </Text>
              <Text style={[
                styles.alertCardDesc, 
                isDark && { color: '#cbd5e1' },
                { fontSize: 11 * fontScale }
              ]}>
                {alerta?.mensagem || 'Defesa Civil monitorando o município em tempo real. Condições meteorológicas estáveis.'}
              </Text>
            </View>
          </View>

          {/* Botão Registrar Ocorrência */}
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/nova-ocorrencia')}
            activeOpacity={0.85}
            accessibilityLabel="Registrar nova ocorrência para a prefeitura"
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={[styles.primaryBtnText, { fontSize: 15 * fontScale }]}>Registrar Ocorrência</Text>
          </TouchableOpacity>
          
          {/* Botão Telefones de Emergência (Exclusivo Cidadão) */}
          <TouchableOpacity 
            style={[styles.secondaryBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder }]} 
            activeOpacity={0.7}
            onPress={() => setModalEmergenciaVisible(true)}
            accessibilityLabel="Abrir lista de telefones e contatos de emergência"
            accessibilityRole="button"
          >
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary, fontSize: 13 * fontScale }]}>
              📞  Telefones de Emergência (199 / 193)
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* MODAL TELEFONES DE EMERGÊNCIA */}
      <Modal
        visible={modalEmergenciaVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalEmergenciaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
                  🚨 Telefones de Emergência
                </Text>
                <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                  Toque em um número para ligar imediatamente
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalEmergenciaVisible(false)}>
                <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {TELEFONES_EMERGENCIA.map((tel, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.telCard, { backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder }]}
                  onPress={() => ligarPara(tel.numero)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.telIcon}>{tel.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.telNome, { color: colors.text, fontSize: 14 * fontScale }]}>
                      {tel.nome}
                    </Text>
                    <Text style={[styles.telDesc, { color: colors.textMuted, fontSize: 11 * fontScale }]}>
                      {tel.desc}
                    </Text>
                  </View>
                  <View style={styles.telBadge}>
                    <Text style={styles.telBadgeText}>Ligar {tel.numero}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  // ─── Header ───────────────────────────
  header: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 10,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  backBtnArrow: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 4,
    lineHeight: 20,
  },
  backBtnText: {
    fontWeight: '700',
  },
  headerLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoPrefeitura: {
    height: 38,
    width: 38,
  },
  logoSustentabilidade: {
    height: 24,
    width: 140,
  },
  accessibilityWrap: {
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  levelText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // ─── Mapa ─────────────────────────────
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  sourceTag: {
    position: 'absolute',
    top: 12,
    left: 14,
    backgroundColor: 'rgba(10, 25, 47, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  sourceText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  callout: {
    width: 220,
    padding: 8,
  },
  calloutCategory: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f40d4',
    marginBottom: 2,
  },
  calloutDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
    marginBottom: 4,
  },
  calloutAddr: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  // ─── Bottom Sheet ─────────────────────
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontWeight: '800',
    marginBottom: 10,
  },
  alertCard: {
    backgroundColor: '#fefce8',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertCardNormal: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  alertCardDark: {
    backgroundColor: '#3b1c04',
    borderColor: '#854d0e',
  },
  alertCardNormalDark: {
    backgroundColor: '#052e16',
    borderColor: '#166534',
  },
  alertIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  alertIcon: {
    fontSize: 18,
  },
  alertBody: {
    flex: 1,
  },
  alertCardTitle: {
    fontWeight: '800',
    color: '#92400e',
    marginBottom: 2,
  },
  alertCardTitleNormal: {
    color: '#15803d',
  },
  alertCardDesc: {
    color: '#64748b',
    lineHeight: 15,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#0f40d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
    lineHeight: 20,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
  secondaryBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontWeight: '700',
  },
  // ─── Modal Emergência ─────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    marginBottom: 14,
  },
  modalTitle: {
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 11,
    marginTop: 2,
  },
  modalClose: {
    fontSize: 18,
    fontWeight: '700',
    padding: 4,
  },
  telCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  telIcon: {
    fontSize: 24,
  },
  telNome: {
    fontWeight: '700',
    marginBottom: 2,
  },
  telDesc: {
    lineHeight: 14,
  },
  telBadge: {
    backgroundColor: '#dc2626',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  telBadgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
  },
  // ─── Citizen Bar ──────────────────────
  citizenBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  citizenName: {
    fontWeight: '600',
  },
  logoutCitizenBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutCitizenText: {
    fontWeight: '700',
  },
  loginCitizenBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  loginCitizenBtnText: {
    fontWeight: '800',
  },
});
