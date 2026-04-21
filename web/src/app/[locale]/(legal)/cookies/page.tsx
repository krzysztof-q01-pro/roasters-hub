import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy for Bean Map — we keep it minimal.",
};

export default function CookiesPage() {
  return (
    <article className="prose prose-stone dark:prose-invert max-w-none">
      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        ⚗️ <strong>Beta Notice:</strong> Bean Map is currently in open beta. No commercial services are offered.
      </div>

      <h1 className="text-3xl font-display font-semibold mb-2">Cookie Policy</h1>
      <p className="text-sm text-stone-500 mb-10">Last updated: TBD — document in preparation</p>

      <h2>Do we use cookies?</h2>
      <p>
        Bean Map uses only essential, functional cookies — no advertising or tracking cookies.
      </p>

      <h2>Cookies we use</h2>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>__clerk_*</code></td>
            <td>Authentication session (Clerk)</td>
            <td>Session / 30 days</td>
          </tr>
          <tr>
            <td><code>beanmap_beta_banner_dismissed</code></td>
            <td>Remembers beta banner dismissal (localStorage)</td>
            <td>Persistent (local)</td>
          </tr>
        </tbody>
      </table>

      <h2>Analytics</h2>
      <p>
        We use <a href="https://plausible.io" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">Plausible Analytics</a> — a privacy-friendly analytics tool that does <strong>not</strong> use cookies and does not track individuals. No consent banner is required.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about cookies:{" "}
        <a href="mailto:hello@beanmap.cafe" className="text-orange-600 hover:underline">
          hello@beanmap.cafe
        </a>
      </p>
    </article>
  );
}
