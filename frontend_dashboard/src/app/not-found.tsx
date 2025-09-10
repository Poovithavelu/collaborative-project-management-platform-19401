import React from "react";

// Opt this out of static optimization to simplify universal dynamic rendering mode.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="app-container">
      <section className="card" role="alert" aria-live="assertive">
        <header className="header">
          <h1 className="title">404 – Page Not Found</h1>
          <p className="subtitle">The page you’re looking for doesn’t exist.</p>
        </header>
      </section>
    </main>
  );
}
