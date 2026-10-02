import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  FlatList,
  Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import AccessibilityBar from '../components/AccessibilityBar';

// ─── Contato Defesa Civil ────────────────────────────────────────────
const DEFESA_CIVIL_TEL = '(21) 95947-9945';
const DEFESA_CIVIL_TEL_RAW = '+5521959479945';

// Categorias alinhadas à Sala de Situação e Defesa Civil
const CATEGORIAS = [
  {
    id: 'Alagamento',
    label: 'Alagamento / Inundação',
    icon: '🌊',
    prioridade: 'ALTA',
    secId: '22222222-2222-2222-2222-222222222222',
    descExemplo: 'Ex: Rua alagada, água subindo, acesso bloqueado...',
    cor: '#1d4ed8'
  },
  {
    id: 'Deslizamento de Terra',
    label: 'Deslizamento / Encosta',
    icon: '⛰️',
    prioridade: 'CRÍTICA',
    secId: '22222222-2222-2222-2222-222222222222',
    descExemplo: 'Ex: Terra cedendo, trinca em muro, encosta instável...',
    cor: '#b45309'
  },
  {
    id: 'Queda de Árvore',
    label: 'Queda de Árvore / Galho',
    icon: '🌳',
    prioridade: 'MÉDIA',
    secId: '66666666-6666-6666-6666-666666666666',
    descExemplo: 'Ex: Árvore caída na via, galho sobre fio, risco de queda...',
    cor: '#15803d'
  },
  {
    id: 'Foco de Incêndio',
    label: 'Incêndio / Queimada',
    icon: '🔥',
    prioridade: 'ALTA',
    secId: '66666666-6666-6666-6666-666666666666',
    descExemplo: 'Ex: Queimada em mata, foco de fumaça, área em chamas...',
    cor: '#dc2626'
  },

  {
    id: 'Erosão de Margem / Rio',
    label: 'Rio / Erosão / Margem',
    icon: '💧',
    prioridade: 'ALTA',
    secId: '66666666-6666-6666-6666-666666666666',
    descExemplo: 'Ex: Nível do rio subindo, erosão na margem...',
    cor: '#0891b2'
  },
  {
    id: 'Chuva Intensa',
    label: 'Chuva Intensa / Temporal',
    icon: '🌧️',
    prioridade: 'MÉDIA',
    secId: '22222222-2222-2222-2222-222222222222',
    descExemplo: 'Ex: Chuva muito forte, granizo, raios constantes na região...',
    cor: '#475569'
  },

];

// Bairros e localidades de Cachoeiras de Macacu
const LOCALIDADES = [
  "Agrobrasil",
  "Anil",
  "Areal",
  "Areia Branca",
  "Belem de Taua",
  "Bengala",
  "Bertholdo Duarte",
  "Boa Sorte",
  "Boca do Mato",
  "Bom Jardim",
  "Castalia",
  "Cavada",
  "Derribada",
  "Duas Barras",
  "Estreito",
  "Farao de Baixo",
  "Farao de Cima",
  "Funchal",
  "Gleba Colegio",
  "Gleba Ribeira",
  "Granada",
  "Guapiacu",
  "Imbira",
  "Ipiranga",
  "Itaperiti",
  "Jaguari",
  "Japuiba",
  "Joao Paulo",
  "Lagoinha",
  "Marapora",
  "Marubai",
  "Matumbo",
  "Meio da Serra",
  "Morro Frio",
  "Morro do Ceu",
  "Nova Ribeira",
  "Papucaia",
  "Papucainha",
  "Patis",
  "Pedreira",
  "Pena",
  "Porto Taboado",
  "Quizanga",
  "Rabelo",
  "Raiz da Serra",
  "Rio do Mato",
  "Santa Fe",
  "Santa Maria",
  "Santo Amaro",
  "Sao Joaquim",
  "Sao Jose da Boa Morte",
  "Sao Miguel",
  "Sebastiana",
  "Sede",
  "Serra Queimada",
  "Setenta",
  "Soarinho",
  "Tocas",
  "Tres Manilhas",
  "Valerio",
  "Vecchi"
];

const BAIRROS = [
  "Areia Branca",
  "Betel",
  "Boa Vista",
  "Boca do Mato",
  "Campo do Prado",
  "Castália",
  "Centro - Cachoeiras",
  "Centro - Japuíba",
  "Centro - Papucaia",
  "Cidade Alta",
  "Coletivo",
  "Expansão",
  "Forno Velho",
  "Ganguri",
  "Gleba Colégio",
  "Gleba Ribeira",
  "Granada",
  "Guararapes",
  "Marreca",
  "Parque Santa Luiza",
  "Parque Veneza",
  "Pedreira",
  "Poço Verde",
  "Raiz da Serra",
  "Raposo",
  "Rasgo",
  "Ribeira",
  "Santo Antônio",
  "São Francisco de Assis",
  "Sebastião Mendes",
  "Tuim",
  "Valério",
  "Várzea",
  "Veneza",
  "Vilage",
  "Viracoopos"
];

export default function NovaOcorrenciaScreen() {
  const router = useRouter();
  const { colors, isDark, scaleFont } = useTheme();

  const [categoria, setCategoria] = useState<string>('Alagamento');
  const [descricao, setDescricao] = useState('');
  const [localidade, setLocalidade] = useState('Sede');
  const [bairro, setBairro] = useState('');
  const [referencia, setReferencia] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [termoAceito, setTermoAceito] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string>('Pressione para obter GPS');
  const [modalLocalidadeVisible, setModalLocalidadeVisible] = useState(false);
  const [modalBairroVisible, setModalBairroVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { obterLocalizacaoAutomatica(); }, []);

  const catAtual = CATEGORIAS.find(c => c.id === categoria) || CATEGORIAS[0];

  const ligarDefesaCivil = () => {
    Linking.openURL(`tel:${DEFESA_CIVIL_TEL_RAW}`).catch(() => {
      Alert.alert('Não foi possível abrir o discador.', `Ligue manualmente: ${DEFESA_CIVIL_TEL}`);
    });
  };

  const obterLocalizacaoAutomatica = async () => {
    try {
      setGpsLoading(true);
      setGpsStatus('Buscando sinal GPS...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsStatus('Permissão de GPS não concedida');
        setGpsLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      setGpsStatus(`✅ GPS: ${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
    } catch {
      setGpsStatus('GPS automático indisponível — toque para tentar novamente');
    } finally {
      setGpsLoading(false);
    }
  };

  const pickImage = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) { Alert.alert('Permissão necessária', 'Permita o acesso à galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) { Alert.alert('Permissão necessária', 'Permita o acesso à câmera.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const submitOcorrencia = async () => {
    if (!descricao.trim()) {
      Alert.alert('Campo obrigatório', 'Descreva brevemente o que está acontecendo no local.');
      return;
    }
    if (!localidade) { Alert.alert('Campo obrigatório', 'Selecione a localidade.'); return; }
    if (!termoAceito) {
      Alert.alert('Confirmação necessária', 'Confirme que entende que este canal é apenas para AVISO e mapeamento — não aciona resgate.');
      return;
    }

    setLoading(true);
    try {
      let fotoUrl: string | null = null;
      if (imageUri) {
        try {
          const fileName = imageUri.split('/').pop() || `foto_${Date.now()}.jpg`;
          const fileExt = fileName.split('.').pop() || 'jpg';
          const storagePath = `public/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const res = await fetch(imageUri);
          const blob = await res.blob();
          const { error: uploadError } = await supabase.storage.from('fotos-ocorrencias').upload(storagePath, blob);
          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from('fotos-ocorrencias').getPublicUrl(storagePath);
            fotoUrl = publicUrlData?.publicUrl || null;
          }
        } catch (uploadErr) {
          console.log('Upload ignorado:', uploadErr);
        }
      }

      const catConfig = CATEGORIAS.find(c => c.id === categoria) || CATEGORIAS[0];
      const { error: insertError } = await supabase.from('ocorrencias').insert([{
        categoria,
        descricao: (descricao.trim() + (referencia.trim() ? '\n\nReferência: ' + referencia.trim() : '')),
        localidade,
        bairro: bairro || null,
        latitude: latitude || -22.4628,
        longitude: longitude || -42.6528,
        prioridade_acao: catConfig.prioridade,
        status_publico: 'Pendente',
        status: 'Pendente',
        secretaria_id: catConfig.secId,
        foto_url: fotoUrl,
        data_registro: new Date().toISOString()
      }]);

      if (insertError) throw insertError;

      Alert.alert(
        '✅ Aviso Enviado!',
        `Sua informação foi registrada para mapeamento pela Sala de Situação.\n\nEm caso de risco à vida, ligue AGORA:\n\n🚨 Defesa Civil: ${DEFESA_CIVIL_TEL}\n🚨 Nacional: 199`,
        [{ text: 'Entendido', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Erro ao enviar', error.message || 'Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBg }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 2, backgroundColor: colors.headerBg }}>
        <AccessibilityBar />
      </View>

      {/* Barra Superior */}
      <View style={[styles.topNav, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
        <TouchableOpacity
          style={[styles.navBackBtn, { backgroundColor: colors.bgSecondary }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Text style={[styles.navBackArrow, { color: colors.primary }]}>‹</Text>
          <Text style={[styles.navBackText, { color: colors.primary, fontSize: scaleFont(13) }]}>Voltar ao Mapa</Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text, fontSize: scaleFont(14) }]}>Avisar Situação</Text>
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>

        {/* ──── BOTÃO DE EMERGÊNCIA — DESTAQUE MÁXIMO ──── */}
        <TouchableOpacity
          style={styles.emergenciaBtn}
          onPress={ligarDefesaCivil}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Ligar para Defesa Civil de Cachoeiras de Macacu"
        >
          <View style={styles.emergenciaBtnLeft}>
            <Text style={styles.emergenciaBtnIcon}>🚨</Text>
            <View>
              <Text style={styles.emergenciaBtnLabel}>EMERGÊNCIA? LIGUE AGORA</Text>
              <Text style={styles.emergenciaBtnTel}>{DEFESA_CIVIL_TEL}</Text>
              <Text style={styles.emergenciaBtnSub}>Defesa Civil · Cachoeiras de Macacu</Text>
            </View>
          </View>
          <View style={styles.emergenciaBtnCallIcon}>
            <Text style={styles.emergenciaBtnCallText}>📞</Text>
          </View>
        </TouchableOpacity>

        {/* ──── DISCLAIMER LEGAL ──── */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚠️ AVISO LEGAL IMPORTANTE</Text>
          <Text style={styles.disclaimerText}>
            {'Este formulário é um canal de '}
            <Text style={{ fontWeight: '900' }}>AVISO e MAPEAMENTO</Text>
            {' para a Sala de Situação.\n\n'}
            <Text style={{ fontWeight: '900' }}>NÃO aciona resgate, viatura ou equipe de socorro.</Text>
            {'\nSe houver risco à vida, use o botão vermelho acima para ligar imediatamente.'}
          </Text>
        </View>

        {/* ──── INFO CARD ──── */}
        <View style={[styles.infoCard, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }]}>
          <Text style={styles.infoIcon}>📍</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.primary, fontSize: scaleFont(14) }]}>Mapeamento Cidadão</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
              Informe situações de risco ou condições climáticas na sua região para auxiliar o mapeamento da Defesa Civil e equipes operacionais.
            </Text>
          </View>
        </View>

        {/* ──── 1. TIPO DE SITUAÇÃO ──── */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(14) }]}>1. Tipo de Situação</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIAS.map((cat) => {
            const isSelected = categoria === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  isSelected && { borderColor: cat.cor, borderWidth: 2 }
                ]}
                onPress={() => setCategoria(cat.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Selecionar ${cat.label}`}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: colors.textSecondary, fontSize: scaleFont(11.5) },
                    isSelected && { color: cat.cor, fontWeight: '800' }
                  ]}
                  numberOfLines={2}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ──── 2. LOCALIZAÇÃO ──── */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(14) }]}>2. Localização</Text>

        {/* GPS */}
        <TouchableOpacity
          style={[
            styles.gpsButton,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
            latitude !== null && { backgroundColor: isDark ? '#064e3b' : '#f0fdf4', borderColor: '#22c55e' }
          ]}
          onPress={obterLocalizacaoAutomatica}
          disabled={gpsLoading}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          {gpsLoading
            ? <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 10 }} />
            : <Text style={styles.gpsIcon}>{latitude !== null ? '✅' : '📍'}</Text>
          }
          <View style={{ flex: 1 }}>
            <Text style={[styles.gpsButtonTitle, { color: colors.text, fontSize: scaleFont(13) }]}>
              {latitude !== null ? 'Coordenadas GPS Vinculadas' : 'Capturar Minha Localização'}
            </Text>
            <Text style={[styles.gpsStatusText, { color: colors.textMuted, fontSize: scaleFont(11) }]}>{gpsStatus}</Text>
          </View>
        </TouchableOpacity>

        {/* Localidade */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>Localidade *</Text>
        <TouchableOpacity
          style={[styles.selectInput, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => setModalLocalidadeVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={[styles.selectInputText, { color: colors.text, fontSize: scaleFont(14) }]}>{localidade || 'Selecione a localidade...'}</Text>
          <Text style={[styles.selectArrow, { color: colors.textMuted }]}>▼</Text>
        </TouchableOpacity>

        {/* Bairro */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>Bairro (Opcional)</Text>
        <TouchableOpacity
          style={[styles.selectInput, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => setModalBairroVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={[styles.selectInputText, { color: colors.text, fontSize: scaleFont(14) }]}>{bairro || 'Selecione o bairro...'}</Text>
          <Text style={[styles.selectArrow, { color: colors.textMuted }]}>▼</Text>
        </TouchableOpacity>

        {/* Referência */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>Ponto de Referência</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
          placeholder="Ex: Próximo à ponte, em frente ao mercado..."
          placeholderTextColor={colors.textMuted}
          value={referencia}
          onChangeText={setReferencia}
        />

        {/* ──── 3. DESCRIÇÃO ──── */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(14) }]}>3. Descreva a Situação *</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
          multiline
          numberOfLines={4}
          placeholder={catAtual.descExemplo}
          placeholderTextColor={colors.textMuted}
          value={descricao}
          onChangeText={setDescricao}
        />

        {/* ──── 4. FOTO ──── */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(14) }]}>4. Foto do Local (Ajuda muito!)</Text>
        {imageUri ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setImageUri(null)}>
              <Text style={styles.removePhotoText}>✕ Remover Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoActions}>
            <TouchableOpacity style={[styles.photoActionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={takePhoto} activeOpacity={0.7}>
              <Text style={styles.photoActionEmoji}>📸</Text>
              <Text style={[styles.photoActionText, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoActionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={pickImage} activeOpacity={0.7}>
              <Text style={styles.photoActionEmoji}>🖼️</Text>
              <Text style={[styles.photoActionText, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>Abrir Galeria</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ──── TERMO DE CIÊNCIA ──── */}
        <TouchableOpacity
          style={[styles.checkboxContainer, { borderColor: termoAceito ? '#22c55e' : colors.cardBorder }]}
          onPress={() => setTermoAceito(!termoAceito)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, { borderColor: colors.cardBorder }, termoAceito && styles.checkboxChecked]}>
            {termoAceito && <Text style={styles.checkboxCheckmark}>✓</Text>}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            {'Declaro que compreendo que este formulário é apenas para '}
            <Text style={{ fontWeight: 'bold' }}>AVISO e mapeamento</Text>
            {' e '}
            <Text style={{ fontWeight: 'bold' }}>NÃO aciona resgate</Text>
            {`. Em emergências, ligarei para ${DEFESA_CIVIL_TEL}.`}
          </Text>
        </TouchableOpacity>

        {/* ──── BOTÃO ENVIAR ──── */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: termoAceito ? colors.primary : '#94a3b8' },
            (!termoAceito || loading) && styles.submitBtnDisabled
          ]}
          onPress={submitOcorrencia}
          disabled={loading || !termoAceito}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={[styles.submitBtnText, { fontSize: scaleFont(16) }]}>📤 Enviar Aviso de Situação</Text>
              {!termoAceito && (
                <Text style={[styles.submitBtnSub, { fontSize: scaleFont(11) }]}>Marque a confirmação acima primeiro</Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {/* ──── RODAPÉ EMERGÊNCIA ──── */}
        <TouchableOpacity style={styles.footerEmergencia} onPress={ligarDefesaCivil} activeOpacity={0.8}>
          <Text style={styles.footerEmergenciaText}>
            🚨 Emergência? Defesa Civil: {DEFESA_CIVIL_TEL} · Toque para ligar
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL LOCALIDADE */}
      <Modal visible={modalLocalidadeVisible} transparent animationType="slide" onRequestClose={() => setModalLocalidadeVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(16) }]}>Selecione a Localidade</Text>
              <TouchableOpacity onPress={() => setModalLocalidadeVisible(false)}>
                <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={LOCALIDADES}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.cardBorder }, localidade === item && { backgroundColor: colors.primaryLight }]}
                  onPress={() => { setLocalidade(item); setBairro(''); setModalLocalidadeVisible(false); }}
                >
                  <Text style={[styles.modalItemText, { color: colors.textSecondary, fontSize: scaleFont(14) }, localidade === item && { color: colors.primary, fontWeight: '700' }]}>{item}</Text>
                  {localidade === item && <Text style={[styles.modalCheck, { color: colors.primary }]}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL BAIRROS */}
      <Modal
        visible={modalBairroVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalBairroVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(16) }]}>Selecione o Bairro</Text>
              <TouchableOpacity onPress={() => setModalBairroVisible(false)}>
                <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={BAIRROS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.cardBorder }, bairro === item && { backgroundColor: colors.primaryLight }]}
                  onPress={() => { setBairro(item); setModalBairroVisible(false); }}
                >
                  <Text style={[styles.modalItemText, { color: colors.textSecondary, fontSize: scaleFont(14) }, bairro === item && { color: colors.primary, fontWeight: '700' }]}>
                    {item}
                  </Text>
                  {bairro === item && <Text style={[styles.modalCheck, { color: colors.primary }]}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navBackBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  navBackArrow: { fontSize: 20, fontWeight: '800', marginRight: 4, lineHeight: 20 },
  navBackText: { fontWeight: '700' },
  navTitle: { fontWeight: '800' },
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 60 },

  // ─── Botão Emergência ─────────────────────────────────
  emergenciaBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  emergenciaBtnLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  emergenciaBtnIcon: { fontSize: 30, marginRight: 12 },
  emergenciaBtnLabel: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  emergenciaBtnTel: { color: '#fff', fontWeight: '900', fontSize: 20, letterSpacing: 0.5 },
  emergenciaBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 1 },
  emergenciaBtnCallIcon: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10 },
  emergenciaBtnCallText: { fontSize: 22 },

  // ─── Disclaimer Legal ─────────────────────────────────
  disclaimerCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  disclaimerTitle: { color: '#78350f', fontWeight: '900', fontSize: 13, marginBottom: 6 },
  disclaimerText: { color: '#92400e', fontSize: 12, lineHeight: 18 },

  // ─── Info Card ────────────────────────────────────────
  infoCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  infoIcon: { fontSize: 26, marginRight: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontWeight: '800', marginBottom: 2 },
  infoText: { lineHeight: 16 },

  sectionTitle: {
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ─── Categorias ───────────────────────────────────────
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  categoryCard: {
    width: '48.5%',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryIcon: { fontSize: 22 },
  categoryLabel: { fontWeight: '600', flex: 1 },

  // ─── GPS ──────────────────────────────────────────────
  gpsButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gpsIcon: { fontSize: 22, marginRight: 10 },
  gpsButtonTitle: { fontWeight: '700' },
  gpsStatusText: { marginTop: 1 },

  // ─── Inputs ───────────────────────────────────────────
  inputLabel: { fontWeight: '700', marginBottom: 6 },
  selectInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  selectInputText: { fontWeight: '600' },
  selectArrow: { fontSize: 12 },
  row: { flexDirection: 'row', marginBottom: 14 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 20,
    lineHeight: 20,
  },

  // ─── Foto ─────────────────────────────────────────────
  photoActions: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  photoActionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActionEmoji: { fontSize: 24, marginBottom: 4 },
  photoActionText: { fontWeight: '700' },
  imagePreviewWrap: { marginBottom: 28, alignItems: 'center' },
  imagePreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 8 },
  removePhotoBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  removePhotoText: { color: '#dc2626', fontWeight: '700', fontSize: 12 },

  // ─── Checkbox Termo ───────────────────────────────────
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#94a3b8',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  checkboxCheckmark: { color: '#fff', fontWeight: '900', fontSize: 14 },
  checkboxLabel: { flex: 1, fontSize: 12, lineHeight: 18 },

  // ─── Submit ───────────────────────────────────────────
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '800', letterSpacing: 0.3 },
  submitBtnSub: { color: 'rgba(255,255,255,0.7)', marginTop: 3 },

  // ─── Rodapé Emergência ────────────────────────────────
  footerEmergencia: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  footerEmergenciaText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ─── Modal Bairros ────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%', padding: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  modalTitle: { fontWeight: '800' },
  modalClose: { fontSize: 18, fontWeight: '700', padding: 4 },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalItemText: { fontWeight: '500' },
  modalCheck: { fontWeight: '800', fontSize: 16 },
});