'use client';

import { useRouter } from 'next/navigation';

type Props = { label: string; value: string; options: { value: string; label: string }[]; hrefFor: Record<string, string> };

/** Select que navega (filtros na URL, lidos pelos Server Components). */
export default function NavSelect({ label, value, options, hrefFor }: Props) {
  const router = useRouter();
  return <select aria-label={label} value={value} onChange={(event) => router.push(hrefFor[event.target.value] ?? '?')}>
    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>;
}
