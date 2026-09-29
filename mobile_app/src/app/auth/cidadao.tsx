import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AccessibilityBar from '../../components/AccessibilityBar';

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

export default function AuthCidadaoScreen() {
  const router = useRouter();
  const { colors, isDark, scaleFont } = useTheme();
  const { loginCidadao, cadastroCidadao, loginVisitante, redefinirSenhaCidadao } = useAuth();

  const [aba, setAba] = useState<'login' | 'cadastro'>('login');
  const [loading, setLoading] = useState(false);

  // Estados de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Estados de Cadastro
  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadTelefone, setCadTelefone] = useState('');
  const [cadBairro, setCadBairro] = useState('Sede (Centro / Cachoeiras)');
  const [cadSenha, setCadSenha] = useState('');
  const [cadSenhaConfirma, setCadSenhaConfirma] = useState('');

  // Modais
  const [modalBairroVisible, setModalBairroVisible] = useState(false);
  const [modalResetVisible, setModalResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Ação de Login
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginSenha.trim()) {
      Alert.alert('Atenção', 'Informe seu e-mail e sua senha para entrar.');
      return;
    }

    setLoading(true);
    const res = await loginCidadao(loginEmail, loginSenha);
    setLoading(false);

    if (res.success) {
      router.replace('/cidadao');
    } else {
      Alert.alert('Falha no Acesso', res.error || 'Não foi possível entrar.');
    }
  };

  // Ação de Cadastro
  const handleCadastro = async () => {
    if (!cadNome.trim()) {
      Alert.alert('Atenção', 'Informe seu nome completo.');
      return;
    }
    if (!cadEmail.trim() || !cadEmail.includes('@')) {
      Alert.alert('Atenção', 'Informe um e-mail válido.');
      return;
    }
    if (!cadSenha || cadSenha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (cadSenha !== cadSenhaConfirma) {
      Alert.alert('Atenção', 'As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    const res = await cadastroCidadao({
      nome: cadNome,
      email: cadEmail,
      telefone: cadTelefone,
      bairro: cadBairro,
      senha: cadSenha,
    });
    setLoading(false);

    if (res.success) {
      Alert.alert(
        'Conta Criada com Sucesso!',
        'Seja bem-vindo ao aplicativo oficial de Cachoeiras de Macacu.',
        [{ text: 'Acessar Mapa', onPress: () => router.replace('/cidadao') }]
      );
    } else {
      Alert.alert('Erro ao Criar Conta', res.error || 'Ocorreu um erro ao criar a conta.');
    }
  };

  // Ação de Esqueci Minha Senha
  const handleResetPassword = async () => {
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      Alert.alert('Atenção', 'Informe o e-mail cadastrado para receber o link de redefinição.');
      return;
    }

    setResetLoading(true);
    const res = await redefinirSenhaCidadao(resetEmail);
    setResetLoading(false);

    if (res.success) {
      setModalResetVisible(false);
      Alert.alert(
        'E-mail Enviado!',
        'Enviamos as instruções e o link de redefinição de senha para o seu e-mail. Verifique sua caixa de entrada e spam.',
        [{ text: 'OK' }]
      );
      setResetEmail('');
    } else {
      Alert.alert('Erro', res.error || 'Não foi possível enviar o e-mail de recuperação.');
    }
  };

  // Ação Visitante (Pular Login)
  const handleVisitante = async () => {
    await loginVisitante();
    router.replace('/cidadao');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Topo com Acessibilidade e Botão Voltar */}
        <View style={[styles.topBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.bgSecondary }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Voltar à tela inicial"
            accessibilityRole="button"
          >
            <Text style={[styles.backArrow, { color: colors.primary }]}>‹</Text>
            <Text style={[styles.backText, { color: colors.primary, fontSize: scaleFont(13) }]}>Início</Text>
          </TouchableOpacity>
          <AccessibilityBar />
        </View>

        <ScrollView
          style={[styles.container, { backgroundColor: colors.bg }]}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header da Área do Cidadão */}
          <View style={styles.headerSection}>
            <Image
              source={require('../../../assets/images/prefeitura_logo.png')}
              style={styles.logoPrefeitura}
              resizeMode="contain"
            />
            <Text style={[styles.portalTitle, { color: colors.text, fontSize: scaleFont(20) }]}>
              Área do Cidadão
            </Text>
            <Text style={[styles.portalSubtitle, { color: colors.primary, fontSize: scaleFont(12), fontWeight: '700' }]}>
              SMIIC • Sistema Municipal Integrado de Inteligência Climática
            </Text>
            <Text style={[styles.portalSubtitle, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
              Prefeitura Municipal de Cachoeiras de Macacu
            </Text>
          </View>

          {/* Abas Alternáveis: Entrar vs Criar Conta */}
          <View style={[styles.tabContainer, { backgroundColor: colors.bgSecondary }]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                aba === 'login' && [styles.tabBtnActive, { backgroundColor: colors.card }],
              ]}
              onPress={() => setAba('login')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: aba === 'login' ? colors.primary : colors.textMuted, fontSize: scaleFont(14) },
                  aba === 'login' && styles.tabBtnTextActive,
                ]}
              >
                Já tenho conta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                aba === 'cadastro' && [styles.tabBtnActive, { backgroundColor: colors.card }],
              ]}
              onPress={() => setAba('cadastro')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: aba === 'cadastro' ? colors.primary : colors.textMuted, fontSize: scaleFont(14) },
                  aba === 'cadastro' && styles.tabBtnTextActive,
                ]}
              >
                Criar Conta
              </Text>
            </TouchableOpacity>
          </View>

          {/* FORMULÁRIO DE LOGIN */}
          {aba === 'login' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: scaleFont(16) }]}>
                Acesse sua Conta
              </Text>
              <Text style={[styles.cardDesc, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                Acompanhe alertas em tempo real e registre ocorrências no seu bairro.
              </Text>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                E-mail Cadastrado
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="exemplo@email.com"
                placeholderTextColor={colors.textMuted}
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                  Senha de Acesso
                </Text>
                <TouchableOpacity onPress={() => { setResetEmail(loginEmail); setModalResetVisible(true); }}>
                  <Text style={[styles.forgotPasswordText, { color: colors.primary, fontSize: scaleFont(12) }]}>
                    Esqueci minha senha
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.textMuted}
                value={loginSenha}
                onChangeText={setLoginSenha}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.actionBtnText, { fontSize: scaleFont(15) }]}>Entrar no Aplicativo</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* FORMULÁRIO DE CADASTRO */}
          {aba === 'cadastro' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: scaleFont(16) }]}>
                Cadastro do Cidadão
              </Text>
              <Text style={[styles.cardDesc, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                Cadastre-se para registrar ocorrências geolocalizadas e acompanhar avisos meteorológicos e ambientais em tempo real.
              </Text>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Nome Completo *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="Ex: João da Silva"
                placeholderTextColor={colors.textMuted}
                value={cadNome}
                onChangeText={setCadNome}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                E-mail Principal *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="seu.email@exemplo.com"
                placeholderTextColor={colors.textMuted}
                value={cadEmail}
                onChangeText={setCadEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                WhatsApp / Telefone de Contato
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="(21) 99999-9999"
                placeholderTextColor={colors.textMuted}
                value={cadTelefone}
                onChangeText={setCadTelefone}
                keyboardType="phone-pad"
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Bairro onde mora em Cachoeiras *
              </Text>
              <TouchableOpacity
                style={[styles.selectInput, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => setModalBairroVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectInputText, { color: colors.text, fontSize: scaleFont(14) }]}>{cadBairro}</Text>
                <Text style={[styles.selectArrow, { color: colors.textMuted }]}>▼</Text>
              </TouchableOpacity>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Criar Senha * (mínimo 6 dígitos)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.textMuted}
                value={cadSenha}
                onChangeText={setCadSenha}
                secureTextEntry
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Confirmar Senha *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="Repita sua senha"
                placeholderTextColor={colors.textMuted}
                value={cadSenhaConfirma}
                onChangeText={setCadSenhaConfirma}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={handleCadastro}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.actionBtnText, { fontSize: scaleFont(15) }]}>Concluir Cadastro e Entrar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* OPÇÃO DE ENTRAR COMO VISITANTE */}
          <View style={styles.visitanteWrap}>
            <TouchableOpacity
              style={[styles.visitanteBtn, { borderColor: colors.cardBorder }]}
              onPress={handleVisitante}
              activeOpacity={0.7}
            >
              <Text style={[styles.visitanteBtnText, { color: colors.primary, fontSize: scaleFont(13) }]}>
                🧭 Continuar sem login (Acesso Rápido ao Mapa)
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* MODAL REDEFINIR SENHA POR E-MAIL */}
        <Modal
          visible={modalResetVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalResetVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(16) }]}>
                  Recuperar Senha
                </Text>
                <TouchableOpacity onPress={() => setModalResetVisible(false)}>
                  <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalDesc, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
                Digite seu e-mail cadastrado. Enviaremos um link seguro para você criar uma nova senha.
              </Text>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                E-mail Cadastrado
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="seu.email@exemplo.com"
                placeholderTextColor={colors.textMuted}
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 10 }]}
                onPress={handleResetPassword}
                disabled={resetLoading}
                activeOpacity={0.85}
              >
                {resetLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.actionBtnText, { fontSize: scaleFont(14) }]}>Enviar Link de Redefinição</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
                <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(16) }]}>
                  Selecione seu Bairro
                </Text>
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
                      cadBairro === item && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => {
                      setCadBairro(item);
                      setModalBairroVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        { color: colors.textSecondary, fontSize: scaleFont(14) },
                        cadBairro === item && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {item}
                    </Text>
                    {cadBairro === item && <Text style={[styles.modalCheck, { color: colors.primary }]}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 4,
    lineHeight: 20,
  },
  backText: {
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPrefeitura: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  portalTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  portalSubtitle: {
    marginTop: 2,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontWeight: '600',
  },
  tabBtnTextActive: {
    fontWeight: '800',
  },
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 18,
  },
  cardTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDesc: {
    marginBottom: 16,
    lineHeight: 16,
  },
  inputLabel: {
    fontWeight: '700',
    marginBottom: 6,
  },
  forgotPasswordText: {
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
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
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
  visitanteWrap: {
    alignItems: 'center',
    marginTop: 6,
  },
  visitanteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  visitanteBtnText: {
    fontWeight: '700',
  },
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
  modalDesc: {
    lineHeight: 18,
    marginBottom: 16,
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
