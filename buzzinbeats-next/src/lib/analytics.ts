/** Mirrors Laravel AnalyticsEvent::detectDevice() — regex-based UA sniff. */
export function detectDeviceType(userAgent: string | null): "mobile" | "tablet" | "desktop" {
  if (!userAgent) return "desktop";
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "tablet";
  if (
    /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent)
  ) {
    return "mobile";
  }
  return "desktop";
}
