import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface UserSession {
  tipo: 'cidadao' | 'funcionario' | 'visitante';
  id?: string;
  nome: string;
  email: string;
  bairro?: string;
  telefone?: string;
  secretaria_id?: string;
  secretaria_nome?: string;
  secretaria_cor?: string;
  perfil?: string;
  status?: string;
}

export interface SecretariaItem {
  id: string;
  nome: string;
  sigla?: string;
  cor_identidade?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginCidadao: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  cadastroCidadao: (dados: {
    nome: string;
    email: string;
    telefone: string;
    bairro: string;
    senha: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginFuncionario: (usuarioOuEmail: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  solicitarAcessoFuncionario: (dados: {
    nome: string;
    usuarioOuEmail: string;
    emailContato: string;
    idade?: number;
    sexo?: string;
    secretariaId: string;
    senha: string;
  }) => Promise<{ success: boolean; error?: string }>;
  redefinirSenhaCidadao: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginVisitante: () => Promise<void>;
  logout: () => Promise<void>;
  secretarias: SecretariaItem[];
  carregarSecretarias: () => Promise<void>;
}

const SECRETARIAS_FALLBACK: SecretariaItem[] = [
  { id: '11111111-1111-1111-1111-111111111111', nome: 'Gabinete do Prefeito', sigla: 'GABINETE', cor_identidade: '#f59e0b' },
  { id: 'sec-procuradoria', nome: 'Procuradoria Geral', sigla: 'PROCURADORIA', cor_identidade: '#475569' },
  { id: 'sec-controladoria', nome: 'Controladoria Geral', sigla: 'CONTROLADORIA', cor_identidade: '#64748b' },
  { id: 'sec-governo', nome: 'Secretaria Municipal de Governo e Casa Civil', sigla: 'GOVERNO', cor_identidade: '#1e3a8a' },
  { id: 'sec-administracao', nome: 'Secretaria Municipal de Administração', sigla: 'ADMINISTRACAO', cor_identidade: '#0284c7' },
  { id: 'sec-fazenda', nome: 'Secretaria Municipal de Fazenda', sigla: 'FAZENDA', cor_identidade: '#059669' },
  { id: 'sec-planejamento', nome: 'Secretaria Municipal de Planejamento, Habitação e Geoprocessamento', sigla: 'PLANEJAMENTO', cor_identidade: '#0d9488' },
  { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', nome: 'Secretaria Municipal de Educação', sigla: 'EDUCACAO', cor_identidade: '#6366f1' },
  { id: '77777777-7777-7777-7777-777777777777', nome: 'Secretaria Municipal de Saúde', sigla: 'SAUDE', cor_identidade: '#e11d48' },
  { id: '44444444-4444-4444-4444-444444444444', nome: 'Secretaria Municipal de Assistencia Social e Políticas para Mulher', sigla: 'ASSISTENCIA_SOCIAL', cor_identidade: '#d946ef' },
  { id: '55555555-5555-5555-5555-555555555555', nome: 'Secretaria Municipal de Sustentabilidade, Clima, Ecosistemas, Recursos Hídricos e Projetos Estratégicos', sigla: 'SUSTENTABILIDADE', cor_identidade: '#059669' },
  { id: '33333333-3333-3333-3333-333333333333', nome: 'Secretaria Municipal de Obras Saneamento e Urbanismo', sigla: 'OBRAS', cor_identidade: '#2563eb' },
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', nome: 'Secretaria Municipal de Infraestrutura Governamental', sigla: 'INFRAESTRUTURA', cor_identidade: '#b45309' },
  { id: '22222222-2222-2222-2222-222222222222', nome: 'Secretaria Municipal de Defesa Civil', sigla: 'DEFESA_CIVIL', cor_identidade: '#ea580c' },
  { id: 'sec-ordem-publica', nome: 'Secretaria Municipal de Ordem Pública', sigla: 'ORDEM_PUBLICA', cor_identidade: '#1e293b' },
  { id: '66666666-6666-6666-6666-666666666666', nome: 'Secretaria Municipal de Meio Ambiente e Bem Estar Animal', sigla: 'MEIO_AMBIENTE', cor_identidade: '#16a34a' },
  { id: '99999999-9999-9999-9999-999999999999', nome: 'Secretaria Municipal de Agricultura, Abastecimento e Pesca', sigla: 'AGRICULTURA', cor_identidade: '#ca8a04' },
  { id: 'sec-cultura', nome: 'Secretaria Municipal de Cultura', sigla: 'CULTURA', cor_identidade: '#8b5cf6' },
  { id: 'sec-esporte', nome: 'Secretaria Municipal de Esporte e Lazer', sigla: 'ESPORTE', cor_identidade: '#06b6d4' },
  { id: 'sec-turismo', nome: 'Secretaria Municipal de Turismo e Eventos', sigla: 'TURISMO', cor_identidade: '#f97316' },
  { id: 'sec-industria', nome: 'Secretaria Municipal de Industria e Comércio', sigla: 'INDUSTRIA_COMERCIO', cor_identidade: '#4f46e5' },
  { id: 'sec-macatur', nome: 'Fundação Macatur', sigla: 'MACATUR', cor_identidade: '#ec4899' },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', nome: 'Secretaria Municipal de Vigilância Sanitária', sigla: 'VIGILANCIA_SANITARIA', cor_identidade: '#0284c7' },
  { id: 'sec-integracao', nome: 'Secretaria Municipal Integração Governamental', sigla: 'INTEGRACAO', cor_identidade: '#3b82f6' },
  { id: '88888888-8888-8888-8888-888888888888', nome: 'AMAE', sigla: 'AMAE', cor_identidade: '#0284c7' },
  { id: 'sec-comunicacao', nome: 'Secretaria Municipal de Comunicação', sigla: 'COMUNICACAO', cor_identidade: '#0ea5e9' },
  { id: 'sec-iapcm', nome: 'Instituto de Previdência do Município de Cachoeiras de Macacu (IAPCM)', sigla: 'IAPCM', cor_identidade: '#7c3aed' },
  { id: 'sec-ciencia', nome: 'Secretaria Municipal de Ciência e Tecnologia', sigla: 'CIENCIA_TECNOLOGIA', cor_identidade: '#38bdf8' }
];

const AUTH_STORAGE_KEY = '@smiic_mobile_user_session';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [secretarias, setSecretarias] = useState<SecretariaItem[]>(SECRETARIAS_FALLBACK);

  // Carregar sessão salva no dispositivo
  useEffect(() => {
    carregarSessaoSalva();
    carregarSecretarias();
  }, []);

  const carregarSecretarias = async () => {
    try {
      const { data, error } = await supabase.from('secretarias').select('*');
      if (data && data.length > 0) {
        setSecretarias(data);
      } else {
        setSecretarias(SECRETARIAS_FALLBACK);
      }
    } catch {
      setSecretarias(SECRETARIAS_FALLBACK);
    }
  };

  const carregarSessaoSalva = async () => {
    try {
      const json = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (json) {
        const parsed: UserSession = JSON.parse(json);
        setUser(parsed);
      }
    } catch (e) {
      console.log('Erro ao restaurar sessão:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const salvarSessao = async (sessao: UserSession) => {
    setUser(sessao);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessao));
  };

  // 1. LOGIN CIDADÃO
  const loginCidadao = async (email: string, pass: string) => {
    try {
      const emailTrim = email.trim().toLowerCase();
      
      // Tenta login via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailTrim,
        password: pass,
      });

      if (authError) {
        return { success: false, error: 'E-mail ou senha incorretos. Verifique seus dados.' };
      }

      // Buscar perfil do cidadão na tabela cidadaos (ou metadata)
      const { data: cidadaoData } = await supabase
        .from('cidadaos')
        .select('*')
        .eq('email', emailTrim)
        .single();

      const session: UserSession = {
        tipo: 'cidadao',
        id: authData.user.id,
        nome: cidadaoData?.nome || authData.user.user_metadata?.nome || emailTrim.split('@')[0],
        email: emailTrim,
        bairro: cidadaoData?.bairro || authData.user.user_metadata?.bairro || 'Cachoeiras de Macacu',
        telefone: cidadaoData?.telefone || authData.user.user_metadata?.telefone || '',
      };

      await salvarSessao(session);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao conectar ao servidor.' };
    }
  };

  // 2. CADASTRO CIDADÃO
  const cadastroCidadao = async (dados: {
    nome: string;
    email: string;
    telefone: string;
    bairro: string;
    senha: string;
  }) => {
    try {
      const emailTrim = dados.email.trim().toLowerCase();

      // Criar no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailTrim,
        password: dados.senha,
        options: {
          data: {
            nome: dados.nome.trim(),
            bairro: dados.bairro,
            telefone: dados.telefone.trim(),
            tipo: 'cidadao',
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'Este e-mail já está cadastrado. Tente fazer login.' };
        }
        return { success: false, error: authError.message };
      }

      // Salvar na tabela de cidadãos para histórico
      try {
        await supabase.from('cidadaos').insert([{
          auth_id: authData.user?.id,
          nome: dados.nome.trim(),
          email: emailTrim,
          telefone: dados.telefone.trim(),
          bairro: dados.bairro,
          criado_em: new Date().toISOString()
        }]);
      } catch (insertErr) {
        console.log('Aviso ao registrar tabela auxiliar cidadaos:', insertErr);
      }

      const session: UserSession = {
        tipo: 'cidadao',
        id: authData.user?.id,
        nome: dados.nome.trim(),
        email: emailTrim,
        bairro: dados.bairro,
        telefone: dados.telefone.trim(),
      };

      await salvarSessao(session);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao cadastrar cidadão.' };
    }
  };

  // 3. LOGIN FUNCIONÁRIO (Integrado ao Sistema Web: solicitacao_acesso)
  const loginFuncionario = async (usuarioOuEmail: string, pass: string) => {
    try {
      const inputTrim = usuarioOuEmail.trim().toLowerCase();
      const formattedEmail = inputTrim.includes('@') ? inputTrim : `${inputTrim}@sistema.local`;

      // Autentica via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formattedEmail,
        password: pass,
      });

      if (authError) {
        return { success: false, error: 'Credenciais inválidas. Verifique seu usuário e senha.' };
      }

      // Validação estrita na tabela solicitacao_acesso (igual ao Sistema Web)
      const { data: perfilData, error: perfilError } = await supabase
        .from('solicitacao_acesso')
        .select('*')
        .eq('email_institucional', formattedEmail)
        .single();

      if (perfilError || !perfilData) {
        await supabase.auth.signOut();
        return { success: false, error: 'Perfil de funcionário não encontrado no sistema.' };
      }

      if (perfilData.status === 'analise') {
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: '⏳ Acesso Pendente: Sua conta está EM ANÁLISE pelo Setor Responsável. Aguarde a aprovação no painel administrativo.' 
        };
      }

      if (perfilData.status === 'rejeitado') {
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: '🚫 Acesso Rejeitado: Sua solicitação de funcionário foi recusada pela administração.' 
        };
      }

      if (perfilData.status !== 'liberado') {
        await supabase.auth.signOut();
        return { success: false, error: 'Status de conta não autorizado.' };
      }

      // Obter informações da secretaria
      const sec = secretarias.find(s => String(s.id) === String(perfilData.secretaria_id));

      const session: UserSession = {
        tipo: 'funcionario',
        id: authData.user.id,
        nome: perfilData.nome_completo || formattedEmail.split('@')[0],
        email: formattedEmail,
        secretaria_id: perfilData.secretaria_id,
        secretaria_nome: sec?.nome || 'Prefeitura Municipal de Cachoeiras de Macacu',
        secretaria_cor: sec?.cor_identidade || '#0f40d4',
        perfil: perfilData.perfil || 'operacional',
        status: 'liberado',
      };

      await salvarSessao(session);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao validar servidor.' };
    }
  };

  // 4. SOLICITAR ACESSO DE FUNCIONÁRIO (Novo Cadastro de Servidor)
  const solicitarAcessoFuncionario = async (dados: {
    nome: string;
    usuarioOuEmail: string;
    emailContato: string;
    idade?: number;
    sexo?: string;
    secretariaId: string;
    senha: string;
  }) => {
    try {
      const inputTrim = dados.usuarioOuEmail.trim().toLowerCase();
      const formattedEmail = inputTrim.includes('@') ? inputTrim : `${inputTrim}@sistema.local`;

      // 1. Criar no Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email: formattedEmail,
        password: dados.senha,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'Este usuário já está cadastrado no sistema.' };
        }
        return { success: false, error: authError.message };
      }

      // 2. Registrar na tabela solicitacao_acesso com status 'analise'
      const { error: insertError } = await supabase.from('solicitacao_acesso').insert([{
        nome_completo: dados.nome.trim(),
        email_institucional: formattedEmail,
        email_contato: dados.emailContato.trim().toLowerCase(),
        idade: dados.idade || null,
        sexo: dados.sexo || 'Não informado',
        secretaria_id: dados.secretariaId,
        status: 'analise',
        perfil: 'operacional',
        criado_em: new Date().toISOString()
      }]);

      if (insertError) {
        return { success: false, error: 'Erro ao salvar solicitação: ' + insertError.message };
      }

      // Faz logout preventivo para aguardar liberação
      await supabase.auth.signOut();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao registrar solicitação.' };
    }
  };

  // 5. REDEFINIÇÃO DE SENHA POR E-MAIL (CIDADÃO)
  const redefinirSenhaCidadao = async (email: string) => {
    try {
      const emailTrim = email.trim().toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(emailTrim);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao enviar e-mail de recuperação.' };
    }
  };

  // 6. ACESSO VISITANTE (Cidadão Rápido)
  const loginVisitante = async () => {
    const session: UserSession = {
      tipo: 'visitante',
      nome: 'Cidadão Visitante',
      email: 'visitante@cachoeirasdemacacu.rj.gov.br',
      bairro: 'Cachoeiras de Macacu',
    };
    await salvarSessao(session);
  };

  // 7. LOGOUT
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.tipo !== 'visitante',
        isLoading,
        loginCidadao,
        cadastroCidadao,
        loginFuncionario,
        solicitarAcessoFuncionario,
        redefinirSenhaCidadao,
        loginVisitante,
        logout,
        secretarias,
        carregarSecretarias,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
