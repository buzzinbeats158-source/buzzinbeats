"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "How do I upgrade my current plan?",
    answer:
      "You can upgrade anytime by visiting your billing dashboard. The changes will be prorated and reflected in your next billing cycle instantly.",
  },
  {
    question: "What should I do if my products are missing?",
    answer:
      "First, check your archived folder in the Products tab. If they aren't there, ensure your subscription is active. Contact us if the issue persists.",
  },
  {
    question: "How can I change my landing page layouts?",
    answer:
      "Head to the 'Editor' section of your landing page. You can drag and drop sections to reorder them or choose a completely new template from our library.",
  },
  {
    question: "How do I fix a broken redirect link?",
    answer:
      "Check the destination URL for typos. If the link is hosted on a custom domain, ensure your CNAME records are correctly pointed to BuzzinBeats servers.",
  },
  {
    question: "Is it possible to cancel my subscription?",
    answer:
      "Yes, you can cancel at any time under Settings > Subscription. Your access will continue until the end of your current billing period.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={faq.question}
            className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 p-6 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-bold text-lg text-slate-900">{faq.question}</span>
              <span
                className={`material-symbols-outlined shrink-0 text-slate-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-6 leading-relaxed text-slate-500">{faq.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
