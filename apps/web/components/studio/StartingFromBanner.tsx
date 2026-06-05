type Props = { prompt?: string; template?: string };

export function StartingFromBanner({ prompt, template }: Props) {
  if (!prompt && !template) return null;
  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-gold/40 bg-surface-2/60 px-5 py-4 text-sm">
      <span className="mr-2 text-gold">Starting from:</span>
      {prompt && <span className="text-text">&ldquo;{prompt}&rdquo;</span>}
      {!prompt && template && <code className="text-text">{template}</code>}
    </div>
  );
}
