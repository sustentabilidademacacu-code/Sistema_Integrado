import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AccessibilityBar() {
  const { isDark, toggleTheme, fontScale, increaseFontSize, decreaseFontSize } = useTheme();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Botão Tema Claro / Escuro */}
      <TouchableOpacity 
        style={[styles.btn, isDark && styles.btnDark]} 
        onPress={toggleTheme}
        activeOpacity={0.7}
        accessibilityLabel={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
        accessibilityRole="button"
      >
        <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
        <Text style={[styles.btnText, isDark && styles.btnTextDark]}>
          {isDark ? 'Claro' : 'Escuro'}
        </Text>
      </TouchableOpacity>

      {/* Controle de Tamanho de Fonte (Acessibilidade) */}
      <View style={styles.fontControls}>
        <TouchableOpacity 
          style={[styles.smallBtn, isDark && styles.smallBtnDark]} 
          onPress={decreaseFontSize}
          activeOpacity={0.7}
          accessibilityLabel="Diminuir tamanho da fonte"
          accessibilityRole="button"
        >
          <Text style={[styles.fontIconText, isDark && styles.btnTextDark]}>A-</Text>
        </TouchableOpacity>

        <Text style={[styles.scaleIndicator, isDark && styles.scaleIndicatorDark]}>
          {Math.round(fontScale * 100)}%
        </Text>

        <TouchableOpacity 
          style={[styles.smallBtn, isDark && styles.smallBtnDark]} 
          onPress={increaseFontSize}
          activeOpacity={0.7}
          accessibilityLabel="Aumentar tamanho da fonte"
          accessibilityRole="button"
        >
          <Text style={[styles.fontIconText, isDark && styles.btnTextDark, { fontWeight: '800' }]}>A+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  containerDark: {
    backgroundColor: '#0a1d38',
    borderColor: '#163868',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnDark: {
    backgroundColor: '#122c54',
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  btnTextDark: {
    color: '#f8fafc',
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smallBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 26,
    alignItems: 'center',
  },
  smallBtnDark: {
    backgroundColor: '#122c54',
    borderColor: '#1e4884',
  },
  fontIconText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f40d4',
  },
  scaleIndicator: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    paddingHorizontal: 2,
  },
  scaleIndicatorDark: {
    color: '#94a3b8',
  },
});
