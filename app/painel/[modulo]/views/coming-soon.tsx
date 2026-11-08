import Link from 'next/link';
import { CalendarDays, Sparkles } from 'lucide-react';

/** Módulos ainda não implementados: sem dados fictícios, só o aviso. */
export default function ComingSoonView({ title }: { title: string }) {
  return <section className="workspace-card coming-soon">
    <span className="coming-soon-icon"><Sparkles size={22}/></span>
    <span className="soon-badge large">Em breve</span>
    <h2>{title} está em construção</h2>
    <p>Este módulo ainda não está disponível. Enquanto isso, agenda, atendimentos e comandas, clientes, serviços, equipe, horários, caixa e PDV, estoque, comissões e alertas já funcionam com os dados reais da sua barbearia.</p>
    <Link className="workspace-primary-button" href="/painel/agenda"><CalendarDays size={16}/> Ir para a agenda</Link>
  </section>;
}
