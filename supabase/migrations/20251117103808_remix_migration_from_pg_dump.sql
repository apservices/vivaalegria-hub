--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: evento_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.evento_status AS ENUM (
    'pendente',
    'confirmado',
    'realizado',
    'cancelado'
);


--
-- Name: pagamento_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pagamento_status AS ENUM (
    'pendente',
    'parcial',
    'pago',
    'atrasado'
);


--
-- Name: tipo_evento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_evento AS ENUM (
    'casamento',
    'aniversario',
    'corporativo',
    'formatura',
    'outro'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eventos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    cliente text NOT NULL,
    data_evento timestamp with time zone NOT NULL,
    tipo_evento public.tipo_evento DEFAULT 'outro'::public.tipo_evento NOT NULL,
    formulario_origem text,
    jotform_submission_id text,
    status public.evento_status DEFAULT 'pendente'::public.evento_status NOT NULL,
    observacoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: eventos_profissionais; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eventos_profissionais (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    profissional_id uuid NOT NULL,
    valor_acordado numeric(10,2) NOT NULL,
    valor_pago numeric(10,2) DEFAULT 0 NOT NULL,
    status_pagamento public.pagamento_status DEFAULT 'pendente'::public.pagamento_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pagamentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagamentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    venda_id uuid,
    valor numeric(10,2) NOT NULL,
    data_pagamento timestamp with time zone NOT NULL,
    metodo_pagamento text,
    observacoes text,
    jotform_submission_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profissionais; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profissionais (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    funcao text NOT NULL,
    telefone text,
    email text,
    valor_padrao numeric(10,2),
    jotform_submission_id text,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: satisfacao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.satisfacao (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid,
    nota integer NOT NULL,
    comentario text,
    data_avaliacao timestamp with time zone DEFAULT now() NOT NULL,
    jotform_submission_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT satisfacao_nota_check CHECK (((nota >= 1) AND (nota <= 5)))
);


--
-- Name: vendas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid,
    data_venda timestamp with time zone DEFAULT now() NOT NULL,
    valor_total numeric(10,2) DEFAULT 0 NOT NULL,
    valor_recebido numeric(10,2) DEFAULT 0 NOT NULL,
    status_pagamento public.pagamento_status DEFAULT 'pendente'::public.pagamento_status NOT NULL,
    jotform_submission_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: eventos eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_pkey PRIMARY KEY (id);


--
-- Name: eventos_profissionais eventos_profissionais_evento_id_profissional_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_profissionais
    ADD CONSTRAINT eventos_profissionais_evento_id_profissional_id_key UNIQUE (evento_id, profissional_id);


--
-- Name: eventos_profissionais eventos_profissionais_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_profissionais
    ADD CONSTRAINT eventos_profissionais_pkey PRIMARY KEY (id);


--
-- Name: pagamentos pagamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamentos
    ADD CONSTRAINT pagamentos_pkey PRIMARY KEY (id);


--
-- Name: profissionais profissionais_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profissionais
    ADD CONSTRAINT profissionais_pkey PRIMARY KEY (id);


--
-- Name: satisfacao satisfacao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satisfacao
    ADD CONSTRAINT satisfacao_pkey PRIMARY KEY (id);


--
-- Name: vendas vendas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_pkey PRIMARY KEY (id);


--
-- Name: idx_eventos_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eventos_data ON public.eventos USING btree (data_evento);


--
-- Name: idx_eventos_profissionais_evento_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eventos_profissionais_evento_id ON public.eventos_profissionais USING btree (evento_id);


--
-- Name: idx_eventos_profissionais_profissional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eventos_profissionais_profissional_id ON public.eventos_profissionais USING btree (profissional_id);


--
-- Name: idx_eventos_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eventos_status ON public.eventos USING btree (status);


--
-- Name: idx_pagamentos_venda_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pagamentos_venda_id ON public.pagamentos USING btree (venda_id);


--
-- Name: idx_satisfacao_evento_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_satisfacao_evento_id ON public.satisfacao USING btree (evento_id);


--
-- Name: idx_vendas_evento_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendas_evento_id ON public.vendas USING btree (evento_id);


--
-- Name: eventos update_eventos_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pagamentos update_pagamentos_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON public.pagamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profissionais update_profissionais_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profissionais_updated_at BEFORE UPDATE ON public.profissionais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vendas update_vendas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON public.vendas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: eventos_profissionais eventos_profissionais_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_profissionais
    ADD CONSTRAINT eventos_profissionais_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;


--
-- Name: eventos_profissionais eventos_profissionais_profissional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_profissionais
    ADD CONSTRAINT eventos_profissionais_profissional_id_fkey FOREIGN KEY (profissional_id) REFERENCES public.profissionais(id) ON DELETE CASCADE;


--
-- Name: pagamentos pagamentos_venda_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagamentos
    ADD CONSTRAINT pagamentos_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE CASCADE;


--
-- Name: satisfacao satisfacao_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.satisfacao
    ADD CONSTRAINT satisfacao_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;


--
-- Name: vendas vendas_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON DELETE CASCADE;


--
-- Name: eventos Allow all operations on eventos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on eventos" ON public.eventos USING (true) WITH CHECK (true);


--
-- Name: eventos_profissionais Allow all operations on eventos_profissionais; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on eventos_profissionais" ON public.eventos_profissionais USING (true) WITH CHECK (true);


--
-- Name: pagamentos Allow all operations on pagamentos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on pagamentos" ON public.pagamentos USING (true) WITH CHECK (true);


--
-- Name: profissionais Allow all operations on profissionais; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on profissionais" ON public.profissionais USING (true) WITH CHECK (true);


--
-- Name: satisfacao Allow all operations on satisfacao; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on satisfacao" ON public.satisfacao USING (true) WITH CHECK (true);


--
-- Name: vendas Allow all operations on vendas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations on vendas" ON public.vendas USING (true) WITH CHECK (true);


--
-- Name: eventos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

--
-- Name: eventos_profissionais; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.eventos_profissionais ENABLE ROW LEVEL SECURITY;

--
-- Name: pagamentos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

--
-- Name: profissionais; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;

--
-- Name: satisfacao; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.satisfacao ENABLE ROW LEVEL SECURITY;

--
-- Name: vendas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


