/**
 * Mirrors App\Models\UserSocialMedia::PLATFORMS from the old Laravel app —
 * label/icon/color per platform key, used to render the personal-branding
 * header nav and the Social Links section on /{username}/{slug}.
 */
export const SOCIAL_PLATFORMS: Record<string, { label: string; icon: string; color: string }> = {
  youtube: { label: "YouTube", icon: "smart_display", color: "#FF0000" },
  instagram: { label: "Instagram", icon: "photo_camera", color: "#E1306C" },
  facebook: { label: "Facebook", icon: "facebook", color: "#1877F2" },
  tiktok: { label: "TikTok", icon: "music_note", color: "#010101" },
  twitter: { label: "X / Twitter", icon: "alternate_email", color: "#1DA1F2" },
  linkedin: { label: "LinkedIn", icon: "work", color: "#0A66C2" },
  spotify: { label: "Spotify", icon: "headphones", color: "#1DB954" },
  soundcloud: { label: "SoundCloud", icon: "cloud", color: "#FF5500" },
  whatsapp: { label: "WhatsApp", icon: "chat", color: "#25D366" },
  telegram: { label: "Telegram", icon: "send", color: "#2CA5E0" },
  snapchat: { label: "Snapchat", icon: "ghost", color: "#FFFC00" },
  pinterest: { label: "Pinterest", icon: "push_pin", color: "#E60023" },
  twitch: { label: "Twitch", icon: "live_tv", color: "#9146FF" },
  discord: { label: "Discord", icon: "forum", color: "#5865F2" },
  website: { label: "Website", icon: "language", color: "#4CAF50" },
  custom: { label: "Custom", icon: "link", color: "#607D8B" },
};

export type SocialLinkRow = {
  id: number;
  platform: string;
  label: string | null;
  url: string;
  icon: string | null;
};

export function socialLinkLabel(social: SocialLinkRow) {
  if (social.platform === "custom" && social.label) return social.label;
  return SOCIAL_PLATFORMS[social.platform]?.label ?? social.platform;
}

export function socialLinkIcon(social: SocialLinkRow) {
  return social.icon || SOCIAL_PLATFORMS[social.platform]?.icon || "link";
}

export function socialLinkColor(social: SocialLinkRow) {
  return SOCIAL_PLATFORMS[social.platform]?.color ?? "#607D8B";
}
