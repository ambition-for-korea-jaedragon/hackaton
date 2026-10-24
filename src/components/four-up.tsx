// The 2x2 group shown everywhere: Makeup (mannequin) · Muse · My tone · Styled. All four visible at once.
type Pending = { mannequin?: boolean; muse?: boolean; me?: boolean; styled?: boolean };

export type FourUpProps = {
  mannequin?: string;
  muse?: string; // omitted = muse photo hidden by the poster
  me?: string;
  styled?: string;
  pending?: Pending;
  mood?: string; // shown on the hidden-muse tile
  className?: string;
};

function Label({ children, cherry }: { children: string; cherry?: boolean }) {
  return (
    <span
      className={`absolute bottom-1.5 left-1.5 rounded-full px-2 py-[3px] text-[11px] font-bold ${
        cherry ? "bg-cherry text-white" : "bg-paper text-ink"
      }`}
    >
      {children}
    </span>
  );
}

function Developing() {
  return (
    <div role="status" aria-label="Developing" className="relative grid size-full place-items-center overflow-hidden bg-lilac-deep/40 text-center text-[11px] font-semibold text-white">
      <i className="absolute inset-y-0 left-0 w-1/2 animate-[slide_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/35 to-transparent motion-reduce:hidden" />
      <span className="relative">Developing…</span>
    </div>
  );
}

function Cell({ src, label, alt, pending, cherry }: { src?: string; label: string; alt: string; pending?: boolean; cherry?: boolean }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-black">
      {src && !pending ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" className="size-full object-cover object-top" />
      ) : (
        <Developing />
      )}
      <Label cherry={cherry}>{label}</Label>
    </div>
  );
}

export function FourUp({ mannequin, muse, me, styled, pending = {}, mood, className = "" }: FourUpProps) {
  return (
    <div className={`grid grid-cols-2 gap-[3px] overflow-hidden rounded-md bg-ink ${className}`}>
      <Cell src={mannequin} label="Makeup" alt="Mannequin wearing the look's makeup" pending={pending.mannequin} />
      {muse || pending.muse ? (
        <Cell src={muse} label="Muse" alt="The muse photo" pending={pending.muse} />
      ) : (
        <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[3px] bg-lilac p-3 text-center">
          <div>
            <p className="text-[13px] font-bold text-ink">Muse photo hidden</p>
            {mood && <p className="mt-1 line-clamp-3 text-[12px] leading-snug text-ink-soft">{mood}</p>}
          </div>
          <Label>Muse</Label>
        </div>
      )}
      <Cell src={me} label="My tone" alt="My face with the tone-translated makeup" pending={pending.me} cherry />
      <Cell src={styled} label="Styled" alt="Styled shot with hair and accessories" pending={pending.styled} />
    </div>
  );
}
