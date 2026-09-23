'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

function EyeIcon({ isOpen, onClick }) {
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
      style={{ top: '50%', transform: 'translateY(-50%)' }}
    >
      {isOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )}
    </button>
  );
}

// Mapeamento de secretarias hardcoded como fallback
const SECRETARIAS_FALLBACK = [
  { id: '11111111-1111-1111-1111-111111111111', nome: 'Gabinete do Prefeito / Sala de Situação', cor_identidade: '#fbbf24' },
  { id: '22222222-2222-2222-2222-222222222222', nome: 'Secretaria de Defesa Civil', cor_identidade: '#ea580c' },
  { id: '33333333-3333-3333-3333-333333333333', nome: 'Secretaria de Obras e Saneamento', cor_identidade: '#2563eb' },
  { id: '44444444-4444-4444-4444-444444444444', nome: 'Secretaria de Assistência Social', cor_identidade: '#c026d3' },
  { id: '55555555-5555-5555-5555-555555555555', nome: 'Secretaria de Sustentabilidade', cor_identidade: '#0e7490' },
  { id: '66666666-6666-6666-6666-666666666666', nome: 'Secretaria de Meio Ambiente', cor_identidade: '#16a34a' },
  { id: '77777777-7777-7777-7777-777777777777', nome: 'Secretaria de Saúde', cor_identidade: '#dc2626' },
  { id: '88888888-8888-8888-8888-888888888888', nome: 'AMAE', cor_identidade: '#0284c7' },
  { id: '99999999-9999-9999-9999-999999999999', nome: 'Secretaria de Agricultura', cor_identidade: '#ca8a04' },
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', nome: 'Secretaria de Infraestrutura Rural', cor_identidade: '#78350f' },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', nome: 'Vigilância Sanitária', cor_identidade: '#475569' },
  { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', nome: 'Secretaria de Educação', cor_identidade: '#4f46e5' }
];

export default function LoginWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Login State
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Request Access State
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [reqNome, setReqNome] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqSecretaria, setReqSecretaria] = useState('');
  const [reqSenha, setReqSenha] = useState('');
  const [reqSenhaConfirma, setReqSenhaConfirma] = useState('');
  const [showReqSenha, setShowReqSenha] = useState(false);
  const [showReqSenhaConfirma, setShowReqSenhaConfirma] = useState(false);
  const [reqSucesso, setReqSucesso] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [secretariasList, setSecretariasList] = useState([]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        const session = data?.session;

        if (session) {
          // Verifica se o perfil está liberado antes de considerar autenticado
          const { data: perfilData } = await supabase
            .from('solicitacao_acesso')
            .select('status, perfil, secretaria_id')
            .eq('email_institucional', session.user.email)
            .single();

          if (perfilData && perfilData.status === 'liberado') {
            setIsAuthenticated(true);
          } else {
            // Sessão existe mas usuário não está liberado — faz logout silencioso
            await supabase.auth.signOut();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Erro ao verificar sessão:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();

    supabase.from('secretarias').select('*')
      .then(({ data, error }) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setSecretariasList(data);
          setReqSecretaria(data[0].id);
        } else {
          setSecretariasList(SECRETARIAS_FALLBACK);
          setReqSecretaria(SECRETARIAS_FALLBACK[0].id);
        }
      })
      .catch(() => {
        setSecretariasList(SECRETARIAS_FALLBACK);
        setReqSecretaria(SECRETARIAS_FALLBACK[0].id);
      });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setIsLoggingIn(true);

    const formattedEmail = email.includes('@') ? email : `${email.trim().toLowerCase()}@sistema.local`;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formattedEmail,
        password: senha
      });

      if (error) {
        setErro('Credenciais inválidas. Verifique seu usuário e senha.');
        setIsLoggingIn(false);
        return;
      }

      // Buscar perfil para verificar aprovação e tipo de acesso
      const { data: perfilData, error: perfilError } = await supabase
        .from('solicitacao_acesso')
        .select('*')
        .eq('email_institucional', formattedEmail)
        .single();

      if (perfilError || !perfilData) {
        setErro('Perfil não encontrado no sistema. Contate o administrador.');
        await supabase.auth.signOut();
        setIsLoggingIn(false);
        return;
      }

      if (perfilData.status === 'analise') {
        setErro('⏳ Acesso Pendente: Sua conta está EM ANÁLISE pelo Gabinete. Tente novamente mais tarde ou entre em contato com o responsável.');
        await supabase.auth.signOut();
      } else if (perfilData.status === 'rejeitado') {
        setErro('🚫 Acesso Negado: Sua solicitação foi REJEITADA pelo Gabinete. Entre em contato para mais informações.');
        await supabase.auth.signOut();
      } else if (perfilData.status === 'liberado') {
        // Salva info da secretaria no localStorage
        const todasSecretarias = secretariasList.length > 0 ? secretariasList : SECRETARIAS_FALLBACK;
        const secretaria = todasSecretarias.find(s => String(s.id) === String(perfilData.secretaria_id));
        if (secretaria) {
          localStorage.setItem('smiic_secretaria_cor', secretaria.cor_identidade || '');
          localStorage.setItem('smiic_secretaria_nome', secretaria.nome || '');
          localStorage.setItem('smiic_secretaria_id', secretaria.id || '');
        }
        localStorage.setItem('smiic_perfil', perfilData.perfil || 'operacional');
        
        setIsAuthenticated(true);
        if (perfilData.perfil === 'gabinete') {
          window.location.href = '/gabinete';
        } else if (perfilData.perfil === 'operacional') {
          window.location.href = '/operacional';
        } else {
          window.location.href = '/gabinete';
        }
      } else {
        setErro('Status de conta desconhecido. Contate o administrador.');
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error(error);
      setErro('Erro de conexão com o servidor. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    
    if (reqSenha !== reqSenhaConfirma) {
      alert("As senhas digitadas não coincidem. Verifique e tente novamente.");
      return;
    }

    if (reqSenha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    
    const formattedReqEmail = reqEmail.includes('@') ? reqEmail : `${reqEmail.trim().toLowerCase()}@sistema.local`;

    try {
      // 1. Criar o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formattedReqEmail,
        password: reqSenha
      });

      if (authError) {
        if (authError.message?.includes('rate limit')) {
          alert("Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.");
        } else if (authError.message?.includes('already registered')) {
          alert("Este usuário já está cadastrado. Tente fazer login ou use outro nome de usuário.");
        } else {
          alert("Erro ao criar conta: " + authError.message);
        }
        setIsSubmitting(false);
        return;
      }

      // 2. Inserir a solicitação de acesso com status 'analise'
      const { error: insertError } = await supabase.from('solicitacao_acesso').insert([{
        nome_completo: reqNome,
        email_institucional: formattedReqEmail,
        secretaria_id: reqSecretaria || null,
        status: 'analise',
        perfil: 'operacional' // padrão, admin pode alterar na aprovação
      }]);

      if (insertError) {
        console.error('Erro ao salvar perfil:', insertError?.message);
        alert("Conta criada, mas houve um erro ao salvar o perfil. Contate o administrador.");
      } else {
        setReqSucesso(true);
        // Faz logout do user recém-criado para ele não entrar sem aprovação
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Para redefinir sua senha, entre em contato com o administrador do sistema (Secretaria de Sustentabilidade).');
  };

  const inputStyle = "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10";
  const inputStyleSmall = "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-10";

  const erroEhBloqueio = erro.includes('EM ANÁLISE') || erro.includes('Pendente');
  const erroEhRejeicao = erro.includes('REJEITADA') || erro.includes('Negado');

  if (isLoading) {
    return <div className="h-screen w-full bg-[#03132e] flex items-center justify-center text-slate-500">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#03132e] font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="z-10 w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center">
          
          <div className="flex gap-4 items-center mb-6">
            <img src="/prefeitura_logo_sem_fundo_quadrada.png" alt="Prefeitura" className="h-16 w-auto object-contain" />
            <div className="h-12 w-px bg-slate-300"></div>
            <img src="/logo_secretaria_logo_sem_fundo_comprida.png" alt="Sustentabilidade" className="h-12 w-auto object-contain" />
          </div>

          {!isRequestingAccess ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl font-black text-slate-900 tracking-wide">Sala de Situação</h1>
                <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">Acesso Restrito — Servidores Autorizados</p>
              </div>

              {erro && (
                <div className={`w-full border text-xs p-3 rounded-lg mb-6 text-center font-medium ${
                  erroEhRejeicao 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : erroEhBloqueio 
                      ? 'bg-orange-50 border-orange-200 text-orange-600'
                      : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  {erro}
                  {erroEhBloqueio && (
                    <p className="mt-2 text-orange-500 font-normal">
                      Quando liberado, use o mesmo usuário e senha para entrar.
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nome de Usuário</label>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao.silva"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Senha</label>
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-[10px] text-[#022888] hover:text-blue-700 font-bold transition-colors underline"
                    >
                      Esqueci a senha
                    </button>
                  </div>
                  <div className="relative w-full">
                    <input 
                      type={showSenha ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className={inputStyle}
                      required
                    />
                    <EyeIcon isOpen={showSenha} onClick={() => setShowSenha(!showSenha)} />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isLoggingIn}
                    className="w-full bg-[#022888] hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Verificando...' : 'Entrar no Sistema'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center w-full">
                <button 
                  onClick={() => setIsRequestingAccess(true)}
                  className="text-xs text-[#022888] hover:text-blue-700 font-bold transition-colors underline"
                >
                  Não possui conta? Solicite acesso
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-lg font-black text-slate-900 tracking-wide">Solicitar Acesso</h1>
                <p className="text-[10px] text-slate-500 mt-2">Preencha seus dados. O acesso será liberado após análise do Gabinete.</p>
              </div>

              {reqSucesso ? (
                <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-4 rounded-lg mb-6 text-center font-medium flex flex-col items-center gap-2">
                  <span className="text-3xl">✅</span>
                  <p className="font-bold">Solicitação enviada com sucesso!</p>
                  <p className="text-xs text-emerald-600 font-normal mt-1">
                    Seu cadastro está <strong>EM ANÁLISE</strong> pelo Gabinete do Prefeito.<br/>
                    Quando aprovado, você receberá acesso e poderá entrar com seu usuário e senha.
                  </p>
                  <button 
                    onClick={() => {
                      setIsRequestingAccess(false);
                      setReqSucesso(false);
                      setReqNome('');
                      setReqEmail('');
                      setReqSenha('');
                      setReqSenhaConfirma('');
                    }}
                    className="mt-3 text-xs text-[#022888] hover:text-blue-700 font-bold underline"
                  >
                    Voltar para o Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestAccess} className="w-full space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Nome Completo *</label>
                    <input 
                      type="text" 
                      value={reqNome}
                      onChange={(e) => setReqNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Nome de Usuário *</label>
                    <input 
                      type="text" 
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="joao.silva"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Secretaria / Órgão *</label>
                    <select 
                      value={reqSecretaria}
                      onChange={(e) => setReqSecretaria(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      required
                    >
                      {secretariasList.length === 0 && <option value="">Carregando...</option>}
                      {secretariasList.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Criar Senha *</label>
                      <div className="relative w-full">
                        <input 
                          type={showReqSenha ? "text" : "password"}
                          value={reqSenha}
                          onChange={(e) => setReqSenha(e.target.value)}
                          placeholder="Mín. 6 caracteres"
                          className={inputStyleSmall}
                          required
                          minLength={6}
                        />
                        <EyeIcon isOpen={showReqSenha} onClick={() => setShowReqSenha(!showReqSenha)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Confirmar Senha *</label>
                      <div className="relative w-full">
                        <input 
                          type={showReqSenhaConfirma ? "text" : "password"}
                          value={reqSenhaConfirma}
                          onChange={(e) => setReqSenhaConfirma(e.target.value)}
                          placeholder="Repita a senha"
                          className={inputStyleSmall}
                          required
                          minLength={6}
                        />
                        <EyeIcon isOpen={showReqSenhaConfirma} onClick={() => setShowReqSenhaConfirma(!showReqSenhaConfirma)} />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsRequestingAccess(false)}
                      className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-lg transition-all text-sm"
                    >
                      Voltar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
                    >
                      {isSubmitting ? 'Enviando...' : 'Solicitar Acesso'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="mt-8 text-center border-t border-slate-200 w-full pt-6">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Acesso exclusivo para servidores autorizados.<br/>
              Sistema Municipal Integrado de Inteligência Climática
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {children}
    </div>
  );
}