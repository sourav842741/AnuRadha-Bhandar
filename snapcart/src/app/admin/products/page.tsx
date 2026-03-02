import AdminProductsClient from "@/components/AdminProductsClient";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";

// ⭐ VERY IMPORTANT
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {

  await connectDb();

  const products = await Grocery.find({}).sort({ createdAt: -1 });

  const plainProducts = JSON.parse(JSON.stringify(products));

  return <AdminProductsClient products={plainProducts} />;

}