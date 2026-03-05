import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import FlashDealAdminClient from "@/components/FlashDealAdminClient";

export const dynamic = "force-dynamic";

export default async function FlashDealPage() {
  await connectDb();

  const products = await Grocery.find({}).sort({ createdAt: -1 });

  const plainProducts = JSON.parse(JSON.stringify(products));

  return <FlashDealAdminClient products={plainProducts} />;
}

