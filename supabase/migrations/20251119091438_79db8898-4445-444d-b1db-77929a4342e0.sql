-- 1. Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Criar tabela profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Função auxiliar para verificar role (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  );
$$;

-- 5. Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Dar role 'user' por padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RLS para profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 7. RLS para user_roles (apenas admins podem gerenciar)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. REMOVER políticas inseguras e criar novas políticas para todas as tabelas

-- EVENTOS
DROP POLICY IF EXISTS "Allow all operations on eventos" ON public.eventos;

CREATE POLICY "Authenticated users can view eventos"
ON public.eventos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage eventos"
ON public.eventos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- VENDAS
DROP POLICY IF EXISTS "Allow all operations on vendas" ON public.vendas;

CREATE POLICY "Authenticated users can view vendas"
ON public.vendas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage vendas"
ON public.vendas FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- PROFISSIONAIS
DROP POLICY IF EXISTS "Allow all operations on profissionais" ON public.profissionais;

CREATE POLICY "Authenticated users can view profissionais"
ON public.profissionais FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage profissionais"
ON public.profissionais FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- PAGAMENTOS
DROP POLICY IF EXISTS "Allow all operations on pagamentos" ON public.pagamentos;

CREATE POLICY "Authenticated users can view pagamentos"
ON public.pagamentos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage pagamentos"
ON public.pagamentos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- SATISFACAO
DROP POLICY IF EXISTS "Allow all operations on satisfacao" ON public.satisfacao;

CREATE POLICY "Authenticated users can view satisfacao"
ON public.satisfacao FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage satisfacao"
ON public.satisfacao FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- EVENTOS_PROFISSIONAIS
DROP POLICY IF EXISTS "Allow all operations on eventos_profissionais" ON public.eventos_profissionais;

CREATE POLICY "Authenticated users can view eventos_profissionais"
ON public.eventos_profissionais FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage eventos_profissionais"
ON public.eventos_profissionais FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RECLAMACOES
DROP POLICY IF EXISTS "Allow all operations on reclamacoes" ON public.reclamacoes;

CREATE POLICY "Authenticated users can view reclamacoes"
ON public.reclamacoes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage reclamacoes"
ON public.reclamacoes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- CONTROLE_CONFERENCIA
DROP POLICY IF EXISTS "Allow all operations on controle_conferencia" ON public.controle_conferencia;

CREATE POLICY "Authenticated users can view controle_conferencia"
ON public.controle_conferencia FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage controle_conferencia"
ON public.controle_conferencia FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Criar função especial para sync (com SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.can_sync_jotform(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;