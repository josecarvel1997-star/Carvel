import Brand from '@/app/components/brand';

export default function MissingEnv() {
  return <main className="setup"><section className="setup-card"><Brand/><h1>Configure o Supabase</h1><p>Defina <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no arquivo <code>.env.local</code> e aplique as migrations (veja o README) para usar o painel.</p></section></main>;
}
