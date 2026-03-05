import connectDB from "@/lib/db";
import { generateProductDescription } from "@/lib/gemini";
import Grocery from "@/models/grocery.model";
import { NextResponse } from "next/server";

export async function PATCH(
 req: Request,
 { params }: { params: Promise<{ id: string }> }
){

 const { id } = await params;

 const body = await req.json();

 console.log("Updating:", id);
 console.log("Data:", body);

 await connectDB();

 // Check if description is being updated to empty/null
 let finalBody = { ...body };
 
 if (body.description === "" || body.description === null || body.description === undefined) {
   // Need to get the current product to generate AI description
   const currentProduct = await Grocery.findById(id);
   if (currentProduct) {
     console.log("🔄 Generating AI description during update for:", currentProduct.name);
     const aiResult = await generateProductDescription(currentProduct.name, currentProduct.category);
     if (aiResult.success && aiResult.description) {
       finalBody.description = aiResult.description;
       console.log("✅ AI generated description during update:", finalBody.description);
     } else {
       console.warn("❌ AI description generation failed during update, using fallback");
       // Fallback description as requested
       finalBody.description = "Fresh and high-quality grocery item perfect for daily cooking.";
     }
   }
 }

 const updated = await Grocery.findByIdAndUpdate(
 id,
 finalBody,
 { new:true }
 );

 return NextResponse.json(updated);

}
