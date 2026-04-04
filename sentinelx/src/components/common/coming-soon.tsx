export function ComingSoon({ title, detail }: { title: string; detail: string }) {
  return (
    <main className="grid-bg flex min-h-screen items-center justify-center p-6">
      <section className="glass max-w-2xl rounded-xl p-8 text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-slate-400">{detail}</p>
      </section>
    </main>
  );
}
