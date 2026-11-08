import { Building2, Clock3, Scissors, Trash2 } from 'lucide-react';
import FormDialog from '@/app/painel/ui/form-dialog';
import ActionButton from '@/app/painel/ui/action-button';
import { deleteResource, deleteService, saveResource, saveService } from '@/app/painel/actions';
import { canManage, type PanelContext } from '@/lib/panel/context';
import { RESOURCE_KIND_LABEL, type BookingResource, type Service } from '@/lib/panel/types';
import { loadResources, loadServices } from './data';
import { brl, durationLabel, EmptyState } from './shared';

function ServiceFields({ service }: { service?: Service }) {
  return <>
    {service && <input type="hidden" name="id" value={service.id}/>}
    <div className="demo-form-row two">
      <label>Nome do serviço<input name="name" required minLength={2} maxLength={100} defaultValue={service?.name} placeholder="Ex.: Corte + barba"/></label>
      <label>Categoria<input name="category" maxLength={60} defaultValue={service?.category} placeholder="Ex.: Cabelo"/></label>
    </div>
    <div className="demo-form-row two">
      <label>Duração (minutos)<input name="duration_minutes" type="number" min={5} max={480} step={5} required defaultValue={service?.duration_minutes ?? 30}/></label>
      <label>Preço (R$)<input name="price" type="number" min={0} step="0.01" required defaultValue={service ? service.price.toFixed(2) : ''} placeholder="45,00"/></label>
    </div>
    <label className="checkbox-row"><input type="checkbox" name="requires_professional" defaultChecked={service ? service.requires_professional : true}/> Exige profissional (sem profissional escolhido, o sistema atribui o mais livre)</label>
    <label className="checkbox-row"><input type="checkbox" name="active" defaultChecked={service ? service.active : true}/> Ativo (aparece na agenda e na página pública)</label>
  </>;
}

function ResourceFields({ resource }: { resource?: BookingResource }) {
  return <>
    {resource && <input type="hidden" name="id" value={resource.id}/>}
    <label>Nome<input name="name" required minLength={2} maxLength={100} defaultValue={resource?.name} placeholder="Ex.: Sala 1"/></label>
    <div className="demo-form-row two">
      <label>Tipo<select name="kind" defaultValue={resource?.kind ?? 'space'}>{Object.entries(RESOURCE_KIND_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Capacidade<input name="capacity" type="number" min={1} max={10000} defaultValue={resource?.capacity ?? 1}/></label>
    </div>
    <label className="checkbox-row"><input type="checkbox" name="active" defaultChecked={resource ? resource.active : true}/> Ativo</label>
  </>;
}

export function NewServiceDialog() {
  return <FormDialog title="Novo serviço" eyebrow="SERVIÇOS" action={saveService} submitLabel="Criar serviço" trigger="Novo serviço" triggerIcon="plus"><ServiceFields/></FormDialog>;
}

export default async function ServicosView({ ctx }: { ctx: PanelContext }) {
  const [services, resources] = await Promise.all([loadServices(ctx), loadResources(ctx)]);
  const manage = canManage(ctx.role);
  const active = services.filter((s) => s.active);
  const avg = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  return <>
    <div className="services-topline">
      <div className="service-stat"><small>Serviços ativos</small><b>{active.length}</b><span>{services.length - active.length} inativo(s)</span></div>
      <div className="service-stat"><small>Preço médio</small><b>{brl(avg(active.map((s) => s.price)))}</b><span>entre os serviços ativos</span></div>
      <div className="service-stat"><small>Duração média</small><b>{Math.round(avg(active.map((s) => s.duration_minutes)))} min</b><span>por atendimento</span></div>
      <div className="service-stat service-stat-action">{manage && <NewServiceDialog/>}</div>
    </div>
    {!services.length ? <EmptyState title="Nenhum serviço cadastrado">Cadastre nome, duração e preço. A duração define o tamanho do horário na agenda.</EmptyState>
      : <div className="service-card-grid">{services.map((s) => <article className={`workspace-card service-card ${s.active ? '' : 'is-inactive'}`} key={s.id}>
        <div className="service-card-icon"><Scissors size={18}/></div>
        <h3>{s.name}</h3>
        {(s.category || !s.requires_professional) && <p className="form-hint">{[s.category, s.requires_professional ? '' : 'Sem profissional obrigatório'].filter(Boolean).join(' · ')}</p>}
        <div className="service-details"><span><Clock3 size={14}/>{durationLabel(s.duration_minutes)}</span><b>{brl(s.price)}</b></div>
        <div className="service-card-foot"><span className={s.active ? '' : 'inactive'}><i/> {s.active ? 'Ativo' : 'Inativo'}</span>
          {manage && <div className="card-actions">
            <FormDialog title="Editar serviço" eyebrow="SERVIÇOS" action={saveService} submitLabel="Salvar" trigger="Editar" triggerClassName="link-button"><ServiceFields service={s}/></FormDialog>
            <ActionButton action={deleteService} fields={{ id: s.id }} className="link-button danger" confirmMessage={`Excluir o serviço “${s.name}”? Se ele tiver agendamentos, será apenas desativado.`} title="Excluir"><Trash2 size={13}/></ActionButton>
          </div>}
        </div>
      </article>)}</div>}

    <section className="workspace-card resources-card">
      <div className="card-heading"><div><h3>Salas e recursos <span className="soon-badge">Agendamento por sala em breve</span></h3><p>Cadastro de salas, estúdios e espaços. As funções de agendamento do banco ainda recusam reserva por recurso, então eles não aparecem na agenda.</p></div>
        {manage && <FormDialog title="Nova sala ou recurso" eyebrow="SERVIÇOS" action={saveResource} submitLabel="Cadastrar" trigger="Novo recurso" triggerIcon="plus" triggerClassName="workspace-secondary-button"><ResourceFields/></FormDialog>}</div>
      {resources.length ? <div className="transaction-list">{resources.map((r) => <div className="transaction-row" key={r.id}>
        <span className="transaction-icon"><Building2 size={15}/></span>
        <span className="transaction-desc"><b>{r.name}</b><span className="transaction-method">{RESOURCE_KIND_LABEL[r.kind]} · capacidade {r.capacity}{r.active ? '' : ' · inativo'}</span></span>
        {manage && <span className="card-actions">
          <FormDialog title="Editar recurso" eyebrow="SERVIÇOS" action={saveResource} submitLabel="Salvar" trigger="Editar" triggerClassName="link-button"><ResourceFields resource={r}/></FormDialog>
          <ActionButton action={deleteResource} fields={{ id: r.id }} className="link-button danger" confirmMessage={`Excluir “${r.name}”?`} title="Excluir"><Trash2 size={13}/></ActionButton>
        </span>}
      </div>)}</div> : <p className="form-hint">Nenhuma sala ou recurso cadastrado.</p>}
    </section>
  </>;
}
