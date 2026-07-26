import Link from "next/link"
import { BookOpenCheck, ChevronRight, ShieldCheck } from "lucide-react"

export type StayCarePurposeNoteItem = {
  label: string
  description: string
}

export default function StayCarePurposeNote({
  eyebrow = "PAGE NOTE",
  title,
  purpose,
  boundary,
  items = [],
  links = [],
  compact = false,
}: {
  eyebrow?: string
  title: string
  purpose: string
  boundary?: string
  items?: StayCarePurposeNoteItem[]
  links?: Array<{ href: string; label: string }>
  compact?: boolean
}) {
  return (
    <aside
      className={`border-b border-amber-200 bg-amber-50/95 text-slate-900 ${
        compact ? "px-4 py-4" : "px-4 py-6 sm:px-8"
      }`}
      aria-label={`${title} purpose note`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-200 text-amber-950">
            <BookOpenCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-800">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-black sm:text-xl">{title}</h2>
            <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-slate-700">
              {purpose}
            </p>
            {boundary ? (
              <p className="mt-3 flex max-w-4xl items-start gap-2 rounded-xl border border-amber-200 bg-white/70 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                {boundary}
              </p>
            ) : null}
          </div>
        </div>

        {items.length ? (
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <div key={item.label} className="rounded-xl border border-amber-200 bg-white/80 p-3">
                <p className="text-xs font-black text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        ) : null}

        {links.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-black text-amber-900 hover:bg-amber-100"
              >
                {link.label}
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
