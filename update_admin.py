import sys

with open(r'C:\Users\adrie\Sistema_Integrado\frontend_web\src\app\admin\page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the AdminLoginScreen onLogin to pass the password
content = content.replace('onLogin();', 'onLogin(pass);')

# Fix AdminPage component
old_admin_page = '''export default function AdminPage() {
  const [adminLogado, setAdminLogado] = useState(false);

  if (!adminLogado) {
    return <AdminLoginScreen onLogin={() => setAdminLogado(true)} />;
  }

  return <PainelAdmin onLogout={() => setAdminLogado(false)} />;
}'''

new_admin_page = '''export default function AdminPage() {
  const [adminLogado, setAdminLogado] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  if (!adminLogado) {
    return <AdminLoginScreen onLogin={(pass) => { setAdminLogado(true); setAdminPass(pass); }} />;
  }

  return <PainelAdmin onLogout={() => setAdminLogado(false)} adminPass={adminPass} />;
}'''

content = content.replace(old_admin_page, new_admin_page)

# Fix PainelAdmin to receive adminPass
content = content.replace('function PainelAdmin({ onLogout }) {', 'function PainelAdmin({ onLogout, adminPass }) {')

# Rewrite handleUpdateStatus
old_handle = '''const handleUpdateStatus = async (id, novoStatus) => {
    const perfilEscolhido = perfisEscolhidos[id] || 'operacional';
    try {
      const updateData = { status: novoStatus };
      if (novoStatus === 'liberado') {
        updateData.perfil = perfilEscolhido;
      }

      const { error } = await supabase
        .from('solicitacao_acesso')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      setSolicitacoes(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar solicita\u00e7\u00e3o. Tente novamente.');
    }
  };'''

new_handle = '''const handleUpdateStatus = async (id, novoStatus) => {
    const perfilEscolhido = perfisEscolhidos[id] || 'operacional';
    const sol = solicitacoes.find(s => s.id === id);
    
    if (!sol) return;

    try {
      if (novoStatus === 'liberado') {
        const res = await fetch("/api/admin/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: sol.id,
            nome_completo: sol.nome_completo,
            email_institucional: sol.email_institucional,
            senha_provisoria: sol.senha_provisoria,
            secretaria_id: sol.secretaria_id,
            perfil: perfilEscolhido,
            admin_password: adminPass
          })
        });

        const data = await res.json();
        if (res.ok) {
          alert("Usuário aprovado e conta criada no Supabase!");
          setSolicitacoes(prev => prev.filter(s => s.id !== id));
        } else {
          alert("Erro: " + data.error);
        }
      } else {
        const res = await fetch("/api/admin/reject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, admin_password: adminPass })
        });
        if (res.ok) {
          alert("Solicitação rejeitada.");
          setSolicitacoes(prev => prev.filter(s => s.id !== id));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao processar. Verifique o console.');
    }
  };'''

# Since reading UTF-8 with strange characters might miss exact replace, we'll use regex if needed
import re
content = re.sub(r'const handleUpdateStatus = async.*?alert\(\'Erro ao atualizar solicita.*?}\n  };', new_handle, content, flags=re.DOTALL)

with open(r'C:\Users\adrie\Sistema_Integrado\frontend_web\src\app\admin\page.js', 'w', encoding='utf-8') as f:
    f.write(content)
