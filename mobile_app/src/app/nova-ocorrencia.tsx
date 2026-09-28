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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Header de Orientação */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🏛️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Canal Direto com o Município</Text>
            <Text style={styles.infoText}>
              Seu relato é encaminhado em tempo real para a Sala de Situação e para a Secretaria responsável.
            </Text>
          </View>
        </View>

        {/* 1. SELEÇÃO DE CATEGORIA */}
        <Text style={styles.sectionTitle}>1. Tipo de Ocorrência</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIAS.map((cat) => {
            const isSelected = categoria === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, isSelected && styles.categoryCardActive]}
                onPress={() => setCategoria(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]} numberOfLines={2}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. LOCALIZAÇÃO E GPS */}
        <Text style={styles.sectionTitle}>2. Localização do Problema</Text>
        
        {/* Botão GPS */}
        <TouchableOpacity 
          style={[styles.gpsButton, latitude !== null && styles.gpsButtonActive]} 
          onPress={obterLocalizacaoAutomatica}
          disabled={gpsLoading}
          activeOpacity={0.8}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#0f40d4" style={{ marginRight: 8 }} />
          ) : (
            <Text style={styles.gpsIcon}>{latitude !== null ? '✅' : '📍'}</Text>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.gpsButtonTitle}>
              {latitude !== null ? 'Coordenadas GPS Vinculadas' : 'Capturar Minha Localização Atual'}
            </Text>
            <Text style={styles.gpsStatusText}>{gpsStatus}</Text>
          </View>
        </TouchableOpacity>

        {/* Seletor de Bairro */}
        <Text style={styles.inputLabel}>Bairro / Região *</Text>
        <TouchableOpacity 
          style={styles.selectInput}
          onPress={() => setModalBairroVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.selectInputText}>{bairro}</Text>
          <Text style={styles.selectArrow}>▼</Text>
        </TouchableOpacity>

        {/* Rua e Número */}
        <View style={styles.row}>
          <View style={{ flex: 3, marginRight: 10 }}>
            <Text style={styles.inputLabel}>Rua / Logradouro</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Av. Floriano Peixoto"
              placeholderTextColor="#94a3b8"
              value={logradouro}
              onChangeText={setLogradouro}
            />
          </View>
          <View style={{ flex: 1.2 }}>
            <Text style={styles.inputLabel}>Número</Text>
            <TextInput
              style={styles.input}
              placeholder="Nº"
              placeholderTextColor="#94a3b8"
              value={numero}
              onChangeText={setNumero}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Ponto de Referência */}
        <Text style={styles.inputLabel}>Ponto de Referência / Complemento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Próximo à ponte, em frente ao mercado..."
          placeholderTextColor="#94a3b8"
          value={referencia}
          onChangeText={setReferencia}
        />

        {/* 3. DESCRIÇÃO */}
        <Text style={styles.sectionTitle}>3. Relato do Cidadão *</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Descreva detalhadamente a situação (ex: nível da água subindo, risco a residências, tamanho da árvore...)"
          placeholderTextColor="#94a3b8"
          value={descricao}
          onChangeText={setDescricao}
        />

        {/* 4. FOTO */}
        <Text style={styles.sectionTitle}>4. Foto do Local (Opcional)</Text>
        {imageUri ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setImageUri(null)}>
              <Text style={styles.removePhotoText}>✕ Remover Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoActionBtn} onPress={takePhoto} activeOpacity={0.7}>
              <Text style={styles.photoActionEmoji}>📸</Text>
              <Text style={styles.photoActionText}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoActionBtn} onPress={pickImage} activeOpacity={0.7}>
              <Text style={styles.photoActionEmoji}>🖼️</Text>
              <Text style={styles.photoActionText}>Abrir Galeria</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BOTÃO ENVIAR */}
        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={submitOcorrencia}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>🚀 Registrar Chamado Oficial</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Bairro / Localidade</Text>
              <TouchableOpacity onPress={() => setModalBairroVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={BAIRROS_OFICIAIS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, bairro === item && styles.modalItemActive]}
                  onPress={() => {
                    setBairro(item);
                    setModalBairroVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, bairro === item && styles.modalItemTextActive]}>
                    {item}
                  </Text>
                  {bairro === item && <Text style={styles.modalCheck}>✓</Text>}
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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 18,
    paddingBottom: 60,
  },
  // ─── Header Info ──────────────────────
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#3b82f6',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
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
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
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
  categoryCardActive: {
    borderColor: '#0f40d4',
    backgroundColor: '#eff4ff',
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  categoryLabelActive: {
    color: '#0f40d4',
    fontWeight: '800',
  },
  // ─── GPS Button ───────────────────────
  gpsButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gpsButtonActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  gpsIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  gpsButtonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  gpsStatusText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  // ─── Form Inputs ──────────────────────
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  selectInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  selectInputText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  selectArrow: {
    fontSize: 12,
    color: '#64748b',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 14,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#0f172a',
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
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
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
    backgroundColor: '#0f40d4',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f40d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  // ─── Modal Bairros ────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#f1f5f9',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalClose: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '700',
    padding: 4,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  modalItemActive: {
    backgroundColor: '#eff4ff',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalItemText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  modalItemTextActive: {
    color: '#0f40d4',
    fontWeight: '700',
  },
  modalCheck: {
    color: '#0f40d4',
    fontWeight: '800',
    fontSize: 16,
  },
});
