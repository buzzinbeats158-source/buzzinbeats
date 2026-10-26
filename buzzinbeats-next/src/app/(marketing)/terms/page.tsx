import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | BuzzinBeats",
  description:
    "The terms and conditions that govern your access to and use of BuzzinBeats.",
};

export default function TermsPage() {
  return (
    <>
      <div className="gradient-mesh pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-slate-500 font-medium italic">Last Updated: February 25, 2026</p>
        </div>
      </div>

      <div className="bg-white dark:bg-background-dark py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="bg-orange-50/30 dark:bg-slate-900/50 p-8 rounded-3xl border border-orange-100 dark:border-slate-800 mb-12">
              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                Welcome to BuzzinBeats! By accessing our website and using our services, you agree to comply with
                and be bound by the following terms and conditions. Please read them carefully.
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                  01
                </span>
                Acceptance of Terms
              </h2>
              <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  By using BuzzinBeats (&quot;Services&quot;), you acknowledge that you have read, understood, and
                  agree to be bound by these Terms of Service. If you do not agree, you must not use our platform.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                  02
                </span>
                User Responsibility
              </h2>
              <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  You are responsible for maintaining the confidentiality of your account information. You agree
                  to provide accurate, current, and complete information during registration and to update such
                  information to keep it accurate.
                </p>
                <p>
                  You may not use the Services for any illegal or unauthorized purpose. You agree to comply with
                  all local laws regarding online conduct and acceptable content.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                  03
                </span>
                Intellectual Property
              </h2>
              <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  The Service, including all source code, databases, functionality, software, website designs,
                  audio, video, text, photographs, and graphics on the Site (collectively, the &quot;Content&quot;)
                  are owned or controlled by BuzzinBeats and are protected by copyright and trademark laws.
                </p>
                <p>
                  Your content remains yours. By posting content to BuzzinBeats, you grant us a non-exclusive,
                  worldwide, royalty-free license to use, copy, reproduce, process, adapt, modify, publish,
                  transmit, display, and distribute such content for the purpose of provideing the Service.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                  04
                </span>
                Prohibited Activities
              </h2>
              <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 space-y-4 text-slate-600 dark:text-slate-400">
                <ul className="list-disc space-y-2">
                  <li>Systematically retrieving data to create a database or directory without permission.</li>
                  <li>Trick, defraud, or mislead us and other users.</li>
                  <li>Circumvent, disable, or otherwise interfere with security-related features of the Site.</li>
                  <li>Use the Site in a manner inconsistent with any applicable laws or regulations.</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                  05
                </span>
                Termination
              </h2>
              <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  We may terminate or suspend your account and bar access to the Service immediately, without
                  prior notice or liability, under our sole discretion, for any reason whatsoever and without
                  limitation, including but not limited to a breach of the Terms.
                </p>
              </div>
            </section>

            <div className="mt-20 border-t border-slate-100 dark:border-slate-800 pt-10 text-center">
              <p className="text-slate-400 text-sm">
                Questions about our Terms? Contact us at{" "}
                <a href="mailto:legal@buzzinbeats.com" className="text-primary font-bold hover:underline">
                  legal@buzzinbeats.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
