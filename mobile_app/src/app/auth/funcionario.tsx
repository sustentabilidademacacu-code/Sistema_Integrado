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

export default function AuthFuncionarioScreen() {
  const router = useRouter();
  const { colors, isDark, scaleFont } = useTheme();
  const { loginFuncionario, solicitarAcessoFuncionario, secretarias } = useAuth();

  const [aba, setAba] = useState<'login' | 'solicitar'>('login');
  const [loading, setLoading] = useState(false);

  // Estados de Login
  const [loginUser, setLoginUser] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Estados de Solicitação de Acesso
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState('Não informado');
  const [secretariaId, setSecretariaId] = useState(secretarias[0]?.id || '');
  const [senha, setSenha] = useState('');
  const [senhaConfirma, setSenhaConfirma] = useState('');

  // Modais
  const [modalSecVisible, setModalSecVisible] = useState(false);

  const secretariaSelecionada = secretarias.find(s => s.id === secretariaId) || secretarias[0];

  // Ação de Login do Funcionário
  const handleLogin = async () => {
    if (!loginUser.trim() || !loginSenha.trim()) {
      Alert.alert('Atenção', 'Informe seu usuário/e-mail institucional e senha.');
      return;
    }

    setLoading(true);
    const res = await loginFuncionario(loginUser, loginSenha);
    setLoading(false);

    if (res.success) {
      router.replace('/funcionario');
    } else {
      Alert.alert('Acesso Restrito', res.error || 'Credenciais inválidas.');
    }
  };

  // Ação de Solicitar Acesso
  const handleSolicitarAcesso = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe seu nome completo.');
      return;
    }
    if (!usuario.trim()) {
      Alert.alert('Atenção', 'Defina um nome de usuário institucional (ex: joao123).');
      return;
    }
    if (!emailContato.trim() || !emailContato.includes('@')) {
      Alert.alert('Atenção', 'Informe um e-mail de contato válido.');
      return;
    }
    if (!secretariaId) {
      Alert.alert('Atenção', 'Selecione a secretaria a qual você pertence.');
      return;
    }
    if (!senha || senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 dígitos.');
      return;
    }
    if (senha !== senhaConfirma) {
      Alert.alert('Atenção', 'As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    const res = await solicitarAcessoFuncionario({
      nome,
      usuarioOuEmail: usuario,
      emailContato,
      idade: idade ? parseInt(idade) : undefined,
      sexo,
      secretariaId,
      senha,
    });
    setLoading(false);

    if (res.success) {
      Alert.alert(
        'Solicitação Enviada com Sucesso!',
        'Seu cadastro de servidor público foi enviado para o Administrador do Sistema. Assim que for liberado, você poderá acessar o Painel Operacional.',
        [{ text: 'OK', onPress: () => setAba('login') }]
      );
    } else {
      Alert.alert('Erro na Solicitação', res.error || 'Não foi possível enviar a solicitação.');
    }
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
          {/* Header da Área do Funcionário */}
          <View style={styles.headerSection}>
            <Image
              source={require('../../../assets/images/prefeitura_logo.png')}
              style={styles.logoPrefeitura}
              resizeMode="contain"
            />
            <Text style={[styles.portalTitle, { color: colors.text, fontSize: scaleFont(20) }]}>
              Portal do Servidor Público
            </Text>
            <Text style={[styles.portalSubtitle, { color: colors.primary, fontSize: scaleFont(12), fontWeight: '700' }]}>
              SMIIC • Sistema Municipal Integrado de Inteligência Climática
            </Text>
            <Text style={[styles.portalSubtitle, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
              Prefeitura Municipal de Cachoeiras de Macacu
            </Text>
          </View>

          {/* Abas: Login do Servidor vs Solicitar Acesso */}
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
                Acesso Operador
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                aba === 'solicitar' && [styles.tabBtnActive, { backgroundColor: colors.card }],
              ]}
              onPress={() => setAba('solicitar')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: aba === 'solicitar' ? colors.primary : colors.textMuted, fontSize: scaleFont(14) },
                  aba === 'solicitar' && styles.tabBtnTextActive,
                ]}
              >
                Solicitar Acesso
              </Text>
            </TouchableOpacity>
          </View>

          {/* FORMULÁRIO DE LOGIN DO FUNCIONÁRIO */}
          {aba === 'login' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeIcon}>🔒</Text>
                <Text style={[styles.badgeText, { color: colors.primary, fontSize: scaleFont(12) }]}>
                  Autenticação Vinculada ao Sistema Municipal Integrado de Inteligência Climática (SMIIC)
                </Text>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Usuário Institucional / E-mail
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="Ex: joao.defesacivil ou joao@macacu.rj.gov.br"
                placeholderTextColor={colors.textMuted}
                value={loginUser}
                onChangeText={setLoginUser}
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Senha de Acesso
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="Digite sua senha de servidor"
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
                  <Text style={[styles.actionBtnText, { fontSize: scaleFont(15) }]}>Entrar no Painel Operacional</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* FORMULÁRIO DE SOLICITAÇÃO DE ACESSO */}
          {aba === 'solicitar' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: scaleFont(16) }]}>
                Solicitação de Credencial de Servidor
              </Text>
              <Text style={[styles.cardDesc, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                Preencha seus dados funcionais para envio à Sala de Situação / Administração Municipal.
              </Text>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Nome Completo *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="Ex: Carlos Eduardo dos Santos"
                placeholderTextColor={colors.textMuted}
                value={nome}
                onChangeText={setNome}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Nome de Usuário Desejado * (letras minúsculas e números)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="Ex: carlos.defesacivil"
                placeholderTextColor={colors.textMuted}
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                E-mail Pessoal / Contato Funcional *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="carlos@exemplo.com"
                placeholderTextColor={colors.textMuted}
                value={emailContato}
                onChangeText={setEmailContato}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Secretaria Municipal Vinculada *
              </Text>
              <TouchableOpacity
                style={[styles.selectInput, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => setModalSecVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectInputText, { color: colors.text, fontSize: scaleFont(13) }]} numberOfLines={2}>
                  {secretariaSelecionada?.nome || 'Selecione a Secretaria'}
                </Text>
                <Text style={[styles.selectArrow, { color: colors.textMuted }]}>▼</Text>
              </TouchableOpacity>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                    Idade (opcional)
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                    placeholder="Ex: 34"
                    placeholderTextColor={colors.textMuted}
                    value={idade}
                    onChangeText={setIdade}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                    Sexo
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                    placeholder="M / F / Outro"
                    placeholderTextColor={colors.textMuted}
                    value={sexo}
                    onChangeText={setSexo}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Definir Senha * (mínimo 6 dígitos)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="Senha de acesso"
                placeholderTextColor={colors.textMuted}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: scaleFont(13) }]}>
                Confirmar Senha *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: scaleFont(14) }]}
                placeholder="Repita a senha"
                placeholderTextColor={colors.textMuted}
                value={senhaConfirma}
                onChangeText={setSenhaConfirma}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={handleSolicitarAcesso}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.actionBtnText, { fontSize: scaleFont(15) }]}>Enviar Solicitação de Acesso</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* MODAL SELETOR DE SECRETARIAS */}
        <Modal
          visible={modalSecVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalSecVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                <Text style={[styles.modalTitle, { color: colors.text, fontSize: scaleFont(16) }]}>
                  Selecione sua Secretaria
                </Text>
                <TouchableOpacity onPress={() => setModalSecVisible(false)}>
                  <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={secretarias}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      { borderBottomColor: colors.cardBorder },
                      secretariaId === item.id && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => {
                      setSecretariaId(item.id);
                      setModalSecVisible(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.modalItemText,
                          { color: colors.textSecondary, fontSize: scaleFont(13) },
                          secretariaId === item.id && { color: colors.primary, fontWeight: '700' },
                        ]}
                      >
                        {item.nome}
                      </Text>
                    </View>
                    {secretariaId === item.id && <Text style={[styles.modalCheck, { color: colors.primary }]}>✓</Text>}
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
  badgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 64, 212, 0.08)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  badgeText: {
    flex: 1,
    fontWeight: '600',
    lineHeight: 16,
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
  row: {
    flexDirection: 'row',
    marginBottom: 14,
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
