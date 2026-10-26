import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import { publicStorageUrl } from "@/lib/storage";
import { socialLinkColor, socialLinkIcon, type SocialLinkRow } from "@/lib/public-page/social-platforms";

type Owner = {
  name: string;
  public_branding_enabled: boolean | null;
  header_branding_enabled: boolean | null;
  logo_enabled: boolean | null;
  logo_path: string | null;
  profile_photo_path: string | null;
  business_title: string | null;
};

/**
 * Conditional header for /{username}/{slug}, mirroring the old Laravel
 * page.blade.php: the default BuzzinBeats nav, or — when the creator has
 * turned on personal branding and their header toggle — their own
 * logo/name + social links instead.
 *
 * NOTE: the old page additionally gated this behind
 * `$pageUser->canUseFeature('branding_removal' | 'personal_logo')`, a
 * subscription-plan feature flag. That plan/feature system isn't part of
 * this app's data layer yet (and wiring it up would touch subscription
 * logic, which is out of scope here), so this version shows personal
 * branding whenever the creator's own toggles are on, without a plan
 * gate — see the restoration report.
 */
export function hasPersonalBranding(owner: Owner) {
  return Boolean(owner.public_branding_enabled) && Boolean(owner.header_branding_enabled);
}

export default function PublicPageHeader({
  owner,
  socialLinks,
}: {
  owner: Owner;
  socialLinks: SocialLinkRow[];
}) {
  if (!hasPersonalBranding(owner)) {
    return <SiteHeader minimal />;
  }

  const logoUrl = owner.logo_enabled ? publicStorageUrl(owner.logo_path) : null;
  const photoUrl = publicStorageUrl(owner.profile_photo_path);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={owner.name} className="h-10 w-auto object-contain" />
            ) : photoUrl ? (
              <Image src={photoUrl} alt={owner.name} width={40} height={40} className="h-10 w-10 rounded-2xl object-cover" />
            ) : null}
            <span className="text-xl font-black tracking-tight text-slate-900">{owner.name}</span>
          </div>
          {owner.business_title && (
            <div className="hidden text-xs font-bold uppercase tracking-widest text-primary md:block">
              {owner.business_title}
            </div>
          )}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2">
              {socialLinks.slice(0, 4).map((social) => (
                <Link
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 transition-all hover:border-primary"
                  style={{ color: socialLinkColor(social) }}
                >
                  <span className="material-symbols-outlined text-lg">{socialLinkIcon(social)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
