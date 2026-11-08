import Link from 'next/link';
import Brand from '@/app/components/brand';

export default function ShopNotFound() {
  return <main className="setup"><section className="setup-card"><Brand/><h1>Página não encontrada</h1><p>Este link de agendamento não existe ou a barbearia ainda não terminou a configuração.</p><Link className="button" href="/">Ir para o início</Link></section></main>;
}
