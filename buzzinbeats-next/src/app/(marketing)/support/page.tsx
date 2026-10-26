import { getCurrentUser } from "@/lib/data/current-user";
import { createSupportTicketAction } from "@/lib/data/profile";
import FaqAccordion from "./faq-accordion";

const STATUS_ITEMS = [
  "Platform Running Normally",
  "Payments Active",
  "Email Notifications Active",
];

const QUICK_HELP_TOPICS = [
  {
    icon: "manage_accounts",
    title: "Account Help",
    description: "Reset passwords and manage profile security.",
  },
  {
    icon: "payments",
    title: "Billing & Subscription",
    description: "Update cards, view invoices, and change plans.",
  },
  {
    icon: "inventory_2",
    title: "Product Issues",
    description: "Managing your digital products and storefront.",
  },
  {
    icon: "terminal",
    title: "Technical Support",
    description: "API access, integrations, and platform bugs.",
  },
  {
    icon: "link_off",
    title: "Broken Link Issues",
    description: "Troubleshooting redirects and 404 errors.",
  },
];

export default async function SupportPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold tracking-widest text-primary">
          SUPPORT CENTER
        </span>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
          Need Help? We&apos;re Here for You.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-500">
          Get support for your account, billing, landing pages, and product links. Our team and
          resources are always available.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="#contact"
            className="rounded-xl bg-gradient-to-r from-primary to-primary-warm px-8 py-4 text-center font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            Contact Support
          </a>
          <a
            href="#faq"
            className="rounded-xl border border-slate-200 bg-white px-8 py-4 text-center font-bold text-slate-900 transition-all hover:bg-slate-50"
          >
            Browse FAQs
          </a>
        </div>
      </section>

      {/* Status Section */}
      <section className="mx-auto mb-20 max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STATUS_ITEMS.map((label) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"
            >
              <div className="h-3 w-3 animate-pulse rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="font-bold text-slate-900">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Help Cards */}
      <section className="mx-auto mb-32 max-w-7xl px-6">
        <h2 className="mb-12 flex items-center gap-3 text-3xl font-bold text-slate-900">
          <span className="material-symbols-outlined text-primary">grid_view</span>
          Quick Help Topics
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_HELP_TOPICS.map((topic) => (
            <div
              key={topic.title}
              className="group rounded-3xl border border-primary/10 bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined">{topic.icon}</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{topic.title}</h3>
              <p className="text-sm text-slate-500">{topic.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="mx-auto mb-32 max-w-7xl px-6">
        <div className="flex flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl lg:flex-row">
          {/* Left Column */}
          <div className="flex flex-col justify-between bg-gradient-to-br from-primary to-primary-warm p-10 text-white lg:w-5/12">
            <div>
              <h2 className="mb-4 text-2xl font-extrabold">Reach Out to Our Team</h2>
              <p className="mb-8 leading-relaxed text-white/80">
                Our support ninjas are ready to jump in. Whether it&apos;s a technical glitch or a
                feature request, we&apos;ve got you covered.
              </p>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined rounded-xl bg-white/20 p-2.5 text-xl">
                    mail
                  </span>
                  <div>
                    <p className="font-bold">support@buzzinbeats.com</p>
                    <p className="text-sm text-white/70">Email us anytime</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/message/ZPFTXPIDYOY2P1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3"
                >
                  <span className="flex items-center justify-center rounded-xl bg-white/20 p-2.5 transition-colors group-hover:bg-white/30">
                    <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-bold group-hover:underline">Chat on WhatsApp</p>
                    <p className="text-sm text-white/70">Tap to open WhatsApp Business</p>
                  </div>
                </a>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined rounded-xl bg-white/20 p-2.5 text-xl">
                    location_on
                  </span>
                  <div>
                    <p className="font-bold">BuzzinBeats</p>
                    <p className="text-sm text-white/70">India</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined rounded-xl bg-white/20 p-2.5 text-xl">
                    schedule
                  </span>
                  <div>
                    <p className="font-bold">Usually within 24 hours</p>
                    <p className="text-sm text-white/70">Average response time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="bg-white p-10 lg:w-7/12">
            {user ? (
              <form
                action={async (formData) => {
                  "use server";
                  await createSupportTicketAction(formData);
                }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Topic
                  </label>
                  <input
                    type="text"
                    name="topic"
                    placeholder="What is your issue about?"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Tell us more about your issue..."
                    required
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-10 py-3.5 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Submit
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-3xl">lock</span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Log in to get support
                </h3>
                <p className="mb-8 max-w-xs leading-relaxed text-slate-500">
                  Log in to your BuzzinBeats account to submit a support request and track your
                  tickets.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="mx-auto mb-32 max-w-4xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500">Everything you need to know about the product and billing.</p>
        </div>
        <FaqAccordion />
      </section>

      {/* Footer CTA Section */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-[2.5rem] border border-primary/10 bg-orange-50/50 p-12 text-center shadow-inner">
          <h2 className="mb-4 text-3xl font-extrabold text-slate-900">Still need help?</h2>
          <p className="mb-6 text-xl text-slate-500">
            Contact us at:{" "}
            <a href="mailto:support@buzzinbeats.com" className="font-bold text-primary hover:underline">
              support@buzzinbeats.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
