import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Bean Map — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-stone dark:prose-invert max-w-none">
      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        ⚗️ <strong>Beta Notice:</strong> Bean Map is currently in open beta. No commercial services are offered. This privacy policy is a placeholder and will be updated before the official launch.
      </div>

      <h1 className="text-3xl font-display font-semibold mb-2">Privacy Policy</h1>
      <p className="text-sm text-stone-500 mb-10">Last updated: TBD — document in preparation</p>

      <p>
        Bean Map (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your personal data.
        This page will contain our full Privacy Policy in accordance with GDPR and applicable data protection law.
      </p>

      <h2>What data we collect</h2>
      <p>
        During the beta, we may collect: email addresses (newsletter sign-ups, account registration),
        roastery and café information submitted through registration forms, and anonymous usage analytics
        via Plausible (a privacy-friendly, cookie-free analytics tool).
      </p>

      <h2>How we use your data</h2>
      <p>
        Data is used solely to operate the Bean Map directory service. We do not sell or share personal
        data with third parties for marketing purposes.
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to access, correct, or delete your personal data at any time.
        To exercise these rights during the beta, please contact us at:{" "}
        <a href="mailto:hello@beanmap.cafe" className="text-orange-600 hover:underline">
          hello@beanmap.cafe
        </a>
      </p>

      <h2>Cookies</h2>
      <p>
        Bean Map does not use tracking cookies. See our{" "}
        <Link href="/cookies" className="text-orange-600 hover:underline">Cookie Policy</Link> for details.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy:{" "}
        <a href="mailto:hello@beanmap.cafe" className="text-orange-600 hover:underline">
          hello@beanmap.cafe
        </a>
      </p>
    </article>
  );
}
