import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BuzzinBeats",
  description:
    "How BuzzinBeats collects, uses, and protects your personal information when you use our platform.",
};

export default function PrivacyPage() {
  return (
    <>
      <div className="gradient-mesh pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-500 font-medium italic">Last Updated: February 25, 2026</p>
        </div>
      </div>

      <div className="bg-white dark:bg-background-dark py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="bg-orange-50/30 dark:bg-slate-900/50 p-8 rounded-3xl border border-orange-100 dark:border-slate-800 mb-12">
              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                At BuzzinBeats, your privacy is our priority. This document explains how we collect, use, and
                protect your personal information when you use our platform.
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                  01
                </span>
                Information We Collect
              </h2>
              <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  We collect information you provide directly to us, such as when you create an account, update
                  your profile, or communicate with us.
                </p>
                <ul className="list-disc space-y-2">
                  <li>
                    <strong>Account Data:</strong> Name, email address, and password.
                  </li>
                  <li>
                    <strong>Profile Data:</strong> Banner images, bios, and social media handles.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use the Service, including the links
                    you click and the QR codes you generate.
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                  02
                </span>
                How We Use Your Information
              </h2>
              <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 space-y-4 text-slate-600 dark:text-slate-400">
                <p>We use the information we collect to:</p>
                <ul className="list-disc space-y-2">
                  <li>Provide, maintain, and improve our Service.</li>
                  <li>Personalize your experience and content.</li>
                  <li>Communicate with you about Service updates or support.</li>
                  <li>Monitor and analyze trends in usage and activity.</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                  03
                </span>
                Data Sharing &amp; Disclosure
              </h2>
              <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  We do not sell your personal data. We may share information with third-party service providers
                  who perform services for us (like cloud hosting or analytics), but only to the extent necessary
                  for them to provide those services.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                  04
                </span>
                Security
              </h2>
              <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  We take reasonable measures to help protect your information from loss, theft, misuse, and
                  unauthorized access. However, no internet transmission is ever fully secure.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                  05
                </span>
                Your Rights
              </h2>
              <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  Depending on your location, you may have rights under GDPR or CCPA to access, correct, or delete
                  your personal data. You can manage most of your data directly through your dashboard settings.
                </p>
              </div>
            </section>

            <div className="mt-20 border-t border-slate-100 dark:border-slate-800 pt-10 text-center">
              <p className="text-slate-400 text-sm">
                Privacy concerns? Contact us at{" "}
                <a href="mailto:privacy@buzzinbeats.com" className="text-primary font-bold hover:underline">
                  privacy@buzzinbeats.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
