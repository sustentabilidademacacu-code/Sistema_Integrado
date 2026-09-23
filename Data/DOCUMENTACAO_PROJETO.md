# Documentação do Projeto: Sistema Integrado

Este arquivo contém as principais informações sobre o projeto, incluindo chaves de API, variáveis de ambiente necessárias para a hospedagem (como na Vercel), e credenciais de acesso ao painel do administrador. 
**Atenção:** Como este arquivo pode ser enviado para o GitHub, se o repositório for público, **NUNCA** deixe senhas reais aqui. Como o repositório da Secretaria é privado, é mais seguro, mas ainda assim tenha cuidado.

---

## 1. Variáveis de Ambiente (Vercel / Local)
Para que o sistema funcione corretamente, as seguintes variáveis de ambiente precisam estar configuradas tanto no arquivo `.env.local` (para rodar no seu computador) quanto nas configurações do projeto na **Vercel** (Settings > Environment Variables).

- **`NEXT_PUBLIC_SUPABASE_URL`**
  - **Valor:** `https://oawsmfizeeabuipxekci.supabase.co`
  - **Descrição:** URL do seu banco de dados e autenticação no Supabase.

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
  - **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hd3NtZml6ZWVhYnVpcHhla2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjY0NzEsImV4cCI6MjEwNTI0MjQ3MX0.AOBVjmN7vPYKSNMQhPRi2HW5_r_goEZcRUNEQGUsIKU`
  - **Descrição:** Chave pública de acesso anônimo do Supabase.

- **`GOOGLE_SHEET_ID`**
  - **Valor:** `1Hr05c-CAloZXVD3s-tc5QDhPnGjDptZJwHjGtEBcyB0`
  - **Descrição:** O ID da planilha do Google Sheets (aquele código enorme que fica no link da planilha).

- **`GOOGLE_SERVICE_ACCOUNT_EMAIL`**
  - **Valor:** `robo-api@smiic-clima.iam.gserviceaccount.com` *(Observação: antes era outro email, mas este é o atual que configuramos)*
  - **Descrição:** O email do "robô" da conta de serviço do Google Cloud que tem permissão de Editor na planilha.

- **`GOOGLE_PRIVATE_KEY`**
  - **Valor:** A chave privada gigante do Google Cloud.
  - **ATENÇÃO NA VERCEL:** Quando for colar a `GOOGLE_PRIVATE_KEY` lá na Vercel, **não coloque as aspas duplas ("...")** no começo e no final. Copie o texto exato começando de `-----BEGIN PRIVATE KEY-----` até o `-----END PRIVATE KEY-----` e cole lá. O Vercel cuida das quebras de linha.

---

## 2. Acesso de Administrador (Portal)
As credenciais de administrador (Painel de Gestão de Acessos) são exclusivas do Gabinete.

**Administrador Principal:**
- **Nome de Usuário:** `Sustentabilidade_SIMIIC`
- **Senha:** `SustentavelCLima2026@`

*Nota: Esse é o usuário "Mestre" que aprova o cadastro dos outros servidores.*

---

## 3. Links Importantes
- **Planilha de Dados (Google Sheets):**
  https://docs.google.com/spreadsheets/d/1Hr05c-CAloZXVD3s-tc5QDhPnGjDptZJwHjGtEBcyB0/edit
- **Painel do Supabase:**
  https://supabase.com/dashboard/project/oawsmfizeeabuipxekci
- **Repositório GitHub Atual:**
  https://github.com/sustentabilidademacacu-code/Sistema_Integrado

---

## 4. Como Rodar e Subir o Projeto (Vercel)

**No seu Computador (Desenvolvimento):**
1. Abra o terminal na pasta `frontend_web`.
2. Rode `npm install` (caso não tenha instalado os pacotes).
3. Rode `npm run dev`.
4. Acesse `http://localhost:3000`.

**Para subir atualizações (Vercel):**
1. No seu computador, faça o commit: `git add .`, depois `git commit -m "sua mensagem"` e `git push`.
2. **Atenção:** Sempre que fizer um push para o repositório, certifique-se de estar usando a **conta do GitHub principal** autorizada, senão a Vercel não aceitará a atualização.
3. A Vercel vai ler a atualização automaticamente e colocar o site no ar. Não precisa fazer mais nada!
