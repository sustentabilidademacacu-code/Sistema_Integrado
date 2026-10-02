const fs = require('fs');

const locs = ['Agrobrasil','Anil','Areal','Areia Branca','Belem de Taua','Bengala','Bertholdo Duarte','Boa Sorte','Boca do Mato','Bom Jardim','Castalia','Cavada','Derribada','Duas Barras','Estreito','Farao de Baixo','Farao de Cima','Funchal','Gleba Colegio','Gleba Ribeira','Granada','Guapiacu','Imbira','Ipiranga','Itaperiti','Jaguari','Japuiba','Joao Paulo','Lagoinha','Marapora','Marubai','Matumbo','Meio da Serra','Morro Frio','Morro do Ceu','Nova Ribeira','Papucaia','Papucainha','Patis','Pedreira','Pena','Porto Taboado','Quizanga','Rabelo','Raiz da Serra','Rio do Mato','Santa Fe','Santa Maria','Santo Amaro','Sao Joaquim','Sao Jose da Boa Morte','Sao Miguel','Sebastiana','Sede','Serra Queimada','Setenta','Soarinho','Tocas','Tres Manilhas','Valerio','Vecchi'];
const bairs = ['Areia Branca','Betel','Boa Vista','Boca do Mato','Campo do Prado','Castália','Centro - Cachoeiras','Centro - Japuíba','Centro - Papucaia','Cidade Alta','Coletivo','Expansão','Forno Velho','Ganguri','Gleba Colégio','Gleba Ribeira','Granada','Guararapes','Marreca','Parque Santa Luiza','Parque Veneza','Pedreira','Poço Verde','Raiz da Serra','Raposo','Rasgo','Ribeira','Santo Antônio','São Francisco de Assis','Sebastião Mendes','Tuim','Valério','Várzea','Veneza','Vilage','Viracoopos'];

function updateNovaOcorrencia() {
  const path = 'mobile_app/src/app/nova-ocorrencia.tsx';
  let content = fs.readFileSync(path, 'utf8');

  // Replace array
  content = content.replace(/const BAIRROS_OFICIAIS = \[[\\s\\S]*?\];/, 'const LOCALIDADES = ' + JSON.stringify(locs, null, 2) + ';\nconst BAIRROS = ' + JSON.stringify(bairs, null, 2) + ';');

  // Replace state
  content = content.replace(/const \[bairro, setBairro\] = useState\('Sede \(Centro \/ Cachoeiras\)'\);/, 'const [localidade, setLocalidade] = useState(\'Sede\');\n  const [bairro, setBairro] = useState(\'\');');
  
  // Replace modal state
  content = content.replace(/const \[modalBairroVisible, setModalBairroVisible\] = useState\(false\);/, 'const [modalLocalidadeVisible, setModalLocalidadeVisible] = useState(false);\n  const [modalBairroVisible, setModalBairroVisible] = useState(false);');

  // Replace validation
  content = content.replace(/if \(!bairro\) \{[\s\S]*?\}/, 'if (!localidade) { Alert.alert(\'Campo obrigatório\', \'Selecione a localidade.\'); return; }');

  // Replace submit payload
  content = content.replace(/bairro,\n        logradouro/, 'localidade,\n        bairro: bairro || null,\n        logradouro');
  content = content.replace(/localidade: referencia\.trim\(\) \|\| null,\n/, '');
  content = content.replace(/descricao: descricao\.trim\(\),/, 'descricao: (descricao.trim() + (referencia.trim() ? \'\\n\\nReferência: \' + referencia.trim() : \'\')),');

  // Replace UI inputs
  const uiBairroLocalidade = `{/* Localidade */}
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
        </TouchableOpacity>`;

  content = content.replace(/\{\/\* Bairro \*\/\}\s*<Text style=\{.*Bairro \/ Localidade \*<\/Text>\s*<TouchableOpacity[\s\S]*?<\/TouchableOpacity>/, uiBairroLocalidade);

  // Modals UI
  const modalLocalidade = `{/* MODAL LOCALIDADE */}
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
      </Modal>`;

  content = content.replace(/data=\{BAIRROS_OFICIAIS\}/, 'data={BAIRROS}');
  content = content.replace('{/* MODAL BAIRROS */}', modalLocalidade + '\\n\\n      {/* MODAL BAIRROS */}');
  
  // also change bairro === item to just handle bairro
  content = content.replace(/setBairro\(item\); setModalBairroVisible\(false\);/, "setBairro(item); setModalBairroVisible(false);");

  fs.writeFileSync(path, content);
}

function updateAuthCidadao() {
  const path = 'mobile_app/src/app/auth/cidadao.tsx';
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(/const BAIRROS_OFICIAIS = \[[\\s\\S]*?\];/, 'const LOCALIDADES = ' + JSON.stringify(locs, null, 2) + ';\nconst BAIRROS = ' + JSON.stringify(bairs, null, 2) + ';');
  
  content = content.replace(/const \[cadBairro, setCadBairro\] = useState\('Sede \(Centro \/ Cachoeiras\)'\);/, 'const [cadLocalidade, setCadLocalidade] = useState(\'Sede\');\n  const [cadBairro, setCadBairro] = useState(\'\');');
  
  content = content.replace(/const \[modalBairroVisible, setModalBairroVisible\] = useState\(false\);/, 'const [modalLocalidadeVisible, setModalLocalidadeVisible] = useState(false);\n  const [modalBairroVisible, setModalBairroVisible] = useState(false);');

  content = content.replace(/bairro: cadBairro,/, 'bairro: cadBairro || null,\n      localidade: cadLocalidade,');

  const uiBairroLocalidade = `{/* Localidade */}
                <View style={styles.inputWrap}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>Localidade</Text>
                  <TouchableOpacity style={[styles.selectInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]} onPress={() => setModalLocalidadeVisible(true)}>
                    <Text style={{ color: colors.text, fontSize: scaleFont(14) }}>{cadLocalidade}</Text>
                    <Text style={{ color: colors.textMuted }}>▼</Text>
                  </TouchableOpacity>
                </View>

                {/* Bairro */}
                <View style={styles.inputWrap}>
                  <Text style={[styles.label, { color: colors.textSecondary, fontSize: scaleFont(12) }]}>Bairro (Opcional)</Text>
                  <TouchableOpacity style={[styles.selectInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]} onPress={() => setModalBairroVisible(true)}>
                    <Text style={{ color: colors.text, fontSize: scaleFont(14) }}>{cadBairro || 'Selecione o bairro...'}</Text>
                    <Text style={{ color: colors.textMuted }}>▼</Text>
                  </TouchableOpacity>
                </View>`;

  content = content.replace(/<View style=\{styles\.inputWrap\}>\s*<Text style=\{.*\}Bairro \/ Localidade<\/Text>\s*<TouchableOpacity style=\{.*\} onPress=\{.*setModalBairroVisible.*>\s*<Text style=\{.*\}>\{cadBairro\}<\/Text>\s*<Text style=\{.*\}>▼<\/Text>\s*<\/TouchableOpacity>\s*<\/View>/, uiBairroLocalidade);

  const modalLocalidade = `{/* MODAL LOCALIDADE */}
      <Modal visible={modalLocalidadeVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Selecione a Localidade</Text>
              <TouchableOpacity onPress={() => setModalLocalidadeVisible(false)}>
                <Text style={{ fontSize: 18, color: colors.textMuted, padding: 4 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={LOCALIDADES}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.cardBorder }, cadLocalidade === item && { backgroundColor: colors.primaryLight }]}
                  onPress={() => { setCadLocalidade(item); setCadBairro(''); setModalLocalidadeVisible(false); }}
                >
                  <Text style={[styles.modalItemText, { color: colors.textSecondary }, cadLocalidade === item && { color: colors.primary, fontWeight: '700' }]}>{item}</Text>
                  {cadLocalidade === item && <Text style={{ color: colors.primary, fontWeight: '800' }}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>`;

  content = content.replace(/data=\{BAIRROS_OFICIAIS\}/, 'data={BAIRROS}');
  content = content.replace('{/* Modal de Bairros */}', modalLocalidade + '\\n\\n      {/* Modal de Bairros */}');

  fs.writeFileSync(path, content);
}

try {
  updateNovaOcorrencia();
  updateAuthCidadao();
  console.log("Updated both files successfully.");
} catch(err) {
  console.error("Error updating files:", err);
}
