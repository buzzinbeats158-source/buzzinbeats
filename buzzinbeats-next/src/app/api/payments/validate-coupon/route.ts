import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { validateCoupon } from "@/lib/coupons";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ valid: false, message: "Not authenticated" }, { status: 401 });

  const { code, plan, amount } = await request.json();
  if (!code || !plan || amount === undefined) {
    return NextResponse.json({ valid: false, message: "Missing fields" }, { status: 422 });
  }

  const result = await validateCoupon(code, user.id, plan, Number(amount));
  if (!result.valid) return NextResponse.json(result, { status: 422 });

  return NextResponse.json({
    valid: true,
    code: result.coupon.code,
    discount: result.discount,
    final: result.final,
    type: result.coupon.discount_type,
  });
}
