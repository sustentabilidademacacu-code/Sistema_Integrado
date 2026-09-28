import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, Polygon, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';

// Importa o contorno do município
const contornoData = require('../../assets/geojson/contorno_macacu.json');

// Coordenadas de Cachoeiras de Macacu
const MACACU_REGION = {
  latitude: -22.4628,
  longitude: -42.6528,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

// Extrai as coordenadas do polígono do GeoJSON
function getPolygonCoords(): { latitude: number; longitude: number }[] {
  try {
    const feature = contornoData.features[0];
    const coords = feature.geometry.coordinates[0];
    return coords.map((c: number[]) => ({
      latitude: c[1],
      longitude: c[0],
    }));
  } catch {
    return [];
  }
}

export default function CidadaoHome() {
  const router = useRouter();
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const contornoCoords = getPolygonCoords();

  const fetchOcorrencias = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('ocorrencias')
        .select('*')
        .order('data_registro', { ascending: false });
      setOcorrencias(data || []);
    } catch (e) {
      console.log('Erro ao carregar ocorrências:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOcorrencias();
    }, [fetchOcorrencias])
  );

  const getPinColor = (prioridade?: string) => {
    const p = prioridade?.toUpperCase();
    if (p === 'P1' || p === 'CRÍTICA' || p === 'CRITICA') return '#7e22ce'; // roxo - crítica
    if (p === 'P2' || p === 'ALTA') return '#dc2626'; // vermelho - alta
    if (p === 'P3' || p === 'MÉDIA' || p === 'MEDIA') return '#f59e0b'; // amarelo - média
    if (p === 'P4' || p === 'BAIXA') return '#f97316'; // laranja - baixa
    return '#0f40d4'; // azul default
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLogos}>
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
          <View style={styles.levelBadge}>
            <View style={styles.levelDot} />
            <Text style={styles.levelText}>Nível da Cidade: ATENÇÃO</Text>
          </View>
        </View>

        {/* Map Area — Mapa real com satélite e contorno */}
        <View style={styles.mapArea}>
          <MapView
            style={styles.map}
            initialRegion={MACACU_REGION}
            showsUserLocation={true}
            showsMyLocationButton={true}
            mapType="satellite"
          >
            {/* Contorno do município */}
            {contornoCoords.length > 0 && (
              <Polygon
                coordinates={contornoCoords}
                strokeColor="#0f40d4"
                strokeWidth={3}
                fillColor="rgba(15, 64, 212, 0.08)"
              />
            )}

            {/* Marcadores de ocorrências vindas do banco */}
            {ocorrencias
              .filter(oco => oco.latitude != null && oco.longitude != null)
              .map(oco => (
                <Marker
                  key={oco.id}
                  coordinate={{
                    latitude: Number(oco.latitude),
                    longitude: Number(oco.longitude),
                  }}
                  pinColor={getPinColor(oco.prioridade_acao)}
                >
                  <Callout>
                    <View style={styles.callout}>
                      <Text style={styles.calloutCategory}>{oco.categoria || 'Ocorrência'}</Text>
                      <Text style={styles.calloutDesc}>{oco.descricao || 'Sem descrição'}</Text>
                      {oco.logradouro && (
                        <Text style={styles.calloutAddr}>
                          📍 {oco.logradouro}{oco.numero ? `, ${oco.numero}` : ''} - {oco.bairro || oco.localidade || ''}
                        </Text>
                      )}
                    </View>
                  </Callout>
                </Marker>
              ))}
          </MapView>

          {/* Fonte */}
          <View style={styles.sourceTag}>
            <Text style={styles.sourceText}>Fonte: CIGEO — Sec. de Planejamento</Text>
          </View>
        </View>

        {/* Bottom Sheet */}
        <View style={styles.bottomSheet}>
          <View style={styles.handleBar} />

          <Text style={styles.sheetTitle}>Como podemos ajudar?</Text>
          
          {/* Alerta ativo */}
          <View style={styles.alertCard}>
            <View style={styles.alertIconWrap}>
              <Text style={styles.alertIcon}>⚠️</Text>
            </View>
            <View style={styles.alertBody}>
              <Text style={styles.alertCardTitle}>Alerta de Chuva Forte</Text>
              <Text style={styles.alertCardDesc}>
                Defesa Civil avisa: Risco de alagamento moderado nas próximas 2h.
              </Text>
            </View>
          </View>

          {/* Ações */}
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => router.push('/nova-ocorrencia')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Registrar Ocorrência</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>📋  Acompanhar Meus Chamados</Text>
          </TouchableOpacity>
        </View>

      </View>
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
    backgroundColor: '#0a192f',
  },
  // ─── Header ───────────────────────────
  header: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: 20,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  logoPrefeitura: {
    height: 44,
    width: 44,
  },
  logoSustentabilidade: {
    height: 28,
    width: 160,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fefce8',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  levelText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // ─── Map Area ─────────────────────────
  mapArea: {
    flex: 1,
    zIndex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  sourceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(10, 25, 47, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sourceText: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '600',
  },
  callout: {
    width: 200,
    padding: 4,
  },
  calloutCategory: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 3,
  },
  calloutDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 4,
  },
  calloutAddr: {
    fontSize: 10,
    color: '#64748b',
  },
  // ─── Bottom Sheet ─────────────────────
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 28,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  alertIconWrap: {
    width: 36,
    height: 36,
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertIcon: {
    fontSize: 16,
  },
  alertBody: {
    flex: 1,
  },
  alertCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991b1b',
    marginBottom: 3,
  },
  alertCardDesc: {
    fontSize: 12,
    color: '#dc2626',
    lineHeight: 17,
  },
  primaryBtn: {
    backgroundColor: '#0f40d4',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#0f40d4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 10,
  },
  primaryBtnIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '300',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});
