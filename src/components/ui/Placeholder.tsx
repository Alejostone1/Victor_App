// Placeholder temporal para las pantallas que se construyen en fases posteriores.
type PlaceholderProps = {
  title: string;
  phase: string;
};

export function Placeholder({ title, phase }: PlaceholderProps) {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-3 p-6">
      <h1 className="text-3xl font-bold text-primary">{title}</h1>
      <p className="text-muted">Esta pantalla se construye en la {phase}.</p>
    </section>
  );
}
