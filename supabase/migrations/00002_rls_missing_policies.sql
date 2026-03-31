-- O Postgres bloqueia SELECTs, INSERTs e UPDATEs por padrão em tabelas com RLS habilitado se não houver Políticas.
-- Este script adiciona as políticas de leitura e gravação para as tabelas essenciais da Clínica.

-- 1.clinic_users: O próprio usuário precisa conseguir "ler" qual é a clínica dele
CREATE POLICY "User can read own clinic user binding" 
ON public.clinic_users FOR SELECT 
USING (user_id = auth.uid());

-- 2. clinics: O usuário pode ler apenas os dados da sua própria clínica
CREATE POLICY "User can read own clinic" 
ON public.clinics FOR SELECT 
USING (id IN (SELECT get_user_climics()));

-- 3. ai_settings: O usuário pode ler e atualizar (UPSERT) apenas as configs de IA da sua clínica
CREATE POLICY "User can read ai settings" 
ON public.ai_settings FOR SELECT 
USING (clinic_id IN (SELECT get_user_climics()));

CREATE POLICY "User can insert ai settings" 
ON public.ai_settings FOR INSERT 
WITH CHECK (clinic_id IN (SELECT get_user_climics()));

CREATE POLICY "User can update ai settings" 
ON public.ai_settings FOR UPDATE 
USING (clinic_id IN (SELECT get_user_climics()));

-- 4. whatsapp_sessions: O usuário pode ler e atualizar (UPSERT) apenas as conexões WAHA da sua clínica
CREATE POLICY "User can read waha sessions" 
ON public.whatsapp_sessions FOR SELECT 
USING (clinic_id IN (SELECT get_user_climics()));

CREATE POLICY "User can insert waha sessions" 
ON public.whatsapp_sessions FOR INSERT 
WITH CHECK (clinic_id IN (SELECT get_user_climics()));

CREATE POLICY "User can update waha sessions" 
ON public.whatsapp_sessions FOR UPDATE 
USING (clinic_id IN (SELECT get_user_climics()));

-- 5. conversations: O usuário pode ler e atualizar apenas as conversas da sua clínica
CREATE POLICY "User can read conversations" 
ON public.conversations FOR SELECT 
USING (clinic_id IN (SELECT get_user_climics()));

CREATE POLICY "User can update conversations" 
ON public.conversations FOR UPDATE 
USING (clinic_id IN (SELECT get_user_climics()));

CREATE POLICY "User can insert conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (clinic_id IN (SELECT get_user_climics()));

-- 6. messages: O usuário pode ler e deletar mensagens das suas conversas
CREATE POLICY "User can read messages" 
ON public.messages FOR SELECT 
USING (conversation_id IN (SELECT id FROM public.conversations WHERE clinic_id IN (SELECT get_user_climics())));

CREATE POLICY "User can insert messages" 
ON public.messages FOR INSERT 
WITH CHECK (conversation_id IN (SELECT id FROM public.conversations WHERE clinic_id IN (SELECT get_user_climics())));
