import { redirect } from "next/navigation";

/** Payment Gateway settings now live inline on the Payments page (matching
 * the old admin panel's single "Payment" nav item) — redirect old bookmarks. */
export default function AdminPaymentGatewayRedirect() {
  redirect("/manage-56buzzinbeats-qr-master-admin-page/payments#gateway-settings");
}
