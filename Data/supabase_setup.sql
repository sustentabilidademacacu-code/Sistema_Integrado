-- 1. Criar tabela de secretarias
CREATE TABLE public.secretarias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  cor_identidade text
);

-- 2. Inserir as secretarias padrão
INSERT INTO public.secretarias (id, nome, cor_identidade) VALUES
('11111111-1111-1111-1111-111111111111', 'Gabinete do Prefeito / Sala de Situação', '#fbbf24'),
('22222222-2222-2222-2222-222222222222', 'Secretaria de Defesa Civil', '#ea580c'),
('33333333-3333-3333-3333-333333333333', 'Secretaria de Obras e Saneamento', '#2563eb'),
('44444444-4444-4444-4444-444444444444', 'Secretaria de Assistência Social', '#c026d3'),
('55555555-5555-5555-5555-555555555555', 'Secretaria de Sustentabilidade', '#0e7490'),
('66666666-6666-6666-6666-666666666666', 'Secretaria de Meio Ambiente', '#16a34a'),
('77777777-7777-7777-7777-777777777777', 'Secretaria de Saúde', '#dc2626'),
('88888888-8888-8888-8888-888888888888', 'AMAE', '#0284c7'),
('99999999-9999-9999-9999-999999999999', 'Secretaria de Agricultura', '#ca8a04'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Secretaria de Infraestrutura Rural', '#78350f'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Vigilância Sanitária', '#475569'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Secretaria de Educação', '#4f46e5');

-- 3. Criar tabela de solicitacao_acesso (para os usuários do sistema)
CREATE TABLE public.solicitacao_acesso (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo text NOT NULL,
  email_institucional text NOT NULL,
  secretaria_id uuid REFERENCES public.secretarias(id),
  status text NOT NULL DEFAULT 'analise',
  perfil text NOT NULL DEFAULT 'operacional',
  data_solicitacao timestamp with time zone DEFAULT now()
);

-- 4. Criar tabela de vulnerabilidades_mmvc (mesmo vazia, é necessária para não dar erro)
CREATE TABLE public.vulnerabilidades_mmvc (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria text,
  prioridade_acao text
);

-- 5. Criar tabela de ocorrencias (para o mapa de incidentes)
CREATE TABLE public.ocorrencias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria text,
  descricao text,
  localidade text,
  bairro text,
  logradouro text,
  numero text,
  prioridade_acao text,
  status_publico text,
  latitude numeric,
  longitude numeric,
  vulnerabilidade uuid REFERENCES public.vulnerabilidades_mmvc(id),
  secretaria_id uuid REFERENCES public.secretarias(id),
  data_registro timestamp with time zone DEFAULT now()
);

-- 6. OBRIGATÓRIO: Desativar a política "Email Confirmations" no Supabase
-- Vá no menu lateral do Supabase > Authentication > Providers > Email
-- Desmarque a opção "Confirm email" e clique em Save. Isso permite criar usuários apenas com Nome de Usuário.
