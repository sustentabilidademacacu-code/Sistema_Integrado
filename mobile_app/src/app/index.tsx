import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Background decorativo */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        {/* Logo Section */}
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

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.appName}>Sistema Integrado</Text>
          <Text style={styles.subtitle}>Cachoeiras de Macacu</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>
            Plataforma de monitoramento e gestão municipal integrada
          </Text>
        </View>

        {/* Botões de perfil */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cidadaoButton}
            onPress={() => router.push('/cidadao')}
            activeOpacity={0.85}
          >
            <View style={styles.buttonIconContainer}>
              <Text style={styles.buttonIcon}>🏘️</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Sou Cidadão</Text>
              <Text style={styles.buttonDesc}>Registrar ocorrências e alertas</Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.funcionarioButton}
            onPress={() => router.push('/funcionario')}
            activeOpacity={0.85}
          >
            <View style={[styles.buttonIconContainer, { backgroundColor: '#eef2ff' }]}>
              <Text style={styles.buttonIcon}>🏛️</Text>
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Sou Funcionário</Text>
              <Text style={styles.buttonDesc}>Painel operacional de atendimento</Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secretaria de Sustentabilidade e Meio Ambiente
          </Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(15, 64, 212, 0.06)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(15, 64, 212, 0.04)',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoPrefeitura: {
    height: 80,
    width: 80,
    marginBottom: 12,
  },
  logoSustentabilidade: {
    height: 36,
    width: 200,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0a2b8e',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#0f40d4',
    borderRadius: 2,
    marginVertical: 16,
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 14,
  },
  cidadaoButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f40d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e8edf5',
  },
  funcionarioButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f40d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e8edf5',
  },
  buttonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonIcon: {
    fontSize: 22,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  buttonDesc: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '400',
  },
  buttonArrow: {
    fontSize: 28,
    color: '#cbd5e1',
    fontWeight: '300',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
  footerVersion: {
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 4,
  },
});
