import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Bean Map.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-stone dark:prose-invert max-w-none">
      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        ⚗️ <strong>Beta Notice:</strong> Bean Map is currently in open beta. No commercial services are offered. These terms are a placeholder and will be updated before the official launch.
      </div>

      <h1 className="text-3xl font-display font-semibold mb-2">Terms of Service</h1>
      <p className="text-sm text-stone-500 mb-10">Last updated: TBD — document in preparation</p>

      <p>
        By using Bean Map you agree to these Terms of Service. Bean Map is currently operating as an
        open beta — a free, non-commercial directory of specialty coffee roasters and cafés.
      </p>

      <h2>Beta disclaimer</h2>
      <p>
        Bean Map is provided &ldquo;as is&rdquo; during the beta period. Data, features, and availability
        may change without notice. We make no warranties about the accuracy or completeness of directory listings.
      </p>

      <h2>User-submitted content</h2>
      <p>
        When you submit a roastery, café, or review, you confirm that the information is accurate to the best
        of your knowledge and that you have the right to submit it. Bean Map reserves the right to moderate
        and remove any content that violates these terms.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Bean Map content, design, and branding are the property of Bean Map. Directory listings remain
        the property of the respective businesses.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href="mailto:hello@beanmap.cafe" className="text-orange-600 hover:underline">
          hello@beanmap.cafe
        </a>
      </p>
    </article>
  );
}
