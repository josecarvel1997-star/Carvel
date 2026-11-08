'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function value(form: FormData, key: string) { return String(form.get(key) ?? '').trim(); }
export async function signUp(form: FormData) {
  const name = value(form, 'name'), email = value(form, 'email'), password = value(form, 'password');
  if (name.length < 2 || !email.includes('@') || password.length < 10) redirect('/cadastro?erro=Confira+seus+dados.+A+senha+precisa+ter+10+caracteres.');
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3200'}/auth/callback` } });
  if (error) redirect(`/cadastro?erro=${encodeURIComponent(error.message)}`);
  redirect('/cadastro?confirmacao=1');
}
export async function signIn(form: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: value(form, 'email'), password: value(form, 'password') });
  if (error) redirect(`/entrar?erro=${encodeURIComponent('Não foi possível entrar. Confira o e-mail e a senha.')}`);
  redirect('/painel');
}
export async function requestPasswordReset(form: FormData) {
  const email = value(form, 'email');
  if (!email.includes('@')) redirect('/recuperar-senha?erro=Informe+um+e-mail+valido.');
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3200'}/auth/callback?next=/redefinir-senha` });
  if (error) redirect('/recuperar-senha?erro=Não+foi+possivel+enviar+o+link.+Tente+novamente.');
  redirect('/recuperar-senha?enviado=1');
}
export async function updatePassword(form: FormData) {
  const password = value(form, 'password');
  if (password.length < 10) redirect('/redefinir-senha?erro=A+senha+precisa+ter+10+caracteres.');
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect('/redefinir-senha?erro=Não+foi+possivel+atualizar+a+senha.');
  redirect('/painel');
}
export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); redirect('/'); }

function slugify(text: string) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 56); }
export async function createBarbershop(form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');
  const shopName = value(form, 'shop_name'), ownerName = value(form, 'owner_name');
  if (shopName.length < 2 || ownerName.length < 2) redirect('/painel?erro=Informe+seu+nome+e+o+nome+da+barbearia.');
  const openTime = value(form, 'opening_time'), closeTime = value(form, 'closing_time');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(openTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(closeTime) || openTime >= closeTime) redirect('/painel?erro=Confira+o+horario+de+abertura+e+fechamento.');
  const phone = value(form, 'phone'), phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 13) redirect('/painel?erro=Informe+o+telefone+com+DDD.');
  const openDays = form.getAll('open_days').map(String).filter((d) => ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(d));
  if (!openDays.length) redirect('/painel?erro=Selecione+os+dias+de+funcionamento.');
  // Versão de 9 argumentos (SECURITY DEFINER) existente no banco ao vivo; é idempotente por usuário.
  const { data, error } = await supabase.rpc('bootstrap_barbershop', { shop_name: shopName, shop_slug: `${slugify(shopName) || 'negocio'}-${crypto.randomUUID().slice(0, 5)}`, shop_phone: phone, shop_address: value(form, 'address'), owner_name: ownerName, open_time: openTime, close_time: closeTime, business_kind: 'beauty', open_days: [...new Set(openDays)] });
  if (error || !data) redirect(`/painel?erro=${encodeURIComponent(error?.message ?? 'Não foi possível salvar.')}`);
  redirect('/painel?etapa=servicos');
}
export async function saveServices(form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/entrar');
  const { data: memberships } = await supabase.from('barbershop_members').select('barbershop_id').eq('user_id', user.id).eq('role', 'owner').limit(1);
  const shopId = memberships?.[0]?.barbershop_id; if (!shopId) redirect('/painel?erro=Configure+a+barbearia+primeiro.');
  const names = form.getAll('service_name').map(String), prices = form.getAll('service_price').map(String), durations = form.getAll('service_duration').map(String);
  const rows = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i].trim(), rawPrice = prices[i], price = Number(rawPrice), duration = Number(durations[i]);
    if (!name && !rawPrice) continue;
    if (name.length < 2 || !rawPrice || !Number.isFinite(price) || price < 0 || !Number.isInteger(duration) || duration < 5 || duration > 480) redirect('/painel?etapa=servicos&erro=Preencha+nome,+duracao+e+preco+para+cada+servico.');
    rows.push({ name, price, duration_minutes: duration, barbershop_id: shopId });
  }
  if (!rows.length) redirect('/painel?etapa=servicos&erro=Cadastre+pelo+menos+um+servico+para+continuar.');
  const { error: serviceError } = await supabase.from('services').upsert(rows, { onConflict: 'barbershop_id,name' });
  if (serviceError) redirect(`/painel?etapa=servicos&erro=${encodeURIComponent(serviceError.message)}`);
  const { error } = await supabase.rpc('advance_onboarding', { target_shop: shopId, next_step: 'team' });
  if (error) redirect(`/painel?etapa=servicos&erro=${encodeURIComponent(error.message)}`);
  redirect('/painel?etapa=equipe');
}
export async function finishOnboarding(form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/entrar');
  const { data: memberships } = await supabase.from('barbershop_members').select('barbershop_id').eq('user_id', user.id).eq('role', 'owner').limit(1);
  const shopId = memberships?.[0]?.barbershop_id; if (!shopId) redirect('/painel?erro=Configure+a+barbearia+primeiro.');
  const staffName = value(form, 'skip_team') === 'true' ? '' : value(form, 'staff_name');
  let commission = 0, role = 'barber';
  if (staffName) {
    commission = Number(value(form, 'commission_rate') || 0);
    role = value(form, 'staff_role') || 'barber';
    if (staffName.length < 2 || !Number.isFinite(commission) || commission < 0 || commission > 100 || !['barber', 'manager', 'receptionist'].includes(role)) redirect('/painel?etapa=equipe&erro=Confira+o+nome,+papel+e+comissao+do+profissional.');
  }
  const { error } = await supabase.rpc('finish_onboarding', { target_shop: shopId, staff_name: staffName || null, staff_role: role, commission });
  if (error) redirect(`/painel?etapa=equipe&erro=${encodeURIComponent(error.message)}`);
  redirect('/painel');
}
