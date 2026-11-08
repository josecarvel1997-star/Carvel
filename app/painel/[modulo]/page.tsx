import { redirect } from 'next/navigation';
import { ALLOWED_MODULES, getPanelContext, hasSupabaseEnv, MODULES, REAL_MODULES } from '@/lib/panel/context';
import { PAGE_INFO } from '@/lib/panel/modules';
import { formatDate, todayInZone } from '@/lib/time';
import PanelModule, { SoonBadge } from './panel-module';
import AgendaView from './views/agenda';
import AtendimentosView from './views/atendimentos';
import ClientesView from './views/clientes';
import ServicosView from './views/servicos';
import EquipeView from './views/equipe';
import HorariosView from './views/horarios';
import ComingSoonView from './views/coming-soon';
import MissingEnv from './views/missing-env';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ModulePage({ params, searchParams }: { params: Promise<{ modulo: string }>; searchParams: SearchParams }) {
  const { modulo } = await params;
  if (!(MODULES as readonly string[]).includes(modulo)) redirect('/painel');
  if (!hasSupabaseEnv()) return <MissingEnv/>;
  const ctx = await getPanelContext();
  if (!ALLOWED_MODULES[ctx.role]?.includes(modulo)) redirect(ctx.role === 'barber' ? '/painel/agenda' : '/painel');

  const raw = await searchParams;
  const query = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  const info = PAGE_INFO[modulo] ?? PAGE_INFO.agenda;
  const real = REAL_MODULES.includes(modulo);
  const todayLabel = formatDate(todayInZone(ctx.shop.timezone), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return <PanelModule moduleKey={modulo} shopName={ctx.shop.name} shopSlug={ctx.shop.slug} role={ctx.role} userName={ctx.userName} todayLabel={todayLabel} title={info.title} description={info.description} headerAction={real ? undefined : <SoonBadge/>}>
    {modulo === 'agenda' && <AgendaView ctx={ctx} params={query}/>}
    {modulo === 'atendimentos' && <AtendimentosView ctx={ctx} params={query}/>}
    {modulo === 'clientes' && <ClientesView ctx={ctx} params={query}/>}
    {modulo === 'servicos' && <ServicosView ctx={ctx}/>}
    {modulo === 'equipe' && <EquipeView ctx={ctx}/>}
    {modulo === 'horarios' && <HorariosView ctx={ctx} params={query}/>}
    {!real && <ComingSoonView title={info.title}/>}
  </PanelModule>;
}
