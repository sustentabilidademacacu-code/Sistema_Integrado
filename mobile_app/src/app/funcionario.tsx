import { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView, 
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AccessibilityBar from '../components/AccessibilityBar';

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
  cidadao_id?: string;
  cidadao_nome?: string;
  cidadao_telefone?: string;
  parecer_tecnico?: string;
  resolvido_por_nome?: string;
  resolvido_por_email?: string;
  resolvido_em?: string;
  equipe_responsavel?: string;
};

export default function FuncionarioScreen() {
  const router = useRouter();
  const { isDark, colors, scaleFont } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pendentes' | 'resolvidas'>('pendentes');
  const [filterMySecOnly, setFilterMySecOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para Modal de Resolução Técnica Oficial
  const [resolvendoItem, setResolvendoItem] = useState<Ocorrencia | null>(null);
  const [parecerTecnico, setParecerTecnico] = useState('');
  const [equipeResponsavel, setEquipeResponsavel] = useState('');
  const [salvandoResolucao, setSalvandoResolucao] = useState(false);

  const fetchOcorrencias = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
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
    if (user?.tipo === 'funcionario') {
      fetchOcorrencias();
    }
  }, [fetchOcorrencias, user]);

  const abrirModalResolucao = (item: Ocorrencia) => {
    setResolvendoItem(item);
    setParecerTecnico('');
    setEquipeResponsavel(user?.secretaria_nome ? `Equipe ${user.secretaria_nome}` : '');
  };

  const salvarResolucaoTecnica = async () => {
    if (!resolvendoItem) return;
    if (!parecerTecnico.trim()) {
      Alert.alert('Parecer Obrigatório', 'Por favor, descreva detalhadamente as ações técnicas realizadas para solucionar o chamado.');
      return;
    }

    setSalvandoResolucao(true);
    try {
      const { error } = await supabase
        .from('ocorrencias')
        .update({
          status: 'Concluido',
          status_publico: 'Resolvido',
          parecer_tecnico: parecerTecnico.trim(),
          equipe_responsavel: equipeResponsavel.trim() || 'Equipe Municipal de Campo',
          resolvido_por_nome: user?.nome || 'Servidor Autorizado',
          resolvido_por_email: user?.email || '',
          resolvido_por_id: user?.id || '',
          resolvido_em: new Date().toISOString()
        })
        .eq('id', resolvendoItem.id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Laudo de conclusão e parecer técnico registrados com sucesso no SMIIC.');
      setResolvendoItem(null);
      setParecerTecnico('');
      setEquipeResponsavel('');
      fetchOcorrencias();
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível salvar o parecer técnico: ' + (e.message || 'Erro desconhecido.'));
    } finally {
      setSalvandoResolucao(false);
    }
  };

  // Se NÃO for funcionário autenticado, exibe tela de login / bloqueio institucional
  if (!isAuthenticated || user?.tipo !== 'funcionario') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBg }]}>
        <View style={[styles.topBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.bgSecondary }]}
            onPress={() => router.replace('/')}
            activeOpacity={0.7}
          >
            <Text style={[styles.backBtnArrow, { color: colors.primary }]}>‹</Text>
            <Text style={[styles.backBtnText, { color: colors.primary, fontSize: scaleFont(13) }]}>Início</Text>
          </TouchableOpacity>
          <AccessibilityBar />
        </View>

        <View style={[styles.lockContainer, { backgroundColor: colors.bg }]}>
          <View style={[styles.lockCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Image
              source={require('../../assets/images/prefeitura_logo.png')}
              style={styles.lockLogo}
              resizeMode="contain"
            />
            <View style={[styles.lockBadge, { backgroundColor: 'rgba(220, 38, 38, 0.1)' }]}>
              <Text style={styles.lockBadgeText}>ACESSO RESTRITO A SERVIDORES</Text>
            </View>

            <Text style={[styles.lockTitle, { color: colors.text, fontSize: scaleFont(18) }]}>
              Autenticação Necessária
            </Text>
            <Text style={[styles.lockDesc, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
              O Painel Operacional é restrito aos funcionários autorizados da Prefeitura Municipal de Cachoeiras de Macacu.
            </Text>

            <TouchableOpacity
              style={[styles.loginGateBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/auth/funcionario')}
              activeOpacity={0.85}
            >
              <Text style={[styles.loginGateBtnText, { fontSize: scaleFont(15) }]}>
                🏛️ Entrar com Credencial de Servidor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.requestGateBtn, { borderColor: colors.cardBorder }]}
              onPress={() => router.push('/auth/funcionario')}
              activeOpacity={0.7}
            >
              <Text style={[styles.requestGateBtnText, { color: colors.primary, fontSize: scaleFont(13) }]}>
                Solicitar Nova Credencial
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Filtragem
  let list = ocorrencias;
  if (filterMySecOnly && user.secretaria_id) {
    list = list.filter(item => String(item.secretaria_id) === String(user.secretaria_id));
  }

  const filteredData = list.filter(item => {
    const isRes = item.status_publico === 'Resolvido' || item.status === 'Concluido' || item.status === 'Concluído';
    if (activeTab === 'pendentes') return !isRes;
    return isRes;
  });

  const pendentesCount = list.filter(i => i.status_publico !== 'Resolvido' && i.status !== 'Concluido' && i.status !== 'Concluído').length;
  const resolvidasCount = list.filter(i => i.status_publico === 'Resolvido' || i.status === 'Concluido' || i.status === 'Concluído').length;

  const getPriorityColor = (prioridade?: string) => {
    const p = prioridade?.toUpperCase();
    if (p === 'CRÍTICA' || p === 'CRITICA' || p === 'P1') return '#7e22ce'; // roxo
    if (p === 'ALTA' || p === 'P2') return '#dc2626'; // vermelho
    if (p === 'MÉDIA' || p === 'MEDIA' || p === 'P3') return '#f59e0b'; // amarelo
    if (p === 'BAIXA' || p === 'P4') return '#f97316'; // laranja
    return colors.primary;
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
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* Barra lateral de prioridade */}
        <View style={[styles.cardStripe, { backgroundColor: isResolved ? '#059669' : prColor }]} />
        
        <View style={styles.cardBody}>
          {/* Header do card */}
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.cardId, { color: colors.textMuted }]}>
                #{item.id ? String(item.id).substring(0, 6) : '----'}
              </Text>
              {item.categoria && (
                <View style={[styles.catBadge, { backgroundColor: colors.primaryLight, borderColor: colors.badgeBorder }]}>
                  <Text style={[styles.catBadgeText, { color: colors.primary, fontSize: scaleFont(10) }]}>
                    {item.categoria}
                  </Text>
                </View>
              )}
            </View>
            {!isResolved && (
              <View style={[styles.priorityBadge, { backgroundColor: prColor + '20' }]}>
                <Text style={[styles.priorityText, { color: prColor, fontSize: scaleFont(9) }]}>{prLabel}</Text>
              </View>
            )}
            {isResolved && (
              <View style={[styles.priorityBadge, { backgroundColor: isDark ? '#064e3b' : '#d1fae5' }]}>
                <Text style={[styles.priorityText, { color: '#059669', fontSize: scaleFont(9) }]}>RESOLVIDA</Text>
              </View>
            )}
          </View>

          {/* Cidadão solicitante */}
          {item.cidadao_nome && (
            <Text style={[styles.cardAddress, { color: colors.textMuted, fontSize: scaleFont(11), marginTop: 2 }]}>
              👤 Munícipe: <Text style={{ color: colors.text, fontWeight: '700' }}>{item.cidadao_nome}</Text> {item.cidadao_telefone ? `(${item.cidadao_telefone})` : ''}
            </Text>
          )}

          {/* Endereço / Bairro */}
          {(item.bairro || item.logradouro || item.localidade) && (
            <Text style={[styles.cardAddress, { color: colors.primary, fontSize: scaleFont(12), marginTop: 2 }]}>
              📍 {item.bairro || ''} {item.logradouro ? `• ${item.logradouro}` : ''} {item.numero ? `, nº ${item.numero}` : ''}
            </Text>
          )}

          {/* Descrição */}
          <Text style={[styles.cardDesc, { color: colors.text, fontSize: scaleFont(13) }]} numberOfLines={3}>
            {item.descricao || 'Sem descrição'}
          </Text>

          {/* Data de Registro */}
          <Text style={[styles.cardDate, { color: colors.textMuted }]}>
            Registrado em: {formatDate(item.data_registro)}
          </Text>

          {/* Foto preview */}
          {item.foto_url && (
            <Image source={{ uri: item.foto_url }} style={styles.cardImage} />
          )}

          {/* Relatório Técnico de Resolução (se já estiver concluída) */}
          {isResolved && (
            <View style={[styles.resolvedReportBox, { backgroundColor: isDark ? '#064e3b20' : '#ecfdf5', borderColor: '#05966940' }]}>
              <Text style={[styles.resolvedReportTitle, { color: '#059669', fontSize: scaleFont(11) }]}>
                ✓ Concluído por: <Text style={{ fontWeight: '800' }}>{item.resolvido_por_nome || 'Servidor Autorizado'}</Text>
              </Text>
              {item.parecer_tecnico && (
                <Text style={[styles.resolvedReportText, { color: colors.text, fontSize: scaleFont(12) }]}>
                  📝 Parecer: {item.parecer_tecnico}
                </Text>
              )}
              {item.equipe_responsavel && (
                <Text style={[styles.resolvedReportSub, { color: colors.textMuted, fontSize: scaleFont(10) }]}>
                  🚜 Equipe: {item.equipe_responsavel}
                </Text>
              )}
            </View>
          )}

          {/* Ações Técnicas para Chamados Pendentes */}
          {!isResolved && (
            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={[styles.actionBtnPrimary, { backgroundColor: '#059669' }]}
                onPress={() => abrirModalResolucao(item)}
                activeOpacity={0.85}
              >
                <Text style={[styles.actionBtnPrimaryText, { fontSize: scaleFont(13) }]}>📋 Emitir Parecer & Concluir</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBg }]}>
      {/* Header Operacional Oficial */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={[styles.backBtn, { backgroundColor: colors.bgSecondary }]}
              activeOpacity={0.7}
              accessibilityLabel="Voltar para a tela inicial"
            >
              <Text style={[styles.backBtnText, { color: colors.primary, fontSize: scaleFont(13) }]}>‹ Início</Text>
            </TouchableOpacity>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text, fontSize: scaleFont(16) }]}>
                Painel Operacional
              </Text>
              <Text style={[styles.headerSub, { color: colors.textMuted, fontSize: scaleFont(11) }]} numberOfLines={1}>
                {user.secretaria_nome || 'Prefeitura de Cachoeiras de Macacu'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.logoutMiniBtn, { backgroundColor: colors.bgSecondary }]}
            onPress={logout}
            activeOpacity={0.7}
          >
            <Text style={[styles.logoutMiniText, { color: colors.textMuted, fontSize: scaleFont(11) }]}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Info do Servidor Logado */}
        <View style={[styles.userBadgeRow, { backgroundColor: colors.primaryLight, borderColor: colors.badgeBorder }]}>
          <Text style={styles.userBadgeIcon}>👤</Text>
          <Text style={[styles.userBadgeText, { color: colors.primary, fontSize: scaleFont(12) }]} numberOfLines={1}>
            Operador: <Text style={{ fontWeight: '800' }}>{user.nome}</Text>
          </Text>
        </View>

        {/* Barra de Acessibilidade */}
        <View style={{ marginBottom: 10 }}>
          <AccessibilityBar />
        </View>

        {/* Tabs de Status */}
        <View style={[styles.tabBar, { backgroundColor: colors.bgSecondary }]}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'pendentes' && [styles.tabActive, { backgroundColor: colors.card }]]}
            onPress={() => setActiveTab('pendentes')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText, 
              { color: colors.textMuted, fontSize: scaleFont(12) },
              activeTab === 'pendentes' && [styles.tabTextActive, { color: colors.primary }]
            ]}>
              Pendentes ({pendentesCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'resolvidas' && [styles.tabActive, { backgroundColor: colors.card }]]}
            onPress={() => setActiveTab('resolvidas')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText, 
              { color: colors.textMuted, fontSize: scaleFont(12) },
              activeTab === 'resolvidas' && [styles.tabTextActive, { color: colors.primary }]
            ]}>
              Resolvidas ({resolvidasCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Ocorrências */}
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
              Carregando chamados...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: scaleFont(16) }]}>Erro de Conexão</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontSize: scaleFont(13) }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryBtn, { backgroundColor: colors.primary }]}
              onPress={() => fetchOcorrencias()}
              activeOpacity={0.8}
            >
              <Text style={[styles.retryBtnText, { fontSize: scaleFont(14) }]}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'pendentes' ? '🎉' : '📂'}
            </Text>
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: scaleFont(16) }]}>
              {activeTab === 'pendentes' ? 'Nenhum chamado pendente!' : 'Nenhuma ocorrência resolvida ainda'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
              {activeTab === 'pendentes'
                ? 'Todas as ocorrências registradas foram atendidas pela equipe.'
                : 'Ocorrências marcadas como concluídas aparecerão aqui.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => String(item.id)}
            renderItem={renderCard}
          />
        )}
      </View>

      {/* Modal Técnico Oficial de Resolução de Ocorrência */}
      <Modal
        visible={!!resolvendoItem}
        transparent
        animationType="slide"
        onRequestClose={() => setResolvendoItem(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            
            {/* Header do Modal */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(16) }]}>
                  📋 Parecer Técnico de Conclusão
                </Text>
                <Text style={[styles.modalSub, { color: colors.textMuted, fontSize: scaleFont(11) }]}>
                  Registro oficial de atendimento no SMIIC
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setResolvendoItem(null)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.bgSecondary }]}
              >
                <Text style={[styles.modalCloseText, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
              
              {/* Resumo da Ocorrência */}
              {resolvendoItem && (
                <View style={[styles.modalSummaryBox, { backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.modalSummaryCat, { color: colors.primary, fontSize: scaleFont(12) }]}>
                    #{resolvendoItem.id?.substring(0, 6)} • {resolvendoItem.categoria}
                  </Text>
                  <Text style={[styles.modalSummaryLoc, { color: colors.textMuted, fontSize: scaleFont(11) }]}>
                    📍 {resolvendoItem.bairro || 'Cachoeiras de Macacu'} {resolvendoItem.logradouro ? `(${resolvendoItem.logradouro})` : ''}
                  </Text>
                  <Text style={[styles.modalSummaryDesc, { color: colors.text, fontSize: scaleFont(12) }]} numberOfLines={2}>
                    &quot;{resolvendoItem.descricao || 'Sem descrição'}&quot;
                  </Text>
                </View>
              )}

              {/* Banner de Auditoria do Servidor */}
              <View style={[styles.servidorAuditBanner, { backgroundColor: colors.primaryLight, borderColor: colors.badgeBorder }]}>
                <Text style={styles.servidorAuditIcon}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.servidorAuditTitle, { color: colors.primary, fontSize: scaleFont(11) }]}>
                    Técnico / Responsável pelo Atendimento:
                  </Text>
                  <Text style={[styles.servidorAuditName, { color: colors.text, fontSize: scaleFont(13) }]}>
                    {user?.nome || 'Servidor Autorizado'}
                  </Text>
                  <Text style={[styles.servidorAuditSub, { color: colors.textMuted, fontSize: scaleFont(10) }]}>
                    {user?.email} • {user?.secretaria_nome || 'SMIIC'}
                  </Text>
                </View>
              </View>

              {/* Campo: Equipe / Recursos Utilizados */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text, fontSize: scaleFont(12) }]}>
                  🚜 Equipe / Viatura / Recursos Operacionais
                </Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder="Ex: Equipe 02, Viatura 104, 3 operadores..."
                  placeholderTextColor={colors.textMuted}
                  value={equipeResponsavel}
                  onChangeText={setEquipeResponsavel}
                />
              </View>

              {/* Campo: Parecer Técnico (Obrigatório) */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text, fontSize: scaleFont(12) }]}>
                  📝 Relatório Técnico das Ações Adotadas <Text style={{ color: '#ef4444' }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.formTextArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder="Descreva minuciosamente as intervenções realizadas no local (ex: desobstrução de galeria, corte de árvore, limpeza da pista, laudo de vistoria sem risco iminente)..."
                  placeholderTextColor={colors.textMuted}
                  value={parecerTecnico}
                  onChangeText={setParecerTecnico}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Botões de Ação */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: colors.bgSecondary }]}
                  onPress={() => setResolvendoItem(null)}
                  disabled={salvandoResolucao}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalCancelBtnText, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#059669', opacity: salvandoResolucao ? 0.7 : 1 }]}
                  onPress={salvarResolucaoTecnica}
                  disabled={salvandoResolucao}
                  activeOpacity={0.85}
                >
                  {salvandoResolucao ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={[styles.modalSubmitBtnText, { fontSize: scaleFont(13) }]}>
                      ✓ Gravar e Concluir
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
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
  headerTitle: {
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 11,
    maxWidth: 200,
  },
  logoutMiniBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  logoutMiniText: {
    fontWeight: '700',
  },
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  userBadgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  userBadgeText: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardStripe: {
    width: 6,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardId: {
    fontSize: 11,
    fontWeight: '700',
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  catBadgeText: {
    fontWeight: '700',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontWeight: '800',
  },
  cardAddress: {
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    lineHeight: 18,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginTop: 8,
  },
  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
  // Gate / Lock screen
  lockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  lockLogo: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  lockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  lockBadgeText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lockTitle: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  lockDesc: {
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  loginGateBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  loginGateBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
  requestGateBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  requestGateBtnText: {
    fontWeight: '700',
  },
  // Relatório de Resolução Box
  resolvedReportBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  resolvedReportTitle: {
    fontWeight: '700',
  },
  resolvedReportText: {
    lineHeight: 16,
    fontWeight: '500',
  },
  resolvedReportSub: {
    fontWeight: '600',
    marginTop: 2,
  },
  // Modal de Parecer Técnico
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontWeight: '900',
  },
  modalSub: {
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSummaryBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalSummaryCat: {
    fontWeight: '800',
    marginBottom: 2,
  },
  modalSummaryLoc: {
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSummaryDesc: {
    fontStyle: 'italic',
  },
  servidorAuditBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  servidorAuditIcon: {
    fontSize: 22,
  },
  servidorAuditTitle: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  servidorAuditName: {
    fontWeight: '800',
  },
  servidorAuditSub: {
    marginTop: 1,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontWeight: '700',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  formTextArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 90,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSubmitBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
});
