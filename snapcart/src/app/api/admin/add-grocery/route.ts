import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import { generateProductDescription } from "@/lib/gemini";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;

    const category = formData.get("category") as string;

    const unit = formData.get("unit") as string;

    const price = formData.get("price") as string;

    /* ✅ IMPORTANT */
    const mrp = formData.get("mrp") as string;

    // Get description from form data
    let description = formData.get("description") as string | null;

    // If description is empty or not provided, generate with Gemini AI
    if (!description || description.trim() === "") {
      console.log("🔄 Generating AI description for:", name);
      const aiResult = await generateProductDescription(name, category);
      if (aiResult.success && aiResult.description) {
        description = aiResult.description;
        console.log("✅ AI generated description:", description);
      } else {
        console.warn("❌ AI description generation failed, using fallback:", aiResult.error);
        // Fallback description as requested
        description = "Fresh and high-quality grocery item perfect for daily cooking.";
      }
    }

    console.log("💾 Final description to save:", description);

    const file = formData.get("file") as Blob | null;

    let imageUrl: string | null = "";

    if (file) {
      imageUrl = await uploadOnCloudinary(file);
    }

    const grocery = await Grocery.create({
      name,
      category,
      unit,
      price,
      mrp, // ✅ THIS WAS MISSING
      image: imageUrl,
      description: description || "",
    });

    return NextResponse.json(grocery, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `add grocery error ${error}` },
      { status: 500 },
    );
  }
}
