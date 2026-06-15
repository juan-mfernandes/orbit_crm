export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.28),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(244,114,182,0.2),transparent_30%),linear-gradient(to_bottom,rgba(15,23,42,0.92),rgba(2,6,23,1))]" />

      <section className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-14 md:px-10 md:py-18">
        <header className="flex flex-col gap-6">
          <p className="w-fit rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
            orbit crm • build in public
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
              CRM de estudos com foco em autenticacao, autorizacao, tRPC e Drizzle.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Objetivo da semana: sair do template e publicar a primeira entrega com narrativa tecnica no LinkedIn.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-cyan-200">Entrega 01</h2>
            <p className="mt-3 text-xl font-medium">Base do CRM</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Estrutura inicial de dominios e pagina de estudo para orientar o roadmap.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-fuchsia-200">Entrega 02</h2>
            <p className="mt-3 text-xl font-medium">Auth + RBAC</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Login, sessao segura e permissao por papeis para recursos sensiveis.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-200">Entrega 03</h2>
            <p className="mt-3 text-xl font-medium">API tipada</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Endpoints com tRPC + validacao com Zod para fluxo end-to-end seguro.
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-700/70 bg-slate-900/70 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Checklist de publicacao desta semana</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-200 md:text-base">
            <li>1. Atualizar homepage com objetivo tecnico do projeto.</li>
            <li>2. Definir escopo da primeira sprint: auth basica + estrutura de dominio.</li>
            <li>3. Publicar no LinkedIn o antes/depois do projeto e os primeiros aprendizados.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
