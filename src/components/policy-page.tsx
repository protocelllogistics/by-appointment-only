import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type PolicyPageProps = {
  title: string;
  updated?: string;
  introduction?: ReactNode;
  children?: ReactNode;
};

export function PolicyPage({ title, updated, introduction, children }: PolicyPageProps) {
  return (
    <main className="policy-page">
      <div className="policy-shell">
        <header className="policy-header">
          <Link to="/" className="policy-back-link">
            <span aria-hidden="true">←</span> Back to By Appointment Only
          </Link>
          <p className="policy-kicker">BAOWOW policies</p>
          <h1>{title}</h1>
          {introduction ? <div className="policy-introduction">{introduction}</div> : null}
          {updated ? <p className="policy-updated">Last updated: {updated}</p> : null}
        </header>
        <div className="policy-content">{children}</div>
      </div>
    </main>
  );
}