import Link from "next/link";
import Image from "next/image";
import { publicStorageUrl } from "@/lib/storage";
import { socialLinkColor, socialLinkIcon, socialLinkLabel, type SocialLinkRow } from "@/lib/public-page/social-platforms";

type Owner = {
  name: string;
  business_title: string | null;
  bio: string | null;
  services_text: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_phone_code: string | null;
  contact_whatsapp: string | null;
  logo_enabled: boolean | null;
  logo_path: string | null;
  profile_photo_path: string | null;
};

type LandingSectionRow = { section_key: string };

function isSectionEnabled(landingSections: LandingSectionRow[], key: string) {
  return landingSections.some((s) => s.section_key === key);
}

/** Mirrors the About section in the old page.blade.php. */
export function AboutSection({ owner, landingSections }: { owner: Owner; landingSections: LandingSectionRow[] }) {
  if (!isSectionEnabled(landingSections, "about")) return null;
  if (!owner.bio && !owner.business_title) return null;

  const logoUrl = owner.logo_enabled ? publicStorageUrl(owner.logo_path) : null;
  const photoUrl = publicStorageUrl(owner.profile_photo_path);

  return (
    <section className="mx-auto mb-16 max-w-3xl">
      <div className="flex flex-col items-center gap-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm sm:flex-row">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={owner.name} className="h-24 w-24 flex-shrink-0 rounded-3xl border border-slate-100 object-contain p-2" />
        ) : photoUrl ? (
          <Image src={photoUrl} alt={owner.name} width={96} height={96} className="h-24 w-24 flex-shrink-0 rounded-3xl object-cover" />
        ) : (
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl bg-primary/10">
            <span className="text-3xl font-black text-primary">{owner.name.charAt(0)}</span>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">{owner.name}</h2>
          {owner.business_title && (
            <p className="mt-1 text-xs font-black uppercase tracking-widest text-primary">{owner.business_title}</p>
          )}
          {owner.bio && <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{owner.bio}</p>}
        </div>
      </div>
    </section>
  );
}

/** Mirrors the Social Links section in the old page.blade.php. */
export function SocialLinksSection({
  socialLinks,
  landingSections,
}: {
  socialLinks: SocialLinkRow[];
  landingSections: LandingSectionRow[];
}) {
  if (!isSectionEnabled(landingSections, "social_links") || socialLinks.length === 0) return null;

  return (
    <section className="mb-16 text-center">
      <div className="flex flex-wrap justify-center gap-3">
        {socialLinks.map((social) => (
          <Link
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-5 py-3 text-sm font-bold shadow-sm transition-all hover:border-primary hover:shadow-md"
            style={{ color: socialLinkColor(social) }}
          >
            <span className="material-symbols-outlined text-xl">{socialLinkIcon(social)}</span>
            <span className="text-slate-700">{socialLinkLabel(social)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Mirrors the Services section in the old page.blade.php. */
export function ServicesSection({ owner, landingSections }: { owner: Owner; landingSections: LandingSectionRow[] }) {
  const text = (owner.services_text ?? "").trim();
  if (!isSectionEnabled(landingSections, "services") || text === "") return null;

  return (
    <section className="mx-auto mb-16 max-w-3xl">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <span className="material-symbols-outlined text-2xl text-primary">build</span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">Services</h3>
        </div>
        <div className="whitespace-pre-line font-medium leading-relaxed text-slate-600">{text}</div>
      </div>
    </section>
  );
}

/** Mirrors the Contact section in the old page.blade.php. */
export function ContactSection({ owner, landingSections }: { owner: Owner; landingSections: LandingSectionRow[] }) {
  const hasContact =
    isSectionEnabled(landingSections, "contact") &&
    Boolean(owner.contact_email || owner.contact_phone || owner.contact_whatsapp);
  if (!hasContact) return null;

  const phoneCode = owner.contact_phone_code ? `+${owner.contact_phone_code.replace(/^\+/, "")} ` : "";
  const whatsappDigits = (owner.contact_whatsapp ?? "").replace(/[^0-9]/g, "");

  return (
    <section className="mx-auto mb-16 max-w-3xl">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <span className="material-symbols-outlined text-2xl text-primary">mail</span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">Get in Touch</h3>
        </div>
        <div className="space-y-4">
          {owner.contact_email && (
            <a
              href={`mailto:${owner.contact_email}`}
              className="group flex items-center gap-4 rounded-2xl border border-transparent bg-slate-50 p-4 transition-all hover:border-primary hover:bg-orange-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-lg">email</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
                <p className="font-bold text-slate-900">{owner.contact_email}</p>
              </div>
            </a>
          )}
          {owner.contact_phone && (
            <a
              href={`tel:${owner.contact_phone_code ?? ""}${owner.contact_phone}`}
              className="group flex items-center gap-4 rounded-2xl border border-transparent bg-slate-50 p-4 transition-all hover:border-primary hover:bg-orange-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-lg">call</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</p>
                <p className="font-bold text-slate-900">
                  {phoneCode}
                  {owner.contact_phone}
                </p>
              </div>
            </a>
          )}
          {owner.contact_whatsapp && (
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-transparent bg-slate-50 p-4 transition-all hover:border-green-400 hover:bg-green-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-all group-hover:bg-green-500 group-hover:text-white">
                <span className="material-symbols-outlined text-lg">chat</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp</p>
                <p className="font-bold text-slate-900">Message on WhatsApp</p>
              </div>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
