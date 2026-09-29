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
  FlatList 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import AccessibilityBar from '../components/AccessibilityBar';

// Categorias oficiais alinhadas ao Sistema Web
const CATEGORIAS = [
  { id: 'Alagamento', label: 'Alagamento / Inundação', icon: '🌊', prioridade: 'ALTA', secId: '22222222-2222-2222-2222-222222222222' },
  { id: 'Deslizamento de Terra', label: 'Deslizamento / Encosta', icon: '⛰️', prioridade: 'CRÍTICA', secId: '22222222-2222-2222-2222-222222222222' },
  { id: 'Queda de Árvore', label: 'Queda de Árvore', icon: '🌳', prioridade: 'MÉDIA', secId: '66666666-6666-6666-6666-666666666666' },
  { id: 'Foco de Incêndio', label: 'Foco de Incêndio / Queimada', icon: '🔥', prioridade: 'ALTA', secId: '66666666-6666-6666-6666-666666666666' },
  { id: 'Acidente Viário', label: 'Bloqueio de Via / Trânsito', icon: '🚧', prioridade: 'ALTA', secId: '33333333-3333-3333-3333-333333333333' },
  { id: 'Falta de Energia', label: 'Fiação Rompida / Luz', icon: '⚡', prioridade: 'MÉDIA', secId: '22222222-2222-2222-2222-222222222222' },
  { id: 'Erosão de Margem / Rio', label: 'Erosão / Margem de Rio', icon: '💧', prioridade: 'ALTA', secId: '66666666-6666-6666-6666-666666666666' },
  { id: 'Outros', label: 'Outros Problemas', icon: '⚠️', prioridade: 'BAIXA', secId: '11111111-1111-1111-1111-111111111111' },
];

// Bairros e localidades oficiais de Cachoeiras de Macacu
const BAIRROS_OFICIAIS = [
  'Sede (Centro / Cachoeiras)',
  'Centro - Papucaia',
  'Japuíba',
  'Guapiaçu',
  'Ribeira',
  'Veneza',
  'Sebastião Mendes',
  'Expansão',
  'Coletivo',
  'Granada',
  'Gleba Colégio',
  'Guararapes',
  'Gleba Ribeira',
  'Boca do Mato',
  'Castalia',
  'Valério',
  'Funchal',
  'Maromba',
  'Campos Elíseos',
  'Agro-Brasil',
  'Passo Fundo',
  'Outro / Zona Rural'
];

export default function NovaOcorrenciaScreen() {
  const router = useRouter();
  const { colors, isDark, scaleFont } = useTheme();

  // Form States
  const [categoria, setCategoria] = useState<string>('Alagamento');
  const [descricao, setDescricao] = useState('');
  const [bairro, setBairro] = useState('Sede (Centro / Cachoeiras)');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [referencia, setReferencia] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // GPS State
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string>('Pressione para obter GPS');

  // Modal Bairro
  const [modalBairroVisible, setModalBairroVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tentar capturar GPS ao entrar
  useEffect(() => {
    obterLocalizacaoAutomatica();
  }, []);

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

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      setGpsStatus(`GPS: ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
    } catch {
      setGpsStatus('Não foi possível obter GPS automático');
    } finally {
      setGpsLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para anexar fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para fotografar a ocorrência.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submitOcorrencia = async () => {
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'Por favor, descreva o que está acontecendo.');
      return;
    }

    if (!bairro) {
      Alert.alert('Atenção', 'Selecione o bairro da ocorrência.');
      return;
    }

    setLoading(true);
    try {
      let fotoUrl: string | null = null;

      // 1. Upload da foto se houver
      if (imageUri) {
        try {
          const fileName = imageUri.split('/').pop() || `foto_${Date.now()}.jpg`;
          const fileExt = fileName.split('.').pop() || 'jpg';
          const storagePath = `public/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const res = await fetch(imageUri);
          const blob = await res.blob();

          const { error: uploadError } = await supabase.storage
            .from('fotos-ocorrencias')
            .upload(storagePath, blob);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('fotos-ocorrencias')
              .getPublicUrl(storagePath);
            fotoUrl = publicUrlData?.publicUrl || null;
          }
        } catch (uploadErr) {
          console.log('Aviso: upload de foto ignorado ou bucket pendente:', uploadErr);
        }
      }

      // 2. Mapeamento de prioridade e secretaria conforme a categoria
      const catConfig = CATEGORIAS.find(c => c.id === categoria) || CATEGORIAS[0];
      const prioridadeFinal = catConfig.prioridade;
      const secretariaIdFinal = catConfig.secId;

      // 3. Inserir no Supabase (tabela ocorrencias)
      const { error: insertError } = await supabase
        .from('ocorrencias')
        .insert([
          {
            categoria,
            descricao: descricao.trim(),
            bairro,
            logradouro: logradouro.trim() || null,
            numero: numero.trim() || null,
            localidade: referencia.trim() || null,
            latitude: latitude || -22.4628,
            longitude: longitude || -42.6528,
            prioridade_acao: prioridadeFinal,
            status_publico: 'Pendente',
            status: 'Pendente',
            secretaria_id: secretariaIdFinal,
            foto_url: fotoUrl,
            data_registro: new Date().toISOString()
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      Alert.alert(
        'Chamado Registrado!', 
        'Sua ocorrência foi enviada com sucesso para a Prefeitura de Cachoeiras de Macacu. A equipe operacional já foi notificada.',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (error: any) {
      Alert.alert('Erro ao enviar', error.message || 'Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBg }]}>
      {/* Barra de Acessibilidade */}
      <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 2, backgroundColor: colors.headerBg }}>
        <AccessibilityBar />
      </View>

      {/* Barra Superior com Botão Voltar */}
      <View style={[styles.topNav, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
        <TouchableOpacity 
          style={[styles.navBackBtn, { backgroundColor: colors.bgSecondary }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Voltar para a tela anterior"
          accessibilityRole="button"
        >
          <Text style={[styles.navBackArrow, { color: colors.primary }]}>‹</Text>
          <Text style={[styles.navBackText, { color: colors.primary, fontSize: scaleFont(13) }]}>Voltar ao Mapa</Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text, fontSize: scaleFont(14) }]}>Registrar Ocorrência</Text>
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
        
        {/* Header de Orientação */}
        <View style={[styles.infoCard, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }]}>
          <Text style={styles.infoIcon}>🏛️</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.primary, fontSize: scaleFont(14) }]}>Canal Direto com o Município</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>
              Seu relato é encaminhado em tempo real para a Sala de Situação e para a Secretaria responsável.
            </Text>
          </View>
        </View>

        {/* 1. SELEÇÃO DE CATEGORIA */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(14) }]}>1. Tipo de Ocorrência</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIAS.map((cat) => {
            const isSelected = categoria === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard, 
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryLight, borderWidth: 2 }
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
                    { color: colors.textSecondary, fontSize: scaleFont(12) },
                    isSelected && { color: colors.primary, fontWeight: '800' }
                  ]} 
                  numberOfLines={2}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. LOCALIZAÇÃO E GPS */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(14) }]}>2. Localização do Problema</Text>
        
        {/* Botão GPS */}
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
          {gpsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
          ) : (
            <Text style={styles.gpsIcon}>{latitude !== null ? '✅' : '📍'}</Text>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.gpsButtonTitle, { color: colors.text, fontSize: scaleFont(13) }]}>
              {latitude !== null ? 'Coordenadas GPS Vinculadas' : 'Capturar Minha Localização Atual'}
            </Text>
            <Text style={[styles.gpsStatusText, { color: colors.textMuted, fontSize: scaleFont(11) }]}>{gpsStatus}</Text>
          </View>
        </TouchableOpacity>

        {/* Seletor de Bairro */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>Bairro / Região *</Text>
        <TouchableOpacity 
          style={[styles.selectInput, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => setModalBairroVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={[styles.selectInputText, { color: colors.text, fontSize: scaleFont(14) }]}>{bairro}</Text>
          <Text style={[styles.selectArrow, { color: colors.textMuted }]}>▼</Text>
        </TouchableOpacity>

        {/* Rua e Número */}
        <View style={styles.row}>
          <View style={{ flex: 3, marginRight: 10 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>Rua / Logradouro</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
              placeholder="Ex: Av. Floriano Peixoto"
              placeholderTextColor={colors.textMuted}
              value={logradouro}
              onChangeText={setLogradouro}
            />
          </View>
          <View style={{ flex: 1.2 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>Número</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
              placeholder="Nº"
              placeholderTextColor={colors.textMuted}
              value={numero}
              onChangeText={setNumero}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Ponto de Referência */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>Ponto de Referência / Complemento</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
          placeholder="Ex: Próximo à ponte, em frente ao mercado..."
          placeholderTextColor={colors.textMuted}
          value={referencia}
          onChangeText={setReferencia}
        />

        {/* 3. DESCRIÇÃO */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(14) }]}>3. Relato do Cidadão *</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
          multiline
          numberOfLines={4}
          placeholder="Descreva detalhadamente a situação (ex: nível da água subindo, risco a residências, tamanho da árvore...)"
          placeholderTextColor={colors.textMuted}
          value={descricao}
          onChangeText={setDescricao}
        />

        {/* 4. FOTO */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scaleFont(14) }]}>4. Foto do Local (Opcional)</Text>
        {imageUri ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setImageUri(null)}>
              <Text style={styles.removePhotoText}>✕ Remover Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoActions}>
            <TouchableOpacity 
              style={[styles.photoActionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} 
              onPress={takePhoto} 
              activeOpacity={0.7}
            >
              <Text style={styles.photoActionEmoji}>📸</Text>
              <Text style={[styles.photoActionText, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.photoActionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} 
              onPress={pickImage} 
              activeOpacity={0.7}
            >
              <Text style={styles.photoActionEmoji}>🖼️</Text>
              <Text style={[styles.photoActionText, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>Abrir Galeria</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BOTÃO ENVIAR */}
        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: colors.primary }, loading && styles.submitBtnDisabled]}
          onPress={submitOcorrencia}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.submitBtnText, { fontSize: scaleFont(16) }]}>🚀 Registrar Chamado Oficial</Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL SELETOR DE BAIRROS */}
      <Modal
        visible={modalBairroVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalBairroVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(16) }]}>Selecione o Bairro / Localidade</Text>
              <TouchableOpacity onPress={() => setModalBairroVisible(false)}>
                <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={BAIRROS_OFICIAIS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem, 
                    { borderBottomColor: colors.cardBorder },
                    bairro === item && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => {
                    setBairro(item);
                    setModalBairroVisible(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.modalItemText, 
                      { color: colors.textSecondary, fontSize: scaleFont(14) },
                      bairro === item && { color: colors.primary, fontWeight: '700' }
                    ]}
                  >
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
  safeArea: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  navBackArrow: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 4,
    lineHeight: 20,
  },
  navBackText: {
    fontWeight: '700',
  },
  navTitle: {
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 60,
  },
  // ─── Header Info ──────────────────────
  infoCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  infoIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontWeight: '800',
    marginBottom: 2,
  },
  infoText: {
    lineHeight: 16,
  },
  sectionTitle: {
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // ─── Categorias Grid ───────────────────
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
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
  categoryIcon: {
    fontSize: 22,
  },
  categoryLabel: {
    fontWeight: '600',
    flex: 1,
  },
  // ─── GPS Button ───────────────────────
  gpsButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gpsIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  gpsButtonTitle: {
    fontWeight: '700',
  },
  gpsStatusText: {
    marginTop: 1,
  },
  // ─── Form Inputs ──────────────────────
  inputLabel: {
    fontWeight: '700',
    marginBottom: 6,
  },
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
  selectInputText: {
    fontWeight: '600',
  },
  selectArrow: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 14,
  },
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
  // ─── Foto Actions ─────────────────────
  photoActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  photoActionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  photoActionText: {
    fontWeight: '700',
  },
  imagePreviewWrap: {
    marginBottom: 28,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  removePhotoBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removePhotoText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 12,
  },
  // ─── Submit Button ────────────────────
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  // ─── Modal Bairros ────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  modalTitle: {
    fontWeight: '800',
  },
  modalClose: {
    fontSize: 18,
    fontWeight: '700',
    padding: 4,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontWeight: '500',
  },
  modalCheck: {
    fontWeight: '800',
    fontSize: 16,
  },
});
