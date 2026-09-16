'use client';

import { useState, useEffect } from 'react';

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
    const token = localStorage.getItem('smiic_auth_token');
    const perfil = localStorage.getItem('smiic_perfil');
    const pathname = window.location.pathname;

    if (token) {
      // Se tiver token, tá autenticado
      setIsAuthenticated(true);
      
      // Proteção de Rotas: se a pessoa tá na raiz, manda pro lugar certo
      if (pathname === '/') {
        if (perfil === 'gabinete') window.location.href = '/gabinete';
        else window.location.href = '/operacional';
      }
      // Se é operador tentando acessar o gabinete:
      else if (pathname.startsWith('/gabinete') && perfil === 'operacional') {
        window.location.href = '/operacional';
      }
      // Se é gabinete tentando acessar operacional:
      else if (pathname.startsWith('/operacional') && perfil === 'gabinete') {
        window.location.href = '/gabinete';
      }
    }
    
    setIsLoading(false);

    fetch('http://127.0.0.1:8000/api/secretarias/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSecretariasList(data);
          if (data.length > 0) {
            setReqSecretaria(data[0].id);
          }
        }
      })
      .catch(err => console.error("Erro ao carregar secretarias:", err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/mvp-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      if (res.status === 401 || res.status === 400) {
        setErro('Credenciais inválidas. Verifique seu e-mail e senha.');
        setIsLoggingIn(false);
        return;
      }

      const data = await res.json();

      if (data.status_auth === 'analise') {
        setErro('Acesso Pendente: Sua conta ainda está EM ANÁLISE pelo Gabinete. Tente novamente mais tarde.');
      } else if (data.status_auth === 'rejeitado') {
        setErro('Acesso Negado: Sua solicitação foi REJEITADA pelo Gabinete.');
      } else if (data.status_auth === 'liberado') {
        localStorage.setItem('smiic_auth_token', data.token);
        localStorage.setItem('smiic_perfil', data.perfil);
        localStorage.setItem('smiic_secretaria_id', data.secretaria_id || '');
        localStorage.setItem('smiic_secretaria_nome', data.secretaria_nome || '');
        localStorage.setItem('smiic_secretaria_cor', data.cor_identidade || '#022888');
        
        if (data.perfil === 'gabinete') {
          window.location.href = '/gabinete';
        } else {
          window.location.href = '/operacional';
        }
      }
    } catch (error) {
      console.error(error);
      setErro('Erro de conexão com o servidor do Gabinete.');
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

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/solicitacoes-acesso/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_completo: reqNome,
          email_institucional: reqEmail,
          secretaria: reqSecretaria,
          senha_provisoria: reqSenha
        })
      });

      if (response.ok) {
        setReqSucesso(true);
      } else {
        alert("Erro ao enviar cadastro. Verifique os dados.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smiic_auth_token');
    setIsAuthenticated(false);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Para redefinir sua senha, por favor entre em contato diretamente com o Administrador do Sistema (Gabinete).');
  };

  const EyeIcon = ({ isOpen, onClick }) => (
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

  const inputStyle = "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10";
  const inputStyleSmall = "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-10";

  if (isLoading) {
    return <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-slate-500">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 font-sans relative overflow-hidden">
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
                <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">Acesso Restrito</p>
              </div>

              {erro && (
                <div className={`w-full border text-xs p-3 rounded-lg mb-6 text-center font-medium ${
                  erro.includes('REJEITADA') || erro.includes('inválidas') ? 'bg-red-50 border-red-200 text-red-600' : 'bg-orange-50 border-orange-200 text-orange-600'
                }`}>
                  {erro}
                </div>
              )}

              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">E-mail Institucional</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="servidor@cachoeiras.rj.gov.br"
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
                  Não possui conta? Cadastre-se e aguarde liberação
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-lg font-black text-slate-900 tracking-wide">Criar Conta Institucional</h1>
                <p className="text-[10px] text-slate-500 mt-2">Preencha seus dados. O acesso à Sala de Situação será liberado após análise do Gabinete.</p>
              </div>

              {reqSucesso ? (
                <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-4 rounded-lg mb-6 text-center font-medium flex flex-col items-center gap-2">
                  <span className="text-2xl">✅</span>
                  Conta criada com sucesso! Seu acesso está EM ANÁLISE pelo Gabinete. Tente fazer login mais tarde para verificar a liberação.
                  <button 
                    onClick={() => {
                      setIsRequestingAccess(false);
                      setReqSucesso(false);
                      setReqNome('');
                      setReqEmail('');
                      setReqSenha('');
                      setReqSenhaConfirma('');
                    }}
                    className="mt-4 text-xs text-[#022888] hover:text-blue-700 font-bold underline"
                  >
                    Voltar para o Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestAccess} className="w-full space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Nome Completo</label>
                    <input 
                      type="text" 
                      value={reqNome}
                      onChange={(e) => setReqNome(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">E-mail Institucional</label>
                    <input 
                      type="email" 
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="servidor@cachoeiras.rj.gov.br"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Secretaria / Órgão</label>
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
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Crie uma Senha</label>
                      <div className="relative w-full">
                        <input 
                          type={showReqSenha ? "text" : "password"}
                          value={reqSenha}
                          onChange={(e) => setReqSenha(e.target.value)}
                          placeholder="Mínimo 6"
                          className={inputStyleSmall}
                          required
                          minLength={6}
                        />
                        <EyeIcon isOpen={showReqSenha} onClick={() => setShowReqSenha(!showReqSenha)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Confirmar Senha</label>
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
                      {isSubmitting ? 'Enviando...' : 'Criar Conta'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="mt-8 text-center border-t border-slate-200 w-full pt-6">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Acesso exclusivo para servidores autorizados.<br/>
              O cidadão deve acessar via Aplicativo Oficial.
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
