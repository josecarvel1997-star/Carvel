'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import Brand from '@/app/components/brand';
import { signOut } from '@/app/actions';
import { ALLOWED_MODULES, REAL_MODULES } from '@/lib/panel/modules';
import { ROLE_LABEL, type MemberRole } from '@/lib/panel/types';
import {
  Activity, ArrowRight, Bell, CalendarDays, ChevronRight, Clock3, CreditCard, Heart, LayoutDashboard,
  LogOut, Menu, Package, Percent, Scissors, Settings, Sparkles, UsersRound, CalendarClock,
} from 'lucide-react';

type Props = {
  moduleKey: string;
  shopName: string;
  shopSlug: string;
  role: MemberRole;
  userName: string;
  todayLabel: string;
  title: string;
  description: string;
  headerAction?: ReactNode;
  children: ReactNode;
};

const navigation = [
  { group: 'INÍCIO', items: [{ key: '', label: 'Visão geral', icon: LayoutDashboard }, { key: 'alertas', label: 'Central de alertas', icon: Bell }] },
  { group: 'OPERAÇÃO', items: [{ key: 'agenda', label: 'Agenda', icon: CalendarDays }, { key: 'atendimentos', label: 'Atendimentos', icon: Scissors }, { key: 'fila', label: 'Fila de espera', icon: Clock3 }] },
  { group: 'RELACIONAMENTO', items: [{ key: 'clientes', label: 'Clientes', icon: UsersRound }, { key: 'recuperacao', label: 'Clientes para retornar', icon: Heart }, { key: 'fidelizacao', label: 'Fidelização', icon: Sparkles }] },
  { group: 'GESTÃO', items: [{ key: 'servicos', label: 'Serviços', icon: Scissors }, { key: 'equipe', label: 'Equipe', icon: UsersRound }, { key: 'comissoes', label: 'Comissões', icon: Percent }, { key: 'horarios', label: 'Horários', icon: CalendarClock }, { key: 'financeiro', label: 'Caixa e financeiro', icon: CreditCard }, { key: 'estoque', label: 'Produtos e estoque', icon: Package }, { key: 'relatorios', label: 'Relatórios', icon: Activity }] },
  { group: 'PREFERÊNCIAS', items: [{ key: 'configuracoes', label: 'Configurações', icon: Settings }, { key: 'notificacoes', label: 'Mensagens', icon: Bell }] },
];

export function SoonBadge() { return <span className="soon-badge">Em breve</span>; }

/** Estrutura do painel (menu lateral, cabeçalho). O conteúdo de cada módulo vem de Server Components. */
export default function PanelModule({ moduleKey, shopName, shopSlug, role, userName, todayLabel, title, description, headerAction, children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const allowed = ALLOWED_MODULES[role] ?? [];
  const groups = navigation.map((group) => ({ ...group, items: group.items.filter((item) => item.key === '' ? role !== 'barber' : allowed.includes(item.key)) })).filter((group) => group.items.length);

  return <div className="workspace">
    <aside className={`workspace-sidebar ${mobileMenuOpen ? 'is-open' : ''}`}>
      <Brand className="workspace-brand" href="/painel" subtitle="GESTÃO PARA NEGÓCIOS DE BELEZA"/>
      <div className="workspace-shop"><span className="workspace-shop-avatar">{shopName.slice(0, 1).toUpperCase()}</span><span><b>{shopName}</b><small>Plano inicial</small></span></div>
      <nav className="workspace-nav">{groups.map((group) => <div className="nav-group" key={group.group}><small>{group.group}</small>{group.items.map((item) => <Link key={item.key} href={item.key ? `/painel/${item.key}` : '/painel'} onClick={() => setMobileMenuOpen(false)} className={`workspace-nav-link ${moduleKey === item.key ? 'active' : ''}`}><item.icon size={17}/><span>{item.label}</span>{item.key !== '' && !REAL_MODULES.includes(item.key) && <SoonBadge/>}</Link>)}</div>)}</nav>
      <div className="workspace-sidebar-foot"><Link href={`/b/${shopSlug}`} className="workspace-public-link" target="_blank"><ArrowRight size={15}/> Ver página de agendamento</Link><div className="workspace-user"><span className="workspace-user-avatar">{userName.slice(0, 1).toUpperCase()}</span><span><b>{userName}</b><small>{ROLE_LABEL[role] ?? role}</small></span><form action={signOut}><button aria-label="Sair da conta" title="Sair da conta"><LogOut size={16}/></button></form></div></div>
    </aside>
    {mobileMenuOpen && <button className="workspace-overlay" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)}/>}
    <main className="workspace-main">
      <header className="workspace-header"><button className="workspace-menu-button" aria-label="Abrir menu" onClick={() => setMobileMenuOpen(true)}><Menu size={19}/></button><div className="workspace-breadcrumb"><span>{shopName}</span><ChevronRight size={13}/><b>{title}</b></div><div className="workspace-header-actions"><span className="live-badge"><i/> Dados reais</span><span className="workspace-header-avatar">{userName.slice(0, 1).toUpperCase()}</span></div></header>
      <section className="workspace-content">
        <div className="workspace-page-heading"><div><span className="workspace-date-label">{todayLabel.toLocaleUpperCase('pt-BR')}</span><h1>{title}</h1><p>{description}</p></div>{headerAction}</div>
        {children}
        <footer className="workspace-footer"><span>Agenda Certa · gestão para negócios de beleza</span><span>Fuso da agenda: horário da barbearia</span></footer>
      </section>
    </main>
  </div>;
}
