// components/Spinner.tsx
type Props = { size?: number; className?: string };
export function Spinner({ size = 24, className = '' }: Props) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      style={{ width: size, height: size }}
      className={[
        'inline-block animate-spin rounded-full border-2 border-zinc-300 border-t-transparent',
        'dark:border-zinc-700',
        className,
      ].join(' ')}
    />
  );
}
