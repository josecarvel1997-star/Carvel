'use client';

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, Phone, Scissors, Sparkles, UserRound } from 'lucide-react';
import Brand from '@/app/components/brand';
import { addDays, dateInZone, formatDate, timeInZone, todayInZone, weekdayOf, WEEKDAYS_SHORT } from '@/lib/time';
import { bookPublic, getPublicSlots } from './actions';
import type { BookingState, PublicShop, PublicSlot } from './types';

const brl = (value: number) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const duration = (minutes: number) => minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}min` : ''}` : `${minutes} min`;
const ANY = 'any';
const initial: BookingState = { ok: false, message: '', at: 0 };
const STEPS = ['Serviço', 'Profissional', 'Horário', 'Seus dados'];

function maskPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function PublicBooking({ shop }: { shop: PublicShop }) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState('');
  const [staffChoice, setStaffChoice] = useState('');
  const [day, setDay] = useState('');
  const [slot, setSlot] = useState<PublicSlot | null>(null);
  const [slots, setSlots] = useState<PublicSlot[]>([]);
  const [slotError, setSlotError] = useState('');
  const [loadingSlots, startLoading] = useTransition();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, formAction, pending] = useActionState(bookPublic, initial);

  const service = shop.services.find((s) => s.id === serviceId);
  const staffId = staffChoice === ANY ? '' : staffChoice;
  const staffName = staffChoice === ANY ? 'Sem preferência' : shop.staff.find((s) => s.id === staffChoice)?.display_name ?? '';
  const today = todayInZone(shop.timezone);
  const openWeekdays = useMemo(() => new Set(shop.hours.map((h) => h.weekday)), [shop.hours]);
  const days = useMemo(() => Array.from({ length: 21 }, (_, i) => addDays(today, i)), [today]);
  const hoursByDay = useMemo(() => [0, 1, 2, 3, 4, 5, 6].map((wd) => shop.hours.filter((h) => h.weekday === wd).map((h) => `${h.start}–${h.end}`).join(', ')), [shop.hours]);

  useEffect(() => {
    if (!serviceId || !staffChoice || !day) return;
    setSlot(null);
    startLoading(async () => {
      const result = await getPublicSlots(shop.slug, serviceId, staffId || null, day);
      setSlots(result.slots);
      setSlotError(result.ok ? '' : result.message);
    });
  }, [serviceId, staffChoice, staffId, day, shop.slug]);

  useEffect(() => {
    // Horário tomado por outra pessoa: volta para a escolha de horário com a lista atualizada.
    if (state.at && !state.ok && state.message.includes('horário')) {
      setStep(2);
      setSlot(null);
      startLoading(async () => { const result = await getPublicSlots(shop.slug, serviceId, staffId || null, day); setSlots(result.slots); });
    }
  }, [state, shop.slug, serviceId, staffId, day]);

  const restart = () => { window.location.reload(); };
  const booking = state.ok ? state.booking : undefined;
  const noOptions = !shop.services.length || !shop.staff.length;

  return <main className="public-booking-demo">
    <header className="public-demo-top"><Brand className="public-demo-brand"/><span className="public-demo-chip"><CalendarDays size={14}/> Agendamento online</span></header>
    <div className="public-booking-layout"><section className="public-booking-main">
      <div className="public-demo-shop"><span className="public-demo-logo"><Scissors size={22}/></span><div><b>{shop.name}</b><small>{shop.address || 'Agendamento online'}</small></div></div>
      {booking ? <section className="public-step-card public-confirm-card">
        <span className="public-confirm-icon"><Check size={24}/></span>
        <span className="public-demo-eyebrow">AGENDAMENTO CONFIRMADO</span>
        <h2>Tudo certo, {name.split(' ')[0]}!</h2>
        <p>Seu horário está reservado em {booking.shop}. Se precisar remarcar ou cancelar, fale com a barbearia{shop.phone ? ` pelo telefone ${shop.phone}` : ''}.</p>
        <div className="public-confirm-summary">
          <span><Scissors size={15}/>{booking.service} · {duration(booking.duration_minutes)} · {brl(booking.price)}</span>
          <span><UserRound size={15}/>{booking.staff}</span>
          <span><CalendarDays size={15}/>{formatDate(dateInZone(booking.starts_at, booking.timezone), { weekday: 'long', day: 'numeric', month: 'long' })} às {timeInZone(booking.starts_at, booking.timezone)}</span>
          {shop.address && <span><MapPin size={15}/>{shop.address}</span>}
        </div>
        <button className="public-next-button" onClick={restart}>Fazer outro agendamento</button>
      </section> : <>
        <span className="public-demo-eyebrow">ESCOLHA SERVIÇO E HORÁRIO</span>
        <h1>Agende seu horário<br/><em>em poucos passos.</em></h1>
        <p className="public-demo-intro">Escolha o serviço, o profissional e um horário livre. A confirmação é imediata.</p>
        <div className="public-demo-progress">{STEPS.map((label, index) => <div className={step >= index ? 'active' : ''} key={label}><i>{step > index ? <Check size={12}/> : index + 1}</i><span>{label}</span></div>)}</div>

        {noOptions && <section className="public-step-card"><div className="public-step-heading"><div><h2>Agendamento online indisponível</h2></div></div><p className="public-demo-intro">Esta barbearia ainda não liberou serviços ou profissionais para agendamento online.{shop.phone ? ` Ligue para ${shop.phone}.` : ''}</p></section>}

        {!noOptions && step === 0 && <section className="public-step-card"><div className="public-step-heading"><div><span>ETAPA 1 DE 4</span><h2>Qual serviço você quer?</h2></div><span className="demo-step-mark"><Scissors size={17}/></span></div>
          <div className="public-service-list">{shop.services.map((item) => <button type="button" key={item.id} className={`public-service-option ${serviceId === item.id ? 'selected' : ''}`} onClick={() => { setServiceId(item.id); setSlot(null); }}><span className="public-service-icon"><Scissors size={17}/></span><span><b>{item.name}</b><small>{duration(item.duration_minutes)}</small></span><strong>{brl(item.price)}</strong><i>{serviceId === item.id && <Check size={13}/>}</i></button>)}</div>
          <button type="button" className="public-next-button" disabled={!serviceId} onClick={() => setStep(1)}>Continuar <ArrowRight size={16}/></button></section>}

        {!noOptions && step === 1 && <section className="public-step-card"><div className="public-step-heading"><div><span>ETAPA 2 DE 4</span><h2>Com quem você prefere?</h2></div><span className="demo-step-mark"><UserRound size={17}/></span></div>
          <div className="public-pro-list">{[{ id: ANY, display_name: 'Sem preferência' }, ...shop.staff].map((item) => <button type="button" className={`public-pro-option ${staffChoice === item.id ? 'selected' : ''}`} key={item.id} onClick={() => { setStaffChoice(item.id); setSlot(null); }}><span className="public-pro-avatar">{item.id === ANY ? <Sparkles size={17}/> : item.display_name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</span><span><b>{item.display_name}</b><small>{item.id === ANY ? 'Primeiro profissional disponível' : 'Profissional da casa'}</small></span><i>{staffChoice === item.id && <Check size={13}/>}</i></button>)}</div>
          <div className="public-step-actions"><button type="button" className="public-back-button" onClick={() => setStep(0)}><ArrowLeft size={15}/> Voltar</button><button type="button" className="public-next-button" disabled={!staffChoice} onClick={() => { if (!day) setDay(days.find((d) => openWeekdays.has(weekdayOf(d))) ?? today); setStep(2); }}>Escolher horário <ArrowRight size={16}/></button></div></section>}

        {!noOptions && step === 2 && <section className="public-step-card"><div className="public-step-heading"><div><span>ETAPA 3 DE 4</span><h2>Qual dia e horário?</h2></div><span className="demo-step-mark"><CalendarDays size={17}/></span></div>
          <div className="public-day-strip">{days.map((d) => { const closed = !openWeekdays.has(weekdayOf(d)); return <button type="button" key={d} disabled={closed && staffChoice === ANY} className={day === d ? 'selected' : ''} onClick={() => setDay(d)}><small>{d === today ? 'Hoje' : WEEKDAYS_SHORT[weekdayOf(d)]}</small><b>{d.slice(8)}</b><small>{formatDate(d, { month: 'short' }).replace('.', '')}</small></button>; })}</div>
          {day && <p className="public-slot-caption">{formatDate(day, { weekday: 'long', day: 'numeric', month: 'long' })}{hoursByDay[weekdayOf(day)] ? ` · funcionamento ${hoursByDay[weekdayOf(day)]}` : ''}</p>}
          {loadingSlots ? <p className="public-slot-caption">Buscando horários livres…</p>
            : slotError ? <p className="public-form-error">{slotError}</p>
            : slots.length ? <div className="public-time-grid">{slots.map((item) => <button type="button" key={item.start} className={slot?.start === item.start ? 'selected' : ''} onClick={() => setSlot(item)}>{item.label}</button>)}</div>
            : day && <p className="public-slot-caption">Nenhum horário livre neste dia. Tente outra data.</p>}
          {state.at > 0 && !state.ok && state.message.includes('horário') && <p className="public-form-error">{state.message}</p>}
          <div className="public-step-actions"><button type="button" className="public-back-button" onClick={() => setStep(1)}><ArrowLeft size={15}/> Voltar</button><button type="button" className="public-next-button" disabled={!slot} onClick={() => setStep(3)}>Continuar <ArrowRight size={16}/></button></div></section>}

        {!noOptions && step === 3 && slot && service && <section className="public-step-card"><div className="public-step-heading"><div><span>ETAPA 4 DE 4</span><h2>Seus dados para confirmar</h2></div><span className="demo-step-mark"><UserRound size={17}/></span></div>
          <div className="public-confirm-summary">
            <span><Scissors size={15}/>{service.name} · {duration(service.duration_minutes)} · {brl(service.price)}</span>
            <span><UserRound size={15}/>{staffChoice === ANY ? slot.staffName : staffName}</span>
            <span><CalendarDays size={15}/>{formatDate(day, { weekday: 'long', day: 'numeric', month: 'long' })} às {slot.label}</span>
          </div>
          <form action={formAction}>
            <input type="hidden" name="slug" value={shop.slug}/><input type="hidden" name="service_id" value={serviceId}/><input type="hidden" name="staff_id" value={staffId}/><input type="hidden" name="starts_at" value={slot.start}/>
            <label className="public-date-select">Seu nome<input name="client_name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome e sobrenome" autoComplete="name" required minLength={2} maxLength={100}/></label>
            <label className="public-date-select">Seu telefone (WhatsApp)<input name="client_phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(11) 99999-9999" autoComplete="tel" required/></label>
            {state.at > 0 && !state.ok && !state.message.includes('horário') && <p className="public-form-error">{state.message}</p>}
            <div className="public-step-actions"><button type="button" className="public-back-button" onClick={() => setStep(2)}><ArrowLeft size={15}/> Voltar</button><button className="public-next-button" disabled={pending || name.trim().length < 2 || phone.replace(/\D/g, '').length < 10}>{pending ? 'Confirmando…' : 'Confirmar agendamento'} <Check size={16}/></button></div>
          </form></section>}
        <p className="public-demo-disclaimer"><Sparkles size={14}/> Seus dados são usados apenas pela barbearia para este atendimento.</p>
      </>}
    </section>
    <aside className="public-booking-aside"><div className="public-aside-pattern"/><div className="public-aside-content"><span className="public-aside-orbit"><CalendarDays size={30}/></span><span className="public-demo-eyebrow">UM MOMENTO PARA VOCÊ</span><h2>Seu cuidado,<br/>no seu tempo.</h2><p>Escolha o serviço e o horário que funcionam para você.</p>
      <div className="public-aside-info">{shop.address && <span><MapPin size={15}/> {shop.address}</span>}{shop.phone && <span><Phone size={15}/> {shop.phone}</span>}<span><Clock3 size={15}/> Horário de funcionamento</span>
        <div className="public-aside-hours">{[1, 2, 3, 4, 5, 6, 0].map((wd) => <span key={wd}><b>{WEEKDAYS_SHORT[wd]}</b>{hoursByDay[wd] || 'Fechado'}</span>)}</div></div>
    </div><div className="public-aside-bottom">AGENDAMENTO ONLINE · {shop.name.toUpperCase()}</div></aside></div>
    <footer className="public-booking-footer">© {today.slice(0, 4)} {shop.name} · Agendamento por Agenda Certa</footer>
  </main>;
}
