import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";

/* ======================
   GENERATE AI DESCRIPTION USING GEMINI
   POST /api/product/description
====================== */
export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Find the product
    const product = await Grocery.findById(productId);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // If description already exists, return it
    if (product.description && product.description.trim()) {
      return NextResponse.json({
        message: "Description already exists",
        description: product.description,
      });
    }

    // Get Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json(
        { message: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Create prompt for Gemini
    const prompt = `Write a short ecommerce product description for ${product.name}. This is a ${product.category} product. Highlight freshness, quality, and usage in 3-4 lines. Make it appealing for online shoppers.`;

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { message: "Failed to generate description from AI" },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();

    // Extract the generated description
    const generatedDescription =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!generatedDescription) {
      return NextResponse.json(
        { message: "No description generated" },
        { status: 500 }
      );
    }

    // Save the description to the database
    await Grocery.findByIdAndUpdate(productId, {
      description: generatedDescription,
    });

    return NextResponse.json({
      message: "Description generated successfully",
      description: generatedDescription,
    });
  } catch (error) {
    console.error("GENERATE DESCRIPTION ERROR:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

/* ======================
   GET PRODUCT DESCRIPTION
   GET /api/product/description?productId=ID
====================== */
export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Grocery.findById(productId).select("description");

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      description: product.description || "",
    });
  } catch (error) {
    console.error("GET DESCRIPTION ERROR:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

