import type { Metadata } from 'next';
import './home.css';

export const metadata: Metadata = {
  title: 'Carvel | Gestão inteligente para negócios de beleza',
  description: 'Agenda, clientes, equipe e finanças em um só lugar para barbearias, salões, trancistas e profissionais autônomos.',
};

/* Página inicial gerada a partir do design do Stitch (desktop + mobile). */
export default function Home() {
  return <div className="carvel-home">
    <div className="carvel-desktop hidden md:block bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container relative overflow-x-hidden">

<div className="fixed inset-0 custom-radial-glow pointer-events-none z-0"></div>
<header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/20 dark:border-outline-variant/20">
<div className="flex justify-between items-center w-full px-6 md:px-10 h-20 max-w-7xl mx-auto">
<a className="flex items-center gap-3 text-headline-sm font-headline-sm font-extrabold text-on-surface dark:text-on-surface group" href="/">
<div className="w-10 h-10 rounded-xl bg-surface-container-high border border-primary-container/40 flex items-center justify-center text-primary shadow-sm group-hover:border-primary transition-colors">
<span className="material-symbols-outlined text-[24px]" style={{"fontVariationSettings": "'FILL' 1"}}>calendar_month</span>
</div>
<div className="flex items-center gap-2">
<span className="">Carvel</span>
</div>
</a>
<nav className="hidden md:flex items-center gap-8">
<a className="text-secondary dark:text-secondary font-bold text-label-lg font-label-lg hover:text-primary dark:hover:text-primary transition-colors duration-200" href="#funcionalidades">Funcionalidades</a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-medium text-label-lg font-label-lg hover:text-primary dark:hover:text-primary transition-colors duration-200" href="#para-quem-e">Para Quem É</a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-medium text-label-lg font-label-lg hover:text-primary dark:hover:text-primary transition-colors duration-200" href="#diferenciais">Diferenciais</a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-medium text-label-lg font-label-lg hover:text-primary dark:hover:text-primary transition-colors duration-200" href="#suporte">Suporte</a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-medium text-label-lg font-label-lg hover:text-primary dark:hover:text-primary transition-colors duration-200" href="#planos">Planos</a>
</nav>
<div className="flex items-center gap-4">
<a className="text-on-surface hover:text-secondary text-label-lg font-label-lg transition-colors px-3 py-2 hidden sm:inline-flex items-center gap-1.5" href="/entrar">
<span className="material-symbols-outlined text-[18px]">lock</span>
          Acessar Conta
        </a>
<a className="bg-primary-container hover:bg-primary text-on-primary-container font-label-lg text-label-lg px-5 py-2.5 rounded-full shadow-md hover:shadow-primary-container/40 transition-all duration-200 active:scale-95 flex items-center gap-2" href="/cadastro">
<span className="">Começar Agora</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
</div>
</div>
</header>
<main className="relative z-10 pt-28 pb-20">
<section className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-16 flex flex-col items-center text-center">
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high/90 border border-primary/30 text-primary mb-6 shadow-sm">
<span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
<span className="text-label-caps font-label-caps uppercase tracking-wider text-primary">FEITO PARA A ROTINA DO SEU NEGÓCIO</span>
</div>
<h1 className="text-display-hero-mobile md:text-display-hero font-display-hero text-on-surface max-w-4xl tracking-tight leading-none mb-6">
        Gestão inteligente <br className="hidden sm:block" />
<span className="bg-gradient-to-r from-primary via-primary-fixed to-secondary bg-clip-text text-transparent">
          para negócios de beleza
        </span>
</h1>
<p className="text-body-lg font-body-lg text-on-surface-variant max-w-3xl mb-8 leading-relaxed">
        Agenda, clientes, equipe e finanças em um só lugar, com ferramentas inteligentes para ajudar você a decidir o que merece atenção. E o melhor: tudo configurável para o seu jeito de trabalhar.
      </p>
<div className="flex flex-wrap items-center justify-center gap-3 mb-10">
<span className="px-5 py-2 rounded-full bg-white text-surface-container font-label-lg text-label-lg shadow-sm font-bold flex items-center gap-1.5 cursor-default hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[18px] text-surface-container">content_cut</span>
          Barbearias
        </span>
<span className="px-5 py-2 rounded-full bg-white text-surface-container font-label-lg text-label-lg shadow-sm font-bold flex items-center gap-1.5 cursor-default hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[18px] text-surface-container">brush</span>
          Salões
        </span>
<span className="px-5 py-2 rounded-full bg-white text-surface-container font-label-lg text-label-lg shadow-sm font-bold flex items-center gap-1.5 cursor-default hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[18px] text-surface-container">auto_awesome</span>
          Trancistas
        </span>
<span className="px-5 py-2 rounded-full bg-white text-surface-container font-label-lg text-label-lg shadow-sm font-bold flex items-center gap-1.5 cursor-default hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[18px] text-surface-container">person</span>
          Autônomos
        </span>
</div>
<div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
<a className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary-container text-on-primary-container font-label-lg text-label-lg font-extrabold shadow-lg shadow-primary-container/25 hover:shadow-primary-container/40 hover:bg-primary transition-all duration-200 active:scale-95 flex items-center justify-center gap-2" href="/cadastro">
<span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings": "'FILL' 1"}}>bolt</span>
          Começar Gratuitamente
        </a>
<a className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-surface-container-high/80 hover:bg-surface-container-high text-on-surface border border-outline-variant/40 font-label-lg text-label-lg transition-all duration-200 flex items-center justify-center gap-2" href="/painel">
<span className="material-symbols-outlined text-[20px]">play_circle</span>
          Ver Demonstração da Plataforma
        </a>
</div>
<div className="relative w-full max-w-4xl mx-auto">
<div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-outline-variant/30 mockup-glow shadow-2xl"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtI8o1S16XuhKnFaIohi3vSaxv1Z9O6CpEmjM-HdrJ8JmZRXTQKQZLXF9epxL_Yv2aLdh3JVXoO-xYdGiboxw4YjB8_suI23wxrLG2PRiNjFkBiZ5mnxNGC7ysj9HiMUlP8tmDMFHrTr74wNpZcFMlLpAorIogk52mFSXVFP6DvutR67aMAo6M-K6if4tBaNHohtp2lax2BHw55HE4_50rL1lgvS6lST1XDKTe0W9mGkNLwQqVa8Ad-A" alt="Demonstração do Sistema Carvel - Agenda e Gestão" className="w-full h-auto block rounded-2xl md:rounded-3xl object-cover" /></div>
<div className="mt-8 mx-auto max-w-3xl rounded-full border-2 border-secondary/60 bg-surface-container/90 backdrop-blur-md px-6 py-4 shadow-xl shadow-secondary/10 flex items-center justify-center text-center">
<p className="text-headline-sm md:text-headline-md font-headline-md text-on-surface">Organize horários, clientes e <span className="text-secondary font-extrabold">finanças em um só lugar.</span></p>
</div>
</div>
</section>
<section className="max-w-7xl mx-auto px-6 md:px-10 py-20 border-t border-outline-variant/15" id="para-quem-e">
<div className="text-center max-w-2xl mx-auto mb-14"><span className="text-label-caps font-label-caps text-secondary uppercase tracking-widest block mb-2">SOLUÇÕES PARA CADA ESPECIALIDADE</span><h2 className="text-headline-lg font-headline-lg text-on-surface">Um só sistema. Diferentes negócios de beleza.</h2><p className="text-body-md font-body-md text-on-surface-variant mt-3 max-w-2xl mx-auto leading-relaxed">Seja você proprietário de uma barbearia, profissional autônomo ou gestor de um estúdio de estética, o Carvel reúne as ferramentas necessárias para organizar sua rotina, atender melhor seus clientes e acompanhar os resultados do negócio.</p></div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><div className="bg-surface-container/70 border border-outline-variant/20 hover:border-secondary/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"><div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[28px]">content_cut</span></div><h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Barbearias</h3><p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">Organize a agenda dos barbeiros, gerencie a fila de espera, controle comandas, vendas e comissões em um só lugar.</p><div className="mt-4 flex items-center text-label-md font-label-md text-secondary gap-1 group-hover:gap-2 transition-all"><span className="">Saber mais</span><span className="material-symbols-outlined text-[16px]">chevron_right</span></div></div><div className="bg-surface-container/70 border border-outline-variant/20 hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"><div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[28px]">brush</span></div><h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Salões de Beleza</h3><p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">Gerencie vários profissionais, organize serviços, horários, clientes e acompanhe o financeiro do salão.</p><div className="mt-4 flex items-center text-label-md font-label-md text-primary gap-1 group-hover:gap-2 transition-all"><span className="">Saber mais</span><span className="material-symbols-outlined text-[16px]">chevron_right</span></div></div><div className="bg-surface-container/70 border border-outline-variant/20 hover:border-secondary/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"><div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[28px]">face</span></div><h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Cabeleireiros</h3><p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">Controle sua agenda, serviços, histórico dos clientes, produtos utilizados e pagamentos com mais praticidade.</p><div className="mt-4 flex items-center text-label-md font-label-md text-secondary gap-1 group-hover:gap-2 transition-all"><span className="">Saber mais</span><span className="material-symbols-outlined text-[16px]">chevron_right</span></div></div><div className="bg-surface-container/70 border border-outline-variant/20 hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"><div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[28px]">spa</span></div><h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Manicures</h3><p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">Organize seus horários, acompanhe a frequência das clientes, gerencie serviços e facilite o controle dos recebimentos.</p><div className="mt-4 flex items-center text-label-md font-label-md text-primary gap-1 group-hover:gap-2 transition-all"><span className="">Saber mais</span><span className="material-symbols-outlined text-[16px]">chevron_right</span></div></div><div className="bg-surface-container/70 border border-outline-variant/20 hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"><div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[28px]">auto_awesome</span></div><h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Trancistas</h3><p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">Gerencie serviços de longa duração, horários, disponibilidade, clientes e agendamentos antecipados.</p><div className="mt-4 flex items-center text-label-md font-label-md text-primary gap-1 group-hover:gap-2 transition-all"><span className="">Saber mais</span><span className="material-symbols-outlined text-[16px]">chevron_right</span></div></div><div className="bg-surface-container/70 border border-outline-variant/20 hover:border-secondary/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"><div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[28px]">visibility</span></div><h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Designers de Sobrancelhas</h3><p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">Organize procedimentos, horários, histórico das clientes e acompanhe os retornos para manter sua agenda ativa.</p><div className="mt-4 flex items-center text-label-md font-label-md text-secondary gap-1 group-hover:gap-2 transition-all"><span className="">Saber mais</span><span className="material-symbols-outlined text-[16px]">chevron_right</span></div></div><div className="bg-surface-container/70 border border-outline-variant/20 hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"><div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[28px]">medical_services</span></div><h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Estúdios de Estética</h3><p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">Gerencie procedimentos, profissionais, sessões, pacotes de serviços, clientes e movimentações financeiras.</p><div className="mt-4 flex items-center text-label-md font-label-md text-primary gap-1 group-hover:gap-2 transition-all"><span className="">Saber mais</span><span className="material-symbols-outlined text-[16px]">chevron_right</span></div></div><div className="bg-surface-container/70 border border-outline-variant/20 hover:border-secondary/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"><div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[28px]">person</span></div><h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Profissionais Autônomos</h3><p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">Tenha agenda, clientes, serviços, pagamentos e gestão do seu negócio organizados, mesmo trabalhando por conta própria.</p><div className="mt-4 flex items-center text-label-md font-label-md text-secondary gap-1 group-hover:gap-2 transition-all"><span className="">Saber mais</span><span className="material-symbols-outlined text-[16px]">chevron_right</span></div></div></div>
<div className="mt-14 mx-auto max-w-3xl text-center rounded-2xl bg-surface-container/50 border border-outline-variant/20 p-6 md:p-8"><h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Seu segmento, suas regras, sua gestão.</h3><p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">Com configurações adaptáveis, o Carvel acompanha a maneira como você trabalha, sem exigir que seu negócio se adapte a um sistema engessado.</p></div></section>
<section className="max-w-7xl mx-auto px-6 md:px-10 py-20 border-t border-outline-variant/15" id="funcionalidades">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
<div>
<span className="text-label-caps font-label-caps text-primary uppercase tracking-widest block mb-2">Módulos Completos</span>
<h2 className="text-headline-lg font-headline-lg text-on-surface">O que você encontra no Carvel</h2>
<p className="text-body-md font-body-md text-on-surface-variant max-w-xl mt-2">
            A potência de um ERP completo com a fluidez e facilidade de um aplicativo moderno. Tudo integrado sem complexidade.
          </p>
</div>
<div className="flex items-center gap-3">
<span className="px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-secondary border border-secondary/30 flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-secondary"></span> 10 Recursos Nativos
          </span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:border-primary/50 transition-colors group">
<div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">calendar_today</span>
</div>
<span className="text-label-caps font-label-caps text-primary tracking-wider uppercase">01 / Agendamento</span>
<h3 className="text-headline-sm font-headline-sm text-on-surface mt-1 mb-2">Agenda Organizada</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
            Gerencie horários, profissionais e atendimentos em uma rotina mais clara. Identifique conflitos e acompanhe confirmações, cancelamentos e horários disponíveis.
          </p>
</div>
<div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:border-secondary/50 transition-colors group">
<div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">link</span>
</div>
<span className="text-label-caps font-label-caps text-secondary tracking-wider uppercase">02 / Conexão 24/7</span>
<h3 className="text-headline-sm font-headline-sm text-on-surface mt-1 mb-2">Agendamento Online</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
            Compartilhe um link ou QR Code para que seus clientes conheçam seus serviços e solicitem horários 24/7, reduzindo interrupções na sua rotina.
          </p>
</div>
<div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:border-primary/50 transition-colors group">
<div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">badge</span>
</div>
<span className="text-label-caps font-label-caps text-primary tracking-wider uppercase">03 / CRM Personalizado</span>
<h3 className="text-headline-sm font-headline-sm text-on-surface mt-1 mb-2">Cadastro e Histórico de Clientes</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
            Mantenha contatos, preferências, serviços realizados e histórico de visitas organizados para oferecer um atendimento mais próximo e personalizado.
          </p>
</div>
<div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:border-secondary/50 transition-colors group">
<div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">loyalty</span>
</div>
<span className="text-label-caps font-label-caps text-secondary tracking-wider uppercase">04 / Retenção Ativa</span>
<h3 className="text-headline-sm font-headline-sm text-on-surface mt-1 mb-2">Clientes para Retornar e Fidelização</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
            Identifique oportunidades para convidar clientes a voltar e acompanhe iniciativas de relacionamento e fidelização de forma proativa.
          </p>
</div>
<div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:border-primary/50 transition-colors group">
<div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">groups</span>
</div>
<span className="text-label-caps font-label-caps text-primary tracking-wider uppercase">05 / Gestão de Pessoal</span>
<h3 className="text-headline-sm font-headline-sm text-on-surface mt-1 mb-2">Serviços e Equipe</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
            Organize serviços, duração, preços, profissionais, especialidades e regras de comissão com clareza para toda a equipe.
          </p>
</div>
<div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:border-secondary/50 transition-colors group">
<div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">receipt_long</span>
</div>
<span className="text-label-caps font-label-caps text-secondary tracking-wider uppercase">06 / Fluxo de Caixa</span>
<h3 className="text-headline-sm font-headline-sm text-on-surface mt-1 mb-2">Atendimentos e Comandas</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
            Acompanhe cada atendimento e reúna serviços e produtos em uma comanda para facilitar o fechamento e evitar perdas financeiras.
          </p>
</div>
<div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:border-primary/50 transition-colors group">
<div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">point_of_sale</span>
</div>
<span className="text-label-caps font-label-caps text-primary tracking-wider uppercase">07 / Financeiro Integrado</span>
<h3 className="text-headline-sm font-headline-sm text-on-surface mt-1 mb-2">Caixa, PDV e Pagamentos</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
            Registre vendas e pagamentos e acompanhe os movimentos do caixa e do financeiro em tempo real com conciliação automática.
          </p>
</div>
<div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:border-secondary/50 transition-colors group">
<div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">percent</span>
</div>
<span className="text-label-caps font-label-caps text-secondary tracking-wider uppercase">08 / Transparência</span>
<h3 className="text-headline-sm font-headline-sm text-on-surface mt-1 mb-2">Comissões Transparentes</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
            Consulte valores por profissional e acompanhe regras de comissão ligadas aos serviços e produtos com relatórios detalhados individuais.
          </p>
</div>
<div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:border-primary/50 transition-colors group">
<div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">inventory_2</span>
</div>
<span className="text-label-caps font-label-caps text-primary tracking-wider uppercase">09 / Almoxarifado</span>
<h3 className="text-headline-sm font-headline-sm text-on-surface mt-1 mb-2">Produtos e Estoque</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
            Cadastre produtos, acompanhe quantidades e receba alertas quando um item atingir o estoque mínimo definido para reposição pontual.
          </p>
</div>
<div className="p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:border-secondary/50 transition-colors group md:col-span-2 lg:col-span-3 bg-gradient-to-r from-surface-container-high/60 to-surface-container-low/80">
<div className="flex flex-col md:flex-row md:items-center gap-6">
<div className="w-12 h-12 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[28px]">query_stats</span>
</div>
<div>
<span className="text-label-caps font-label-caps text-secondary tracking-wider uppercase">10 / Decisões Estratégicas</span>
<h3 className="text-headline-sm font-headline-sm text-on-surface mt-0.5 mb-1.5">Relatórios e Metas</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant">
                Visualize indicadores do negócio, acompanhe resultados e monitore metas por período através de gráficos intuitivos que guiam o crescimento do seu negócio.
              </p>
</div>
</div>
</div>
</div>
</section>
<section className="max-w-7xl mx-auto px-6 md:px-10 py-20 border-t border-outline-variant/15" id="diferenciais">
<div className="text-center max-w-3xl mx-auto mb-16">
<span className="text-label-caps font-label-caps text-secondary uppercase tracking-widest block mb-2">Diferenciais Competitivos</span>
<h2 className="text-headline-lg font-headline-lg text-on-surface">Inteligência que trabalha enquanto você cuida dos clientes</h2>
<p className="text-body-md font-body-md text-on-surface-variant mt-3">
          Chega de perder tempo enviando mensagens individuais ou tentando adivinhar quais clientes estão sumidos. O Carvel processa suas rotinas automaticamente.
        </p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
<div className="rounded-3xl bg-surface-container/90 border border-outline-variant/25 p-8 relative overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-all shadow-xl">
<div className="relative z-10">
<div className="w-14 h-14 rounded-2xl bg-primary-container/20 border border-primary/40 text-primary flex items-center justify-center mb-6">
<span className="material-symbols-outlined text-[32px]">notifications_active</span>
</div>
<h3 className="text-headline-sm font-headline-sm text-on-surface mb-3">Alertas Inteligentes</h3>
<p className="text-body-md font-body-md text-on-surface-variant leading-relaxed mb-6">
              O Carvel pode sinalizar clientes perto do período habitual de retorno, produtos com estoque baixo e horários com pouca ocupação, ajudando você a decidir o que merece atenção imediata.
            </p>
</div>
<div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-4 text-xs font-mono">
<div className="flex items-center gap-2 text-primary font-sans font-bold mb-1.5">
<span className="material-symbols-outlined text-[16px]">info</span> Alerta de Recorrência
            </div>
<p className="text-slate-300 font-sans">
              "7 clientes habituals não agendam há mais de 28 dias. Sugerir retorno?"
            </p>
</div>
</div>
<div className="rounded-3xl bg-surface-container/90 border border-outline-variant/25 p-8 relative overflow-hidden flex flex-col justify-between group hover:border-secondary/50 transition-all shadow-xl">
<div className="relative z-10">
<div className="w-14 h-14 rounded-2xl bg-secondary/15 border border-secondary/40 text-secondary flex items-center justify-center mb-6">
<span className="material-symbols-outlined text-[32px]">forum</span>
</div>
<h3 className="text-headline-sm font-headline-sm text-on-surface mb-3">WhatsApp e Automações</h3>
<p className="text-body-md font-body-md text-on-surface-variant leading-relaxed mb-6">
              Prepare comunicações automáticas para confirmar horários, lembrar clientes na véspera e incentivar retornos sem nenhum esforço manual.
            </p>
</div>
<div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-4 text-xs font-mono">
<div className="flex items-center gap-2 text-secondary font-sans font-bold mb-1.5">
<span className="material-symbols-outlined text-[16px]">check_circle</span> Notificação WhatsApp
            </div>
<p className="text-slate-300 font-sans">
              Lembrete enviado 24h antes: taxa de faltas reduzida em até 78%.
            </p>
</div>
</div>
<div className="rounded-3xl bg-surface-container/90 border border-outline-variant/25 p-8 relative overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-all shadow-xl">
<div className="relative z-10">
<div className="w-14 h-14 rounded-2xl bg-primary-container/20 border border-primary/40 text-primary flex items-center justify-center mb-6">
<span className="material-symbols-outlined text-[32px]">tune</span>
</div>
<h3 className="text-headline-sm font-headline-sm text-on-surface mb-3">Configurável para o Seu Jeito</h3>
<p className="text-body-md font-body-md text-on-surface-variant leading-relaxed mb-6">
              Barbearia por ordem de chegada, salão com vários profissionais ou profissional autônomo: você define as regras e o Carvel se adapta harmonicamente à sua rotina.
            </p>
</div>
<div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-4 text-xs font-mono">
<div className="flex items-center gap-2 text-primary font-sans font-bold mb-1.5">
<span className="material-symbols-outlined text-[16px]">settings_suggest</span> Regras Customizáveis
            </div>
<p className="text-slate-300 font-sans">
              Ative ou desative módulos conforme a estrutura do seu espaço evolui.
            </p>
</div>
</div>
</div>
</section>
<section className="max-w-7xl mx-auto px-6 md:px-10 py-20 border-t border-outline-variant/15" id="suporte">
<div className="bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low rounded-3xl border border-outline-variant/30 p-8 md:p-14 relative overflow-hidden shadow-2xl">
<div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
<div className="lg:col-span-7">
<span className="px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-label-caps font-label-caps uppercase tracking-wider inline-block mb-4">
              Acompanhamento Humano • Sem Robôs Frios
            </span>
<h2 className="text-headline-lg font-headline-lg text-on-surface mb-4">
              Você não precisa aprender a usar o sistema sozinho!
            </h2>
<p className="text-body-lg font-body-lg text-on-surface-variant leading-relaxed mb-6">
              Oferecemos suporte para ajudar durante a utilização do Carvel e treinamento para orientar você na configuração e no uso das principais funcionalidades. Nossa equipe acompanha seus primeiros passos para que você aproveite melhor os recursos e tenha mais segurança na gestão do seu negócio.
            </p>
<div className="space-y-4">
<div className="flex items-start gap-3">
<div className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[16px]">check</span>
</div>
<div>
<h4 className="text-label-lg font-label-lg text-on-surface">Suporte Humano Ágil</h4>
<p className="text-body-sm font-body-sm text-on-surface-variant">Atendimento pronto via WhatsApp e canais dedicados para resolver dúvidas com especialistas.</p>
</div>
</div>
<div className="flex items-start gap-3">
<div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[16px]">check</span>
</div>
<div>
<h4 className="text-label-lg font-label-lg text-on-surface">Treinamento Prático de Boas-Vindas</h4>
<p className="text-body-sm font-body-sm text-on-surface-variant">Sessões guiadas para cadastrar sua equipe, serviços e migrar clientes sem perda de dados.</p>
</div>
</div>
<div className="flex items-start gap-3">
<div className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[16px]">check</span>
</div>
<div>
<h4 className="text-label-lg font-label-lg text-on-surface">Implantação Descomplicada</h4>
<p className="text-body-sm font-body-sm text-on-surface-variant">Seu negócio operando com o sistema ativo em minutos, sem manuais confusos ou termos técnicos difíceis.</p>
</div>
</div>
</div>
</div>
<div className="lg:col-span-5 flex flex-col justify-center">
<div className="bg-surface-container-lowest/80 border border-outline-variant/30 rounded-2xl p-6 shadow-xl text-center">
<div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-4 shadow-lg">
<span className="material-symbols-outlined text-3xl" style={{"fontVariationSettings": "'FILL' 1"}}>support_agent</span>
</div>
<h3 className="text-headline-sm font-headline-sm text-on-surface mb-1">Time de Sucesso do Cliente</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-6">
                Especialistas que entendem o ritmo do salão e da barbearia prontos para orientar você.
              </p>
<a className="w-full py-3 rounded-full bg-secondary text-on-secondary font-label-lg text-label-lg font-bold hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-2" href="#falar-consultor">
<span className="material-symbols-outlined text-[20px]">chat</span>
                Falar com Especialista de Implantação
              </a>
</div>
</div>
</div>
</div>
</section>
<section className="max-w-7xl mx-auto px-6 md:px-10 py-20 border-t border-outline-variant/15" id="planos"><div className="text-center max-w-3xl mx-auto mb-14">
    <span className="text-label-caps font-label-caps text-secondary uppercase tracking-widest block mb-2">Planos e Preços Flexíveis</span>
    <h2 className="text-headline-lg font-headline-lg text-on-surface">Escolha o plano ideal para a fase do seu negócio</h2>
    <p className="text-body-md font-body-md text-on-surface-variant mt-3">
      Soluções acessíveis e transparentes pensadas tanto para profissionais autônomos quanto para equipes completas.
    </p>
    <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-surface-container-high/80 border border-outline-variant/30 text-xs font-semibold text-on-surface-variant">
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-secondary">
        <span className="material-symbols-outlined text-[16px]">verified</span>
        Sem surpresas ou taxas escondidas
      </span>
      <span className="pr-3 hidden sm:inline-block text-on-surface-variant/80">• Escolha entre Acesso Vitalício ou Mensalidade Flexível</span>
    </div>
  </div>
  <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
    <div className="rounded-3xl bg-surface-container/70 border border-outline-variant/25 hover:border-secondary/40 p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl group relative overflow-hidden">
      <div className="absolute -right-16 -top-16 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-label-caps font-label-caps text-secondary uppercase tracking-wider">Autônomo &amp; Individual</span>
          <span className="bg-secondary/15 text-secondary border border-secondary/30 px-3 py-1 rounded-full text-label-caps font-label-caps uppercase tracking-wider font-bold">
            Acesso Vitalício
          </span>
        </div>
        <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Plano Iniciante</h3>
        <p className="text-body-sm font-body-sm text-on-surface-variant mb-6 leading-relaxed">
          Perfeito para profissionais autônomos, trancistas, manicures, designers ou quem está saindo da agenda de papel e quer custo zero de mensalidade.
        </p>
        <div className="mb-8">
          <div className="flex items-baseline gap-1.5">
            <span className="text-on-surface font-bold text-headline-sm">R$</span>
            <span className="text-display-hero-mobile md:text-headline-lg font-extrabold text-on-surface">97,90</span>
          </div>
          <p className="text-body-sm font-body-sm text-secondary font-medium mt-1">
            Pagamento único — Sem mensalidades recorrentes
          </p>
        </div>
        <div className="space-y-3.5 border-t border-outline-variant/15 pt-6 mb-8 text-body-sm font-body-sm text-on-surface-variant">
          <div className="flex items-start gap-2.5 text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span>
            <span className=""><strong>1 Profissional Independente</strong> (gestão própria da bancada, maca ou cadeira)</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span>
            <span className="">Agenda Organizada sem conflitos de horários</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span>
            <span className="">Agendamento Online 24/7 com Link exclusivo e QR Code para bio</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span>
            <span className="">Cadastro &amp; Histórico de Clientes com ficha detalhada</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span>
            <span className="">Atendimentos &amp; Comandas de balcão integradas</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span>
            <span className="">Controle de Caixa &amp; Formas de Pagamento (Pix, Cartão, Dinheiro)</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span>
            <span className="">Dados 100% seguros com backup em nuvem de alta performance</span>
          </div>
        </div>
      </div>
      <a href="/cadastro" className="w-full py-3.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-secondary/40 hover:border-secondary font-label-lg text-label-lg font-bold transition-all text-center block active:scale-95 shadow-md">
        Adquirir Acesso Vitalício
      </a>
    </div>
    <div className="rounded-3xl bg-surface-container/95 border-2 border-primary-container p-8 flex flex-col justify-between relative shadow-2xl mockup-glow transition-all duration-300 hover:-translate-y-1 group">
      <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
        <span className="bg-primary text-on-primary font-label-caps uppercase tracking-wider px-4 py-1 rounded-full text-xs font-bold shadow-md">
          Mais Escolhido
        </span>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4 mt-1">
          <span className="text-label-caps font-label-caps text-primary uppercase tracking-wider">Salões, Barbearias &amp; Estúdios</span>
          <span className="bg-primary-container/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-label-caps font-label-caps uppercase tracking-wider font-bold">
            Plano Completo
          </span>
        </div>
        <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">Plano Profissional</h3>
        <p className="text-body-sm font-body-sm text-on-surface-variant mb-6 leading-relaxed">
          O motor de crescimento definitivo para negócios com equipe, múltiplos profissionais, comissões e automação inteligente.
        </p>
        <div className="mb-8">
          <div className="flex items-baseline gap-1.5">
            <span className="text-on-surface font-bold text-headline-sm">R$</span>
            <span className="text-display-hero-mobile md:text-headline-lg font-extrabold text-primary">29,90</span>
            <span className="text-body-sm font-body-sm text-on-surface-variant font-medium">/mês</span>
          </div>
          <p className="text-body-sm font-body-sm text-primary font-medium mt-1">
            Teste grátis por 7 dias • Cancele quando quiser sem multas
          </p>
        </div>
        <div className="space-y-3.5 border-t border-outline-variant/25 pt-6 mb-8 text-body-sm font-body-sm text-on-surface-variant">
          <div className="flex items-start gap-2.5 text-on-surface font-semibold">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
            <span className="">Tudo incluído no Plano Iniciante, mais:</span>
          </div>
          <div className="flex items-start gap-2.5 text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
            <span className=""><strong>Múltiplos Profissionais</strong> com acessos, logins e permissões individuais</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
            <span className="">Fluxos e Regras 100% Configuráveis (ordem de chegada ou horário marcado)</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
            <span className="">Divisão &amp; Split Automático de Comissões por serviço e produto</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
            <span className="">CRM Preditivo com alertas inteligentes de retorno de clientes</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
            <span className="">WhatsApp &amp; Automações de confirmação e lembretes automáticos</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
            <span className="">Controle de Estoque Mínimo com aviso de reposição</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
            <span className="">Relatórios Financeiros, metas de faturamento e ticket médio</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">check_circle</span>
            <span className="">Implantação e treinamento prático prioritário</span>
          </div>
        </div>
      </div>
      <a href="/cadastro" className="w-full py-3.5 rounded-full bg-primary-container hover:bg-primary text-on-primary-container font-label-lg text-label-lg font-extrabold shadow-lg shadow-primary-container/25 hover:shadow-primary-container/40 transition-all text-center flex items-center justify-center gap-2 active:scale-95">
        <span className="">Começar Agora com Teste Grátis</span>
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
    </div>
  </div>
  <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-on-surface-variant text-body-sm font-body-sm">
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
      <span className="">Teste 7 dias sem compromisso</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">cancel_schedule_send</span>
      <span className="">Cancele quando quiser sem multas</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-secondary text-[20px]">lock</span>
      <span className="">Dados 100% seguros e criptografados</span>
    </div>
  </div></section><section className="max-w-7xl mx-auto px-6 md:px-10 py-16 text-center">
<div className="max-w-3xl mx-auto">
<h2 className="text-display-hero-mobile md:text-headline-lg font-headline-lg text-on-surface mb-6">
          Pronto para simplificar a gestão do seu espaço de beleza?
        </h2>
<p className="text-body-lg font-body-lg text-on-surface-variant mb-8 leading-relaxed">
          Deixe a agenda de papel para trás hoje mesmo. Experimente o Carvel e descubra a sensação de ter sua rotina sob controle total.
        </p>
<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
<a className="w-full sm:w-auto px-10 py-4 rounded-full bg-primary-container text-on-primary-container font-label-lg text-label-lg font-extrabold shadow-xl hover:shadow-primary-container/40 hover:bg-primary transition-all duration-200 active:scale-95 flex items-center justify-center gap-2" href="/cadastro">
<span className="material-symbols-outlined text-[22px]">rocket_launch</span>
            Começar Agora Gratuitamente
          </a>
<a className="w-full sm:w-auto px-8 py-4 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 font-label-lg text-label-lg transition-colors" href="#planos">
            Conhecer Todos os Planos
          </a>
</div>
<p className="text-xs text-on-surface-variant/80 mt-4">Sem necessidade de cartão de crédito para o teste gratuito • Cancele a qualquer momento</p>
</div>
</section>
</main>
<footer className="w-full bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline-variant/15 dark:border-outline-variant/15">
<div className="w-full px-6 md:px-12 py-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
<div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
<div className="flex items-center gap-2 text-headline-sm font-headline-sm font-bold text-on-surface dark:text-on-surface">
<div className="w-8 h-8 rounded-lg bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>calendar_month</span>
</div>
<span className="">Carvel</span>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant dark:text-on-surface-variant">
          © 2026 Carvel Gestão Inteligente. Todos os direitos reservados.
        </p>
</div>
<div className="flex flex-wrap justify-center items-center gap-6">
<a className="text-on-surface-variant dark:text-on-surface-variant text-label-md font-label-md hover:text-primary dark:hover:text-primary transition-colors duration-200" href="#termos">Termos de Uso</a>
<a className="text-on-surface-variant dark:text-on-surface-variant text-label-md font-label-md hover:text-primary dark:hover:text-primary transition-colors duration-200" href="#privacidade">Política de Privacidade</a>
<a className="text-on-surface-variant dark:text-on-surface-variant text-label-md font-label-md hover:text-primary dark:hover:text-primary transition-colors duration-200" href="#ajuda">Central de Ajuda</a>
<a className="text-on-surface-variant dark:text-on-surface-variant text-label-md font-label-md hover:text-primary dark:hover:text-primary transition-colors duration-200" href="#status">Status do Sistema</a>
<a className="text-on-surface-variant dark:text-on-surface-variant text-label-md font-label-md hover:text-primary dark:hover:text-primary transition-colors duration-200" href="#contato">Contato</a>
</div>
</div>
</footer>

    </div>
    <div className="carvel-mobile md:hidden antialiased selection:bg-brand-accent selection:text-brand-dark">

<header className="sticky top-0 z-50 bg-[#031716]/90 backdrop-blur-md border-b border-brand-border/60 transition-all duration-200">
<div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
<a aria-label="Página Inicial do Carvel" className="flex items-center gap-2.5 focus:outline-none" href="/">
<div className="w-9 h-9 rounded-xl bg-brand-lilac flex items-center justify-center text-brand-dark shadow-sm">
<svg className="w-5 h-5 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
<rect height="18" rx="3" ry="3" width="18" x="3" y="4"></rect>
<line x1="16" x2="16" y1="2" y2="6"></line>
<line x1="8" x2="8" y1="2" y2="6"></line>
<line x1="3" x2="21" y1="10" y2="10"></line>
<circle cx="8" cy="14" fill="currentColor" r="1"></circle>
<circle cx="12" cy="14" fill="currentColor" r="1"></circle>
<circle cx="16" cy="14" fill="currentColor" r="1"></circle>
</svg>
</div>
<span className="font-display font-bold text-xl tracking-tight text-white">Carvel</span>
</a>
<div className="flex items-center gap-2.5">
<a className="px-3 py-1.5 text-xs font-semibold text-brand-accent border border-brand-accent/40 rounded-full hover:bg-brand-accent/10 transition-colors" href="/entrar">
          Acessar
        </a>
<a className="px-4 py-1.5 text-xs font-bold text-[#031716] bg-brand-lilac rounded-full hover:bg-brand-lilacHover shadow-md transition-all" href="/cadastro">
          Começar
        </a>
</div>
</div>
</header>
<main className="max-w-md mx-auto px-4 pt-6 pb-16 overflow-hidden relative">
<section className="relative pt-2 pb-8 text-center" data-purpose="hero-section">
<div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-80 glow-radial pointer-events-none -z-10"></div>
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-lilac mb-4 badge-glow"><span className="w-1.5 h-1.5 rounded-full bg-brand-mint animate-pulse"></span>
        FEITO PARA A ROTINA DO SEU NEGÓCIO</div>
<h1 className="text-3xl font-extrabold text-white tracking-tight leading-[1.2] mb-3">
        Gestão inteligente para negócios de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lilac to-brand-mint">beleza</span>
</h1>
<p className="text-gray-300 text-sm leading-relaxed max-w-sm mx-auto mb-5 font-normal">
        Agenda, clientes, equipe e finanças em um só lugar, com ferramentas inteligentes para o seu jeito de trabalhar.
      </p>
<div className="flex flex-wrap justify-center gap-1.5 mb-6" data-purpose="audience-badges">
<span className="px-3 py-1 rounded-full bg-white text-brand-dark text-xs font-bold shadow-sm">Barbearias</span>
<span className="px-3 py-1 rounded-full bg-white text-brand-dark text-xs font-bold shadow-sm">Salões</span>
<span className="px-3 py-1 rounded-full bg-white text-brand-dark text-xs font-bold shadow-sm">Trancistas</span>
<span className="px-3 py-1 rounded-full bg-white text-brand-dark text-xs font-bold shadow-sm">Autônomos</span>
</div>
<div className="flex flex-col gap-2.5 w-full mb-8">
<a className="w-full py-3.5 px-6 rounded-full bg-brand-lilac hover:bg-brand-lilacHover text-brand-dark font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-lilac/25 transition-all" href="/cadastro">
<span className="">Começar Gratuitamente</span>
<svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</a>
<a className="w-full py-3 px-6 rounded-full bg-brand-surface/90 hover:bg-brand-surface border border-brand-border text-gray-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all" href="/painel">
<svg className="w-4 h-4 text-brand-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<polygon points="5 3 19 12 5 21 5 3"></polygon>
</svg>
<span className="">Ver Demonstração do Sistema</span>
</a>
</div>
<div className="relative mt-6 mb-8 px-3">
<div className="relative rounded-2xl border border-brand-accent/20 bg-brand-surface shadow-2xl p-1.5">
  <img alt="Demonstração do Sistema Carvel - Agenda e Gestão" className="w-full h-auto object-cover rounded-xl block shadow-lg" loading="eager" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOAA2htUDO5P6vvpYLJv5t6NihQAHyKeWLVVoQDYk-5XGQNlJkGUt-XZSA55takKWB9Yu3hDBVcGn2LejifJvixhmyT_07LKJff9h0pUs7_G51yRIXJ7wIYpj0CVDQvXiZ65wi5EVCq2ID2DLxkdjR2bBDV5wLmCZ5UkSUvG3qwX7wn4fOj8YrTCpqojlfBTmJwShBxRYfeUcOzzSOVllhVQg83QP8nTpfysRkxGNRK8ZD3ufa9-73OQ" />
</div>
<div className="mt-4 p-3 rounded-xl bg-brand-surface border border-brand-border text-center shadow-md">
  <p className="text-xs font-semibold text-white">Organize horários, clientes <span className="text-brand-mint font-bold">e finanças em um só lugar.</span></p>
</div></div>
</section>
<section className="py-6" data-purpose="segmentos-atendidos"><div className="text-center mb-6">
<span className="text-[11px] font-bold uppercase tracking-wider text-brand-mint block mb-1 font-display">SOLUÇÕES PARA CADA ESPECIALIDADE</span>
<h2 className="text-2xl font-bold text-white tracking-tight leading-tight">Um só sistema. Diferentes negócios de beleza.</h2>
<p className="text-xs text-gray-300 mt-2 max-w-sm mx-auto leading-relaxed">Seja você proprietário de uma barbearia, profissional autônomo ou gestor de um estúdio de estética, o Carvel reúne as ferramentas necessárias para organizar sua rotina, atender melhor seus clientes e acompanhar os resultados do negócio.</p>
</div>
<div className="grid grid-cols-2 gap-2.5">
<div className="p-3.5 rounded-xl bg-brand-surface/90 border border-brand-border flex flex-col justify-between hover:border-brand-accent/40 transition-colors">
<div>
<div className="w-7 h-7 rounded-lg bg-brand-card flex items-center justify-center text-brand-mint mb-2">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle>
<line x1="20" x2="8.12" y1="4" y2="15.88"></line><line x1="14.47" x2="20" y1="14.48" y2="20"></line>
</svg>
</div>
<h3 className="font-bold text-sm text-white mb-1">Barbearias</h3>
<p className="text-[11px] text-gray-400 leading-tight">Organize a agenda dos barbeiros, gerencie a fila de espera, controle comandas, vendas e comissões em um só lugar.</p>
</div>
<span className="text-[10px] font-semibold text-brand-mint mt-2 block">Saber mais →</span>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface/90 border border-brand-border flex flex-col justify-between hover:border-brand-accent/40 transition-colors">
<div>
<div className="w-7 h-7 rounded-lg bg-brand-card flex items-center justify-center text-brand-lilac mb-2">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
</svg>
</div>
<h3 className="font-bold text-sm text-white mb-1">Salões de Beleza</h3>
<p className="text-[11px] text-gray-400 leading-tight">Gerencie vários profissionais, organize serviços, horários, clientes e acompanhe o financeiro do salão.</p>
</div>
<span className="text-[10px] font-semibold text-brand-mint mt-2 block">Saber mais →</span>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface/90 border border-brand-border flex flex-col justify-between hover:border-brand-accent/40 transition-colors">
<div>
<div className="w-7 h-7 rounded-lg bg-brand-card flex items-center justify-center text-brand-mint mb-2">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3"></path>
</svg>
</div>
<h3 className="font-bold text-sm text-white mb-1">Cabeleireiros</h3>
<p className="text-[11px] text-gray-400 leading-tight">Controle sua agenda, serviços, histórico dos clientes, produtos utilizados e pagamentos com mais praticidade.</p>
</div>
<span className="text-[10px] font-semibold text-brand-mint mt-2 block">Saber mais →</span>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface/90 border border-brand-border flex flex-col justify-between hover:border-brand-accent/40 transition-colors">
<div>
<div className="w-7 h-7 rounded-lg bg-brand-card flex items-center justify-center text-brand-lilac mb-2">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
</svg>
</div>
<h3 className="font-bold text-sm text-white mb-1">Manicures</h3>
<p className="text-[11px] text-gray-400 leading-tight">Organize seus horários, acompanhe a frequência das clientes, gerencie serviços e facilite o controle dos recebimentos.</p>
</div>
<span className="text-[10px] font-semibold text-brand-mint mt-2 block">Saber mais →</span>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface/90 border border-brand-border flex flex-col justify-between hover:border-brand-accent/40 transition-colors">
<div>
<div className="w-7 h-7 rounded-lg bg-brand-card flex items-center justify-center text-brand-mint mb-2">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
</svg>
</div>
<h3 className="font-bold text-sm text-white mb-1">Trancistas</h3>
<p className="text-[11px] text-gray-400 leading-tight">Gerencie serviços de longa duração, horários, disponibilidade, clientes e agendamentos antecipados.</p>
</div>
<span className="text-[10px] font-semibold text-brand-mint mt-2 block">Saber mais →</span>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface/90 border border-brand-border flex flex-col justify-between hover:border-brand-accent/40 transition-colors">
<div>
<div className="w-7 h-7 rounded-lg bg-brand-card flex items-center justify-center text-brand-lilac mb-2">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
</svg>
</div>
<h3 className="font-bold text-sm text-white mb-1">Designers de Sobrancelhas</h3>
<p className="text-[11px] text-gray-400 leading-tight">Organize procedimentos, horários, histórico das clientes e acompanhe os retornos para manter sua agenda ativa.</p>
</div>
<span className="text-[10px] font-semibold text-brand-mint mt-2 block">Saber mais →</span>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface/90 border border-brand-border flex flex-col justify-between hover:border-brand-accent/40 transition-colors">
<div>
<div className="w-7 h-7 rounded-lg bg-brand-card flex items-center justify-center text-brand-mint mb-2">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<rect height="18" rx="2" ry="2" width="18" x="3" y="3"></rect><line x1="9" x2="9" y1="3" y2="21"></line>
</svg>
</div>
<h3 className="font-bold text-sm text-white mb-1">Estúdios de Estética</h3>
<p className="text-[11px] text-gray-400 leading-tight">Gerencie procedimentos, profissionais, sessões, pacotes de serviços, clientes e movimentações financeiras.</p>
</div>
<span className="text-[10px] font-semibold text-brand-mint mt-2 block">Saber mais →</span>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface/90 border border-brand-border flex flex-col justify-between hover:border-brand-accent/40 transition-colors">
<div>
<div className="w-7 h-7 rounded-lg bg-brand-card flex items-center justify-center text-brand-lilac mb-2">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" x2="20" y1="8" y2="14"></line><line x1="23" x2="17" y1="11" y2="11"></line>
</svg>
</div>
<h3 className="font-bold text-sm text-white mb-1">Profissionais Autônomos</h3>
<p className="text-[11px] text-gray-400 leading-tight">Tenha agenda, clientes, serviços, pagamentos e gestão do seu negócio organizados, mesmo trabalhando por conta própria.</p>
</div>
<span className="text-[10px] font-semibold text-brand-mint mt-2 block">Saber mais →</span>
</div>
</div>
<div className="mt-4 p-4 rounded-xl bg-brand-surface border border-brand-border text-center shadow-md">
<h4 className="text-xs font-bold text-white mb-1">Seu segmento, suas regras, sua gestão.</h4>
<p className="text-[11px] text-gray-400 leading-relaxed">Com configurações adaptáveis, o Carvel acompanha a maneira como você trabalha, sem exigir que seu negócio se adapte a um sistema engessado.</p>
</div></section>
<section className="py-8" data-purpose="modulos-completos" id="m-modulos">
<div className="text-center mb-6">
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-[11px] font-bold uppercase text-brand-accent mb-2">
<span className="">●</span> 10 Recursos Nativos
        </div>
<h2 className="text-2xl font-bold text-white tracking-tight">O que você encontra no Carvel</h2>
<p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto">A potência de um ERP completo com a fluidez e facilidade de um app moderno.</p>
</div>
<div className="space-y-3">
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/70 flex gap-3 items-start">
<div className="w-9 h-9 rounded-lg bg-brand-card flex-shrink-0 flex items-center justify-center text-brand-mint font-bold text-xs">
            01
          </div>
<div>
<h3 className="text-sm font-bold text-white mb-0.5">Agenda Organizada</h3>
<p className="text-xs text-gray-300 leading-relaxed">Gerencie horários, profissionais e serviços simultâneos com confirmações e cancelamentos fáceis.</p>
</div>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/70 flex gap-3 items-start">
<div className="w-9 h-9 rounded-lg bg-brand-card flex-shrink-0 flex items-center justify-center text-brand-lilac font-bold text-xs">
            02
          </div>
<div>
<h3 className="text-sm font-bold text-white mb-0.5">Agendamento Online 24/7</h3>
<p className="text-xs text-gray-300 leading-relaxed">Link ou QR Code exclusivo para seus clientes agendarem sozinhos a qualquer hora do dia ou da noite.</p>
</div>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/70 flex gap-3 items-start">
<div className="w-9 h-9 rounded-lg bg-brand-card flex-shrink-0 flex items-center justify-center text-brand-mint font-bold text-xs">
            03
          </div>
<div>
<h3 className="text-sm font-bold text-white mb-0.5">Cadastro e Histórico de Clientes</h3>
<p className="text-xs text-gray-300 leading-relaxed">Mantenha contatos, fotos, preferências e histórico completo de atendimentos em um clique.</p>
</div>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/70 flex gap-3 items-start">
<div className="w-9 h-9 rounded-lg bg-brand-card flex-shrink-0 flex items-center justify-center text-brand-lilac font-bold text-xs">
            04
          </div>
<div>
<h3 className="text-sm font-bold text-white mb-0.5">Clientes para Retornar &amp; Fidelização</h3>
<p className="text-xs text-gray-300 leading-relaxed">Identifique oportunidades para reativar clientes sumidos antes que eles procurem a concorrência.</p>
</div>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/70 flex gap-3 items-start">
<div className="w-9 h-9 rounded-lg bg-brand-card flex-shrink-0 flex items-center justify-center text-brand-mint font-bold text-xs">
            05
          </div>
<div>
<h3 className="text-sm font-bold text-white mb-0.5">Serviços e Equipe</h3>
<p className="text-xs text-gray-300 leading-relaxed">Cadastre serviços com durações, preços flexíveis e regras de comissão individuais para cada colaborador.</p>
</div>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/70 flex gap-3 items-start">
<div className="w-9 h-9 rounded-lg bg-brand-card flex-shrink-0 flex items-center justify-center text-brand-lilac font-bold text-xs">
            06
          </div>
<div>
<h3 className="text-sm font-bold text-white mb-0.5">Atendimentos e Comandas</h3>
<p className="text-xs text-gray-300 leading-relaxed">Acompanhe cada atendimento e adicione produtos à comanda para agilizar o fechamento de conta.</p>
</div>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/70 flex gap-3 items-start">
<div className="w-9 h-9 rounded-lg bg-brand-card flex-shrink-0 flex items-center justify-center text-brand-mint font-bold text-xs">
            07
          </div>
<div>
<h3 className="text-sm font-bold text-white mb-0.5">Caixa, PDV e Pagamentos</h3>
<p className="text-xs text-gray-300 leading-relaxed">Abertura e fechamento de caixa, controle de entradas (Pix, cartão, dinheiro) e conciliação ágil.</p>
</div>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/70 flex gap-3 items-start">
<div className="w-9 h-9 rounded-lg bg-brand-card flex-shrink-0 flex items-center justify-center text-brand-lilac font-bold text-xs">
            08
          </div>
<div>
<h3 className="text-sm font-bold text-white mb-0.5">Comissões Transparentes</h3>
<p className="text-xs text-gray-300 leading-relaxed">Cálculo automático de comissões líquidas com relatórios para evitar atritos com seus profissionais.</p>
</div>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/70 flex gap-3 items-start">
<div className="w-9 h-9 rounded-lg bg-brand-card flex-shrink-0 flex items-center justify-center text-brand-mint font-bold text-xs">
            09
          </div>
<div>
<h3 className="text-sm font-bold text-white mb-0.5">Produtos e Estoque</h3>
<p className="text-xs text-gray-300 leading-relaxed">Monitore consumo interno da bancada e vendas de balcão com alerta de estoque mínimo para reposição.</p>
</div>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/70 flex gap-3 items-start">
<div className="w-9 h-9 rounded-lg bg-brand-card flex-shrink-0 flex items-center justify-center text-brand-lilac font-bold text-xs">
            10
          </div>
<div>
<h3 className="text-sm font-bold text-white mb-0.5">Relatórios e Metas</h3>
<p className="text-xs text-gray-300 leading-relaxed">Dashboards intuitivos de faturamento, tíquete médio e metas mensais que guiam suas decisões financeiras.</p>
</div>
</div>
</div>
</section>
<section className="py-8" data-purpose="diferenciais-competitivos">
<div className="text-center mb-6">
<span className="text-[11px] font-bold uppercase tracking-wider text-brand-mint block mb-1">Diferenciais Competitivos</span>
<h2 className="text-2xl font-bold text-white tracking-tight">Inteligência que trabalha enquanto você atende</h2>
<p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto">Chega de perder tempo enviando mensagens individuais ou tentando adivinhar faturamento.</p>
</div>
<div className="space-y-3.5">
<div className="p-4 rounded-2xl glass-card relative overflow-hidden">
<div className="flex items-center gap-2.5 mb-2.5">
<div className="w-8 h-8 rounded-lg bg-brand-card flex items-center justify-center text-brand-mint">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
<h3 className="font-bold text-white text-base">Alertas Inteligentes</h3>
</div>
<p className="text-xs text-gray-300 leading-relaxed mb-3">
            O Carvel avisa quando clientes habituais estão perto do prazo comum de retorno, sugerindo reativações.
          </p>
<div className="p-2.5 rounded-lg bg-brand-card/90 border border-brand-border text-[11px] text-gray-300 flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-brand-mint"></span>
<span className="">"7 clientes fiéis não agendam há mais de 28 dias. Deseja enviar lembrete?"</span>
</div>
</div>
<div className="p-4 rounded-2xl glass-card relative overflow-hidden">
<div className="flex items-center gap-2.5 mb-2.5">
<div className="w-8 h-8 rounded-lg bg-brand-card flex items-center justify-center text-brand-lilac">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
<h3 className="font-bold text-white text-base">WhatsApp e Automações</h3>
</div>
<p className="text-xs text-gray-300 leading-relaxed mb-3">
            Confirmações e lembretes com botão de confirmação automática direto pelo WhatsApp, cortando faltas.
          </p>
<div className="p-2.5 rounded-lg bg-brand-card/90 border border-brand-border text-[11px] text-gray-300 flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-brand-lilac"></span>
<span className="">Redução média de até 78% na taxa de faltas (no-show).</span>
</div>
</div>
<div className="p-4 rounded-2xl glass-card relative overflow-hidden">
<div className="flex items-center gap-2.5 mb-2.5">
<div className="w-8 h-8 rounded-lg bg-brand-card flex items-center justify-center text-brand-mint">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
<h3 className="font-bold text-white text-base">Configurável para o Seu Jeito</h3>
</div>
<p className="text-xs text-gray-300 leading-relaxed mb-3">
            Barbearia por ordem de chegada, manicure com agenda de gel, ou profissional autônomo individual: ative apenas os módulos que você usa.
          </p>
<div className="p-2.5 rounded-lg bg-brand-card/90 border border-brand-border text-[11px] text-gray-300 flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-brand-mint"></span>
<span className="">Interface limpa e adaptada sem poluição visual.</span>
</div>
</div>
</div>
</section>
<section className="py-6" data-purpose="suporte-e-implantacao">
<div className="p-5 rounded-2xl bg-gradient-to-b from-brand-surface via-brand-card to-brand-surface border border-brand-border relative">
<span className="text-[11px] font-bold uppercase tracking-wider text-brand-mint block mb-1">Acompanhamento Humano</span>
<h2 className="text-xl font-bold text-white leading-snug mb-2">Você não precisa aprender a usar o sistema sozinho!</h2>
<p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Oferecemos suporte para orientar na configuração inicial e garantir que sua rotina fique mais rápida desde o primeiro dia.
        </p>
<div className="space-y-3 mb-5">
<div className="flex items-start gap-2.5 text-xs text-gray-200">
<svg className="w-4 h-4 text-brand-mint flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
<path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
</svg>
<div>
<strong className="text-white block font-semibold">Suporte Humano via WhatsApp:</strong>
<span className="">Atendimento ágil para tirar dúvidas do dia a dia com especialistas.</span>
</div>
</div>
<div className="flex items-start gap-2.5 text-xs text-gray-200">
<svg className="w-4 h-4 text-brand-mint flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
<path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
</svg>
<div>
<strong className="text-white block font-semibold">Treinamento Prático de Boas-Vindas:</strong>
<span className="">Aulas rápidas guiadas para cadastrar equipe e serviços sem complicação.</span>
</div>
</div>
<div className="flex items-start gap-2.5 text-xs text-gray-200">
<svg className="w-4 h-4 text-brand-mint flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
<path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
</svg>
<div>
<strong className="text-white block font-semibold">Implantação Descomplicada:</strong>
<span className="">Seu negócio operando com o sistema ativo em poucos minutos.</span>
</div>
</div>
</div>
<div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border text-center">
<div className="w-10 h-10 rounded-full bg-brand-lilac/20 text-brand-lilac flex items-center justify-center mx-auto mb-2">
<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path>
</svg>
</div>
<h4 className="font-bold text-sm text-white">Time de Sucesso do Cliente</h4>
<p className="text-[11px] text-gray-400 mb-3">Especialistas prontos para esclarecer tudo.</p>
<a className="w-full py-2.5 px-4 rounded-xl bg-brand-mint hover:bg-brand-accent text-brand-dark font-bold text-xs flex items-center justify-center gap-1.5 transition-colors" href="#m-planos">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"></path>
</svg>
<span className="">Falar com Especialista de Implantação</span>
</a>
</div>
</div>
</section>
<section className="py-8" data-purpose="planos-de-assinatura" id="m-planos">
<div className="text-center mb-7 px-1">
  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#48D1B5] block mb-2 font-display">PLANOS E PREÇOS FLEXÍVEIS</span>
  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2.5">
    Escolha o plano ideal para a fase do seu negócio
  </h2>
  <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto mb-4 font-normal">
    Soluções acessíveis e transparentes pensadas tanto para profissionais autônomos quanto para equipes completas.
  </p>
  <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#052422]/90 border border-[#1b4e49] text-[11px] shadow-sm">
    <span className="text-[#48D1B5] font-semibold flex items-center gap-1">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
      Sem surpresas ou taxas escondidas
    </span>
    <span className="text-gray-400 font-normal">• Escolha entre Acesso Vitalício ou Mensalidade Flexível</span>
  </div>
</div>
<div className="space-y-6">
  <div className="p-6 rounded-3xl bg-[#031d1c] border border-[#154642] relative flex flex-col justify-between shadow-xl" data-purpose="plano-iniciante">
    <div>
      <div className="flex items-center justify-between mb-3.5 gap-2">
        <span className="text-[11px] font-extrabold text-[#48D1B5] uppercase tracking-wider">AUTÔNOMO &amp; INDIVIDUAL</span>
        <span className="px-3 py-1 rounded-full border border-[#1e5852] bg-[#072c29] text-[10px] font-bold text-[#48D1B5] uppercase tracking-wider">
          ACESSO VITALÍCIO
        </span>
      </div>
      <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Plano Iniciante</h3>
      <p className="text-xs text-gray-300 leading-relaxed mb-5 font-normal">
        Perfeito para profissionais autônomos, trancistas, manicures, designers ou quem está saindo da agenda de papel e quer custo zero de mensalidade.
      </p>
      <div className="mb-5">
        <div className="flex items-baseline gap-1.5 text-white">
          <span className="text-xl font-bold text-white tracking-tight">R$</span>
          <span className="text-4xl font-extrabold text-white tracking-tight font-display">97,90</span>
        </div>
        <p className="text-xs font-medium text-[#48D1B5] mt-1">
          Pagamento único — Sem mensalidades recorrentes
        </p>
      </div>
      <ul className="space-y-3 mb-6 text-xs text-gray-200">
        <li className="flex items-start gap-2.5 leading-snug">
          <svg className="w-4 h-4 text-[#48D1B5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className=""><strong className="text-white font-bold">1 Profissional Independente</strong> (gestão própria da bancada, maca ou cadeira)</span>
        </li>
        <li className="flex items-start gap-2.5 leading-snug">
          <svg className="w-4 h-4 text-[#48D1B5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="">Agenda Organizada sem conflitos de horários</span>
        </li>
        <li className="flex items-start gap-2.5 leading-snug">
          <svg className="w-4 h-4 text-[#48D1B5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="">Agendamento Online 24/7 com Link exclusivo e QR Code para bio</span>
        </li>
        <li className="flex items-start gap-2.5 leading-snug">
          <svg className="w-4 h-4 text-[#48D1B5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="">Cadastro &amp; Histórico de Clientes com ficha detalhada</span>
        </li>
        <li className="flex items-start gap-2.5 leading-snug">
          <svg className="w-4 h-4 text-[#48D1B5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="">Atendimentos &amp; Comandas de balcão integradas</span>
        </li>
        <li className="flex items-start gap-2.5 leading-snug">
          <svg className="w-4 h-4 text-[#48D1B5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="">Controle de Caixa &amp; Formas de Pagamento (Pix, Cartão, Dinheiro)</span>
        </li>
        <li className="flex items-start gap-2.5 leading-snug">
          <svg className="w-4 h-4 text-[#48D1B5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="">Dados 100% seguros com backup em nuvem de alta performance</span>
        </li>
      </ul>
    </div>
    <a className="w-full py-3.5 px-5 rounded-full bg-[#0a2927] hover:bg-[#0f3835] border border-[#235d56] text-white font-bold text-xs flex items-center justify-center transition-all shadow-sm" href="/cadastro">
      Adquirir Acesso Vitalício
    </a>
  </div>
  <div className="relative pt-3.5" data-purpose="plano-profissional">
    <div className="absolute top-0 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-10 z-10">
      <span className="px-4 py-1.5 rounded-full bg-[#b89bf8] text-[#24005b] text-[10px] font-black uppercase tracking-wider shadow-lg block">
        MAIS ESCOLHIDO
      </span>
    </div>
    <div className="p-6 rounded-3xl bg-[#031918] border-2 border-[#b89bf8]/70 relative flex flex-col justify-between shadow-2xl shadow-[#b89bf8]/15">
      <div>
        <div className="flex items-center justify-between mb-3.5 gap-2">
          <span className="text-[11px] font-extrabold text-[#cbc4d2] uppercase tracking-wider">SALÕES, BARBEARIAS &amp; ESTÚDIOS</span>
          <span className="px-3 py-1 rounded-full border border-[#494551] bg-[#1a2c2f] text-[10px] font-bold text-white uppercase tracking-wider">
            PLANO COMPLETO
          </span>
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Plano Profissional</h3>
        <p className="text-xs text-gray-300 leading-relaxed mb-5 font-normal">
          O motor de crescimento definitivo para negócios com equipe, múltiplos profissionais, comissões e automação inteligente.
        </p>
        <div className="mb-5">
          <div className="flex items-baseline gap-1.5 text-white flex-wrap">
            <span className="text-xl font-bold text-white tracking-tight">R$</span>
            <span className="text-4xl font-extrabold text-white tracking-tight font-display">29,90</span>
            <span className="text-sm text-gray-300 font-medium ml-1">/mês</span>
          </div>
          <p className="text-xs font-normal text-gray-300 mt-1">Sem fidelidade • Cancele quando quiser sem multas</p>
        </div>
        <ul className="space-y-3 mb-6 text-xs text-gray-200">
          <li className="flex items-start gap-2.5 leading-snug font-semibold text-white">
            <svg className="w-4 h-4 text-[#b89bf8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="">Tudo incluído no Plano Iniciante, mais:</span>
          </li>
          <li className="flex items-start gap-2.5 leading-snug">
            <svg className="w-4 h-4 text-[#b89bf8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className=""><strong className="text-white font-bold">Múltiplos Profissionais</strong> com acessos, logins e permissões individuais</span>
          </li>
          <li className="flex items-start gap-2.5 leading-snug">
            <svg className="w-4 h-4 text-[#b89bf8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="">Fluxos e Regras 100% Configuráveis (ordem de chegada ou horário marcado)</span>
          </li>
          <li className="flex items-start gap-2.5 leading-snug">
            <svg className="w-4 h-4 text-[#b89bf8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="">Divisão &amp; Split Automático de Comissões por serviço e produto</span>
          </li>
          <li className="flex items-start gap-2.5 leading-snug">
            <svg className="w-4 h-4 text-[#b89bf8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="">CRM Preditivo com alertas inteligentes de retorno de clientes</span>
          </li>
          <li className="flex items-start gap-2.5 leading-snug">
            <svg className="w-4 h-4 text-[#b89bf8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="">WhatsApp &amp; Automações de confirmação e lembretes automáticos</span>
          </li>
          <li className="flex items-start gap-2.5 leading-snug">
            <svg className="w-4 h-4 text-[#b89bf8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="">Controle de Estoque Mínimo com aviso de reposição</span>
          </li>
          <li className="flex items-start gap-2.5 leading-snug">
            <svg className="w-4 h-4 text-[#b89bf8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="">Relatórios Financeiros, metas de faturamento e ticket médio</span>
          </li>
          <li className="flex items-start gap-2.5 leading-snug">
            <svg className="w-4 h-4 text-[#b89bf8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="">Implantação e treinamento prático prioritário</span>
          </li>
        </ul>
      </div>
      <a className="w-full py-3.5 px-5 rounded-full bg-[#b89bf8] hover:bg-[#a78af0] text-[#24005b] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#b89bf8]/25 transition-all" href="/cadastro">
        <span className="">Começar Agora</span>
        <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </a>
    </div>
  </div>
</div></section>
<section className="py-6" data-purpose="social-proof">
<div className="text-center mb-5">
<span className="text-[11px] font-bold uppercase tracking-wider text-brand-mint block mb-1">Quem Usa Recomenda</span>
<h2 className="text-xl font-bold text-white tracking-tight">Resultados reais na rotina</h2>
</div>
<div className="space-y-3">
<div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
<div className="flex items-center gap-1 text-amber-400 mb-2">
            ★★★★★
          </div>
<p className="text-xs text-gray-300 italic mb-3">
            "Acabou a dor de cabeça de responder WhatsApp cortando cabelo. Meus clientes agendam sozinhos e o sistema já calcula a comissão dos meus 3 barbeiros sem erro."
          </p>
<div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-full bg-brand-border flex items-center justify-center text-white font-bold text-xs">
              M
            </div>
<div>
<span className="text-xs font-bold text-white block">Marcos Vinícius</span>
<span className="text-[10px] text-gray-400">Dono da Barbearia Roots</span>
</div>
</div>
</div>
<div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
<div className="flex items-center gap-1 text-amber-400 mb-2">
            ★★★★★
          </div>
<p className="text-xs text-gray-300 italic mb-3">
            "O aviso automático para quem não faz manutenção de unhas há 20 dias me garantiu uma renda extra logo no primeiro mês. Não troco mais por nada."
          </p>
<div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-full bg-brand-border flex items-center justify-center text-brand-lilac font-bold text-xs">
              J
            </div>
<div>
<span className="text-xs font-bold text-white block">Juliana Ferreira</span>
<span className="text-[10px] text-gray-400">Nail Designer &amp; Instrutora</span>
</div>
</div>
</div>
</div>
</section>
<section className="py-6" data-purpose="faq-section">
<div className="text-center mb-5">
<span className="text-[11px] font-bold uppercase tracking-wider text-brand-mint block mb-1">Tire Suas Dúvidas</span>
<h2 className="text-xl font-bold text-white tracking-tight">Perguntas Frequentes</h2>
</div>
<div className="space-y-2.5">
<details className="group p-3.5 rounded-xl bg-brand-surface border border-brand-border transition-all">
<summary className="flex justify-between items-center font-semibold text-xs text-white cursor-pointer list-none">
<span className="">Preciso instalar algum programa pesado no computador?</span>
<span className="text-brand-mint transition group-open:rotate-180">▼</span>
</summary>
<p className="text-xs text-gray-300 mt-2.5 pt-2 border-t border-brand-border/60 leading-relaxed">
            Não! O Carvel funciona 100% online na nuvem. Você pode acessar direto pelo celular (Android ou iPhone), tablet ou pelo computador sem instalar nada pesado.
          </p>
</details>
<details className="group p-3.5 rounded-xl bg-brand-surface border border-brand-border transition-all">
<summary className="flex justify-between items-center font-semibold text-xs text-white cursor-pointer list-none">
<span className="">Como funciona o Plano Iniciante Vitalício de R$ 97,90?</span>
<span className="text-brand-mint transition group-open:rotate-180">▼</span>
</summary>
<p className="text-xs text-gray-300 mt-2.5 pt-2 border-t border-brand-border/60 leading-relaxed">
            Você paga apenas uma única vez e tem acesso à sua conta individual para sempre, sem mensalidades. Perfeito para autônomos que desejam profissionalizar seu atendimento sem custos mensais fixos.
          </p>
</details>
<details className="group p-3.5 rounded-xl bg-brand-surface border border-brand-border transition-all">
<summary className="flex justify-between items-center font-semibold text-xs text-white cursor-pointer list-none">
<span className="">O cliente precisa baixar aplicativo para agendar?</span>
<span className="text-brand-mint transition group-open:rotate-180">▼</span>
</summary>
<p className="text-xs text-gray-300 mt-2.5 pt-2 border-t border-brand-border/60 leading-relaxed">
            Não. Seu cliente clica no link do seu Instagram ou WhatsApp, abre direto no navegador do celular dele, escolhe o serviço, o profissional e o melhor horário em segundos.
          </p>
</details>
<details className="group p-3.5 rounded-xl bg-brand-surface border border-brand-border transition-all">
<summary className="flex justify-between items-center font-semibold text-xs text-white cursor-pointer list-none">
<span className="">E se eu precisar de ajuda para configurar?</span>
<span className="text-brand-mint transition group-open:rotate-180">▼</span>
</summary>
<p className="text-xs text-gray-300 mt-2.5 pt-2 border-t border-brand-border/60 leading-relaxed">
            Nossa equipe de suporte humana está disponível diretamente pelo WhatsApp para te orientar a cadastrar seus serviços, preços e profissionais com calma e rapidez.
          </p>
</details>
</div>
</section>
<section className="py-10 text-center relative" data-purpose="final-cta">
<div className="p-6 rounded-2xl bg-gradient-to-b from-brand-card via-brand-surface to-[#031716] border border-brand-border relative overflow-hidden">
<h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug mb-2">
          Pronto para simplificar a gestão do seu espaço de beleza?
        </h2>
<p className="text-xs text-gray-300 leading-relaxed mb-6 max-w-xs mx-auto">
          Deixe a agenda de papel para trás hoje mesmo. Experimente o Carvel e descubra a sensação de ter sua rotina sob controle total.
        </p>
<div className="flex flex-col gap-2.5">
<a className="w-full py-3.5 px-6 rounded-full bg-brand-lilac hover:bg-brand-lilacHover text-brand-dark font-bold text-sm shadow-xl shadow-brand-lilac/30 transition-all flex items-center justify-center gap-2" href="/cadastro">
<span className="">Começar Agora Gratuitamente</span>
<svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path></svg>
</a>
<a className="w-full py-3 px-6 rounded-full bg-transparent border border-brand-border hover:bg-brand-surface text-gray-300 font-semibold text-xs transition-colors" href="#m-planos">
            Conhecer Todos os Planos
          </a>
</div>
<p className="text-[11px] text-gray-400 mt-4">Cancele quando quiser • Sem taxas ocultas</p>
</div>
</section>
<footer className="pt-6 pb-12 border-t border-brand-border/40 text-center text-xs text-gray-400" data-purpose="page-footer">
<div className="flex items-center justify-center gap-2 mb-3">
<div className="w-6 h-6 rounded-lg bg-brand-lilac flex items-center justify-center text-brand-dark shadow-sm">
<svg className="w-3.5 h-3.5 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
<rect height="18" rx="3" ry="3" width="18" x="3" y="4"></rect>
<line x1="16" x2="16" y1="2" y2="6"></line>
<line x1="8" x2="8" y1="2" y2="6"></line>
<line x1="3" x2="21" y1="10" y2="10"></line>
</svg>
</div>
<span className="font-display font-bold text-white text-base">Carvel</span>
</div>
<p className="text-[11px] text-gray-400 mb-4">
        A plataforma inteligente de gestão para salões, barbearias e profissionais da beleza.
      </p>
<div className="flex justify-center gap-4 text-[11px] text-gray-400 mb-4">
<a className="hover:text-brand-mint transition-colors" href="#">Termos de Uso</a>
<span className="">•</span>
<a className="hover:text-brand-mint transition-colors" href="#">Privacidade</a>
<span className="">•</span>
<a className="hover:text-brand-mint transition-colors" href="#m-planos">Suporte WhatsApp</a>
</div>
<p className="text-[10px] text-gray-400">
        © 2026 Carvel Tecnologia. Todos os direitos reservados.
      </p>
</footer>
</main>

    </div>
  </div>;
}
