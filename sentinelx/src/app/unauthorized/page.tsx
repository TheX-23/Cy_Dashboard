import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="glass rounded-xl p-8 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-2 text-slate-400">
          Your current role does not have permission to access this route.
        </p>
        <Link className="mt-4 inline-block text-cyan-300 hover:text-cyan-200" href="/dashboard">
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
