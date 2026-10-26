"use client";

const CREATORS = [
  {
    icon: "videocam",
    title: "YouTubers",
    body: "Link every product from your video in one page. When a product goes out of stock, swap the ASIN — the URL never changes, old videos keep earning.",
  },
  {
    icon: "movie",
    title: "Reels & Shorts Creators",
    body: 'Put a QR code on screen. Viewers scan and shop while watching — no "link in bio" friction, no app switching, no lost sales.',
  },
  {
    icon: "payments",
    title: "Affiliate Marketers",
    body: "One clean storefront. Multiple Amazon products. Track exactly which items are earning you money and which ones aren't pulling their weight.",
  },
  {
    icon: "camera",
    title: "Instagram Influencers",
    body: "Replace the messy, cluttered link-in-bio with one professional product page your followers will actually trust and click through.",
  },
  {
    icon: "sports_esports",
    title: "Gaming Creators",
    body: "Showcase your full setup — keyboard, mouse, monitor, headset — on a single page. Your viewers always know where to buy your exact gear.",
  },
  {
    icon: "edit_note",
    title: "Bloggers & Writers",
    body: "Embed one link in every article. When Amazon changes a product URL, you update it in BuzzinBeats — not in every blog post you've ever written.",
  },
  {
    icon: "mic",
    title: "Podcasters",
    body: "Mention a product on air. Drop one short link in your show notes. Earn a commission every time a listener clicks through — even years later.",
  },
];

function CreatorCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="creator-card flex flex-shrink-0 flex-col rounded-3xl border border-primary/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1">
      <span className="material-symbols-outlined mb-3 text-3xl text-primary">{icon}</span>
      <h3 className="font-display mb-2 text-base font-bold">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

export default function CreatorMarquee() {
  return (
    <div className="hide-scrollbar overflow-hidden px-6">
      <div className="marquee-strip items-stretch">
        {CREATORS.map((c) => (
          <CreatorCard key={`a-${c.title}`} {...c} />
        ))}
        {CREATORS.map((c) => (
          <CreatorCard key={`b-${c.title}`} {...c} />
        ))}
      </div>
    </div>
  );
}
