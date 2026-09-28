import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

// Cores da paleta oficial
const COLORS = {
  primary: '#0f40d4',
  primaryDark: '#0a2b8e',
  bg: '#f0f4f8',
  white: '#fff',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  red: '#dc2626',
  yellow: '#f59e0b',
  green: '#059669',
};

type Ocorrencia = {
  id: string;
  categoria?: string;
  descricao?: string;
  localidade?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  prioridade_acao?: string;
  status_publico?: string;
  status?: string;
  secretaria_id?: string;
  latitude?: number;
  longitude?: number;
  foto_url?: string;
  data_registro?: string;
};

export default function FuncionarioScreen() {
  const router = useRouter();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pendentes' | 'resolvidas'>('pendentes');
  const [error, setError] = useState<string | null>(null);

  const fetchOcorrencias = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Aqui no futuro podemos filtrar pela 'secretaria' vinculada ao funcionário logado
      const { data, error: fetchError } = await supabase
        .from('ocorrencias')
        .select('*')
        .order('data_registro', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        setError('Não foi possível carregar as ocorrências. Verifique sua conexão.');
        setOcorrencias([]);
      } else {
        setOcorrencias(data || []);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Erro de conexão. Tente novamente.');
      setOcorrencias([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOcorrencias();
  }, [fetchOcorrencias]);

  const atualizarStatus = async (id: string | number, novoStatus = 'Resolvido') => {
    const statusDb = novoStatus === 'Resolvido' ? 'Concluido' : novoStatus;
    const { error } = await supabase
      .from('ocorrencias')
      .update({ 
        status_publico: novoStatus,
        status: statusDb
      })
      .eq('id', id);
      
    if (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    } else {
      Alert.alert('Sucesso', `Status atualizado para: ${novoStatus}!`);
      fetchOcorrencias();
    }
  };

  const filteredData = ocorrencias.filter(item => {
    const isRes = item.status_publico === 'Resolvido' || item.status === 'Concluido' || item.status === 'Concluído';
    if (activeTab === 'pendentes') return !isRes;
    return isRes;
  });

  const pendentesCount = ocorrencias.filter(i => i.status_publico !== 'Resolvido' && i.status !== 'Concluido' && i.status !== 'Concluído').length;
  const resolvidasCount = ocorrencias.filter(i => i.status_publico === 'Resolvido' || i.status === 'Concluido' || i.status === 'Concluído').length;

  const getPriorityColor = (prioridade?: string) => {
    const p = prioridade?.toUpperCase();
    if (p === 'CRÍTICA' || p === 'CRITICA' || p === 'P1') return '#7e22ce'; // roxo
    if (p === 'ALTA' || p === 'P2') return COLORS.red;
    if (p === 'MÉDIA' || p === 'MEDIA' || p === 'P3') return COLORS.yellow;
    if (p === 'BAIXA' || p === 'P4') return '#f97316';
    return COLORS.primary;
  };

  const getPriorityLabel = (prioridade?: string) => {
    const p = prioridade?.toUpperCase();
    if (p === 'CRÍTICA' || p === 'CRITICA' || p === 'P1') return 'CRÍTICA';
    if (p === 'ALTA' || p === 'P2') return 'ALTA';
    if (p === 'MÉDIA' || p === 'MEDIA' || p === 'P3') return 'MÉDIA';
    if (p === 'BAIXA' || p === 'P4') return 'BAIXA';
    return 'NORMAL';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'AGORA';
    if (mins < 60) return `HÁ ${mins} MIN`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `HÁ ${hours}H`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const renderCard = ({ item }: { item: Ocorrencia }) => {
    const prColor = getPriorityColor(item.prioridade_acao);
    const prLabel = getPriorityLabel(item.prioridade_acao);
    const isResolved = item.status_publico === 'Resolvido' || item.status === 'Concluido' || item.status === 'Concluído';

    return (
      <View style={styles.card}>
        {/* Barra lateral de prioridade */}
        <View style={[styles.cardStripe, { backgroundColor: isResolved ? COLORS.green : prColor }]} />
        
        <View style={styles.cardBody}>
          {/* Header do card */}
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.cardId}>#{item.id ? String(item.id).substring(0, 6) : '----'}</Text>
              {item.categoria && (
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{item.categoria}</Text>
                </View>
              )}
            </View>
            {!isResolved && (
              <View style={[styles.priorityBadge, { backgroundColor: prColor + '15' }]}>
                <Text style={[styles.priorityText, { color: prColor }]}>{prLabel}</Text>
              </View>
            )}
            {isResolved && (
              <View style={[styles.priorityBadge, { backgroundColor: '#d1fae5' }]}>
                <Text style={[styles.priorityText, { color: COLORS.green }]}>RESOLVIDA</Text>
              </View>
            )}
          </View>

          {/* Endereço / Bairro */}
          {(item.bairro || item.logradouro || item.localidade) && (
            <Text style={styles.cardAddress}>
              📍 {item.bairro || ''} {item.logradouro ? `• ${item.logradouro}` : ''} {item.numero ? `, nº ${item.numero}` : ''}
            </Text>
          )}

          {/* Descrição */}
          <Text style={styles.cardDesc} numberOfLines={3}>
            {item.descricao || 'Sem descrição'}
          </Text>

          {/* Data */}
          <Text style={styles.cardDate}>{formatDate(item.data_registro)}</Text>

          {/* Foto preview */}
          {item.foto_url && (
            <Image source={{ uri: item.foto_url }} style={styles.cardImage} />
          )}

          {/* Ações */}
          {!isResolved && (
            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.actionBtnPrimary}
                onPress={() => atualizarStatus(item.id, 'Resolvido')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnPrimaryText}>✓  Marcar como Resolvido</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header azul */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Painel Operacional</Text>
            <Text style={styles.headerSub}>Sec. de Sustentabilidade</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerLogoWrap}>
            <Image 
              source={require('../../assets/images/prefeitura_logo.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'pendentes' && styles.tabActive]}
            onPress={() => setActiveTab('pendentes')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'pendentes' && styles.tabTextActive]}>
              Pendentes ({pendentesCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'resolvidas' && styles.tabActive]}
            onPress={() => setActiveTab('resolvidas')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'resolvidas' && styles.tabTextActive]}>
              Resolvidas ({resolvidasCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando ocorrências...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOcorrencias()}>
            <Text style={styles.retryBtnText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderCard}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => fetchOcorrencias(true)}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>{activeTab === 'pendentes' ? '🎉' : '📂'}</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 'pendentes' ? 'Tudo em dia!' : 'Nenhuma resolução'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'pendentes' 
                  ? 'Não há ocorrências pendentes no momento.' 
                  : 'Nenhuma ocorrência foi resolvida ainda.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  // ─── Header ───────────────────────────
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    fontWeight: '500',
  },
  headerLogoWrap: {
    width: 42,
    height: 42,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  headerLogo: {
    width: '100%',
    height: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 10,
    padding: 4,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  // ─── Content ──────────────────────────
  listContent: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: COLORS.bg,
    flexGrow: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  // ─── Card ─────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#0f40d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  cardStripe: {
    width: 5,
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardId: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  catBadge: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e40af',
  },
  cardAddress: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  cardDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnPrimaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnIcon: {
    width: 44,
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnIconText: {
    fontSize: 18,
  },
  // ─── Empty ────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
