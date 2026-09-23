import sys
import re

with open(r'C:\Users\adrie\Sistema_Integrado\frontend_web\src\app\admin\page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add states for manual creation inside PainelAdmin
manual_states = '''
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoSec, setNovoSec] = useState('');
  const [novoPerfil, setNovoPerfil] = useState('operacional');

  const handleCriacaoManual = async (e) => {
    e.preventDefault();
    if (!novoSec) return alert('Selecione uma secretaria');
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: null,
        nome_completo: novoNome,
        email_institucional: novoEmail,
        senha_provisoria: novaSenha,
        secretaria_id: novoSec,
        perfil: novoPerfil,
        admin_password: adminPass
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Conta criada diretamente com sucesso!");
      setNovoNome(""); setNovoEmail(""); setNovaSenha("");
    } else {
      alert("Erro ao criar conta: " + data.error);
    }
  };
'''

# Find PainelAdmin declaration
content = content.replace('function PainelAdmin({ onLogout, adminPass }) {', 'function PainelAdmin({ onLogout, adminPass }) {\n' + manual_states)

# Replace max-w-5xl with max-w-7xl and grid layout
old_layout = '''      <div className="max-w-5xl mx-auto p-8">'''
new_layout = '''      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">'''

content = content.replace(old_layout, new_layout)

# Close the lg:col-span-2 and add the manual creation form
old_end = '''        )}
      </div>
    </div>'''
new_end = '''        )}
        </div>

        {/* Lado Direito: Cria\u00e7\u00e3o Direta */}
        <div className="bg-[#0a234f] border border-[#133570] rounded-xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4">Criar Usuário Diretamente</h2>
          <form onSubmit={handleCriacaoManual} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
              <input required type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
              <input required type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha Provisória</label>
              <input required type="text" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Perfil</label>
              <select required value={novoPerfil} onChange={e => setNovoPerfil(e.target.value)} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-2 text-sm text-white">
                <option value="operacional">Operacional (Secretaria)</option>
                <option value="gabinete">Gabinete (War Room)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secretaria</label>
              <select required value={novoSec} onChange={e => setNovoSec(e.target.value)} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-2 text-sm text-white">
                <option value="">Selecione...</option>
                {secretariasList.map(sec => <option key={sec.id} value={sec.id}>{sec.nome}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-sm transition-colors mt-2">
              Criar e Liberar Acesso
            </button>
          </form>
        </div>
      </div>
    </div>'''

content = content.replace(old_end, new_end)

with open(r'C:\Users\adrie\Sistema_Integrado\frontend_web\src\app\admin\page.js', 'w', encoding='utf-8') as f:
    f.write(content)
