import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AccessibilityBar from '../components/AccessibilityBar';

export default function Index() {
  const router = useRouter();
  const { isDark, colors, scaleFont } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const handleCidadaoClick = () => {
    if (user && user.tipo === 'cidadao') {
      router.push('/cidadao');
    } else {
      router.push('/auth/cidadao');
    }
  };

  const handleFuncionarioClick = () => {
    if (user && user.tipo === 'funcionario') {
      router.push('/funcionario');
    } else {
      router.push('/auth/funcionario');
    }
  };

  const ligarEmergencia = (num: string) => {
    Linking.openURL(`tel:${num}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Background Decorativo */}
        <View style={[styles.bgCircle1, isDark && styles.bgCircleDark1]} />
        <View style={[styles.bgCircle2, isDark && styles.bgCircleDark2]} />

        {/* Bloco Superior */}
        <View style={styles.topSection}>
          {/* Barra Superior Apenas com Acessibilidade */}
          <View style={styles.topNav}>
            <View style={{ flex: 1 }} />
            <AccessibilityBar />
          </View>

          {/* Logos Oficiais */}
          <View style={styles.logoSection}>
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

          {/* Nome do Sistema e Município */}
          <View style={styles.titleSection}>
            <Text style={[styles.appName, { color: colors.text, fontSize: scaleFont(19) }]}>
              Sistema Municipal Integrado de Inteligência Climática (SMIIC)
            </Text>
            <Text style={[styles.subtitle, { color: colors.primary, fontSize: scaleFont(15) }]}>
              Cachoeiras de Macacu
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.primary }]} />
            <Text style={[styles.description, { color: colors.textMuted, fontSize: scaleFont(13) }]}>
              Plataforma oficial de monitoramento climático e gestão de ocorrências municipais
            </Text>
          </View>

          {/* Sessão Ativa (se já logado) */}
          {isAuthenticated && user && (
            <View style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sessionGreeting, { color: colors.textMuted, fontSize: scaleFont(11) }]}>
                  Conectado como:
                </Text>
                <Text style={[styles.sessionName, { color: colors.text, fontSize: scaleFont(14) }]} numberOfLines={1}>
                  {user.nome} ({user.tipo === 'funcionario' ? user.secretaria_nome || 'Servidor' : user.bairro || 'Cidadão'})
                </Text>
              </View>
              <TouchableOpacity onPress={logout} style={styles.sessionLogoutBtn}>
                <Text style={[styles.sessionLogoutText, { color: colors.primary, fontSize: scaleFont(12) }]}>Trocar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botões Diretos de Acesso (Cidadão e Funcionário) */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cidadaoButton, { backgroundColor: colors.primary }]}
              onPress={handleCidadaoClick}
              activeOpacity={0.85}
              accessibilityLabel="Entrar como Cidadão"
              accessibilityRole="button"
            >
              <View style={styles.buttonIconContainer}>
                <Text style={styles.buttonIcon}>🏘️</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={[styles.buttonTitle, { fontSize: scaleFont(16) }]}>Sou Cidadão</Text>
                <Text style={[styles.buttonDesc, { fontSize: scaleFont(12) }]}>Registrar ocorrências e consultar alertas</Text>
              </View>
              <Text style={styles.buttonArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.funcionarioButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={handleFuncionarioClick}
              activeOpacity={0.85}
              accessibilityLabel="Entrar como Funcionário"
              accessibilityRole="button"
            >
              <View style={[styles.buttonIconContainer, { backgroundColor: isDark ? '#122c54' : '#eef2ff' }]}>
                <Text style={styles.buttonIcon}>🏛️</Text>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={[styles.buttonTitleFunc, { color: colors.text, fontSize: scaleFont(16) }]}>
                  Sou Funcionário
                </Text>
                <Text style={[styles.buttonDescFunc, { color: colors.textMuted, fontSize: scaleFont(12) }]}>
                  Painel operacional de atendimento
                </Text>
              </View>
              <Text style={[styles.buttonArrowFunc, { color: colors.textMuted }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Canais de Emergência (Discagem Rápida) */}
          <View style={[styles.emergencyContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.emergencyHeading, { color: colors.textSecondary, fontSize: scaleFont(11) }]}>
              🚨 CANAIS DE EMERGÊNCIA (DISCAGEM RÁPIDA)
            </Text>
            <View style={styles.emergencyGrid}>
              <TouchableOpacity 
                style={[styles.emergencyButton, { backgroundColor: '#dc2626' }]}
                onPress={() => ligarEmergencia('199')}
                activeOpacity={0.8}
              >
                <Text style={styles.emergencyNum}>199</Text>
                <Text style={styles.emergencyName}>Defesa Civil</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.emergencyButton, { backgroundColor: '#ea580c' }]}
                onPress={() => ligarEmergencia('193')}
                activeOpacity={0.8}
              >
                <Text style={styles.emergencyNum}>193</Text>
                <Text style={styles.emergencyName}>Bombeiros</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.emergencyButton, { backgroundColor: '#0284c7' }]}
                onPress={() => ligarEmergencia('192')}
                activeOpacity={0.8}
              >
                <Text style={styles.emergencyNum}>192</Text>
                <Text style={styles.emergencyName}>SAMU</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.emergencyButton, { backgroundColor: '#475569' }]}
                onPress={() => ligarEmergencia('153')}
                activeOpacity={0.8}
              >
                <Text style={styles.emergencyNum}>153</Text>
                <Text style={styles.emergencyName}>Guarda</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Rodapé Institucional no Fundo da Tela */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: scaleFont(11) }]}>
            Secretaria Municipal de Sustentabilidade, Clima, Recursos Hídricos, Ecossistema e Projetos Estratégicos
          </Text>
          <Text style={[styles.footerSub, { color: colors.textMuted, fontSize: scaleFont(10) }]}>
            Prefeitura Municipal de Cachoeiras de Macacu
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  topSection: {
    width: '100%',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
    zIndex: 10,
  },
  bgCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#e0e7ff',
    opacity: 0.35,
    top: -60,
    right: -60,
  },
  bgCircleDark1: {
    backgroundColor: '#0c2242',
    opacity: 0.5,
  },
  bgCircle2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#dbeafe',
    opacity: 0.3,
    bottom: 40,
    left: -60,
  },
  bgCircleDark2: {
    backgroundColor: '#0a1d38',
    opacity: 0.5,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
    marginTop: 4,
  },
  logoPrefeitura: {
    height: 60,
    width: 60,
  },
  logoSustentabilidade: {
    height: 36,
    width: 180,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  appName: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  subtitle: {
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginVertical: 12,
  },
  description: {
    textAlign: 'center',
    lineHeight: 18,
  },
  // Sessão Ativa
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
  },
  sessionGreeting: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sessionName: {
    fontWeight: '800',
    marginTop: 1,
  },
  sessionLogoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sessionLogoutText: {
    fontWeight: '700',
  },
  // Botões Cidadão e Funcionário
  buttonContainer: {
    width: '100%',
    gap: 14,
    marginBottom: 22,
  },
  cidadaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#0f40d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  buttonIcon: {
    fontSize: 22,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    color: '#fff',
    fontWeight: '800',
  },
  buttonDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  buttonArrow: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  funcionarioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonTitleFunc: {
    fontWeight: '800',
  },
  buttonDescFunc: {
    marginTop: 2,
  },
  buttonArrowFunc: {
    fontSize: 24,
    fontWeight: '700',
  },
  // Emergência Box
  emergencyContainer: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  emergencyHeading: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  emergencyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  emergencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyNum: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  emergencyName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 9,
    marginTop: 2,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 'auto',
  },
  footerText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerSub: {
    marginTop: 4,
    textAlign: 'center',
  },
});
