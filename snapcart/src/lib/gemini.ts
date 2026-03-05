/**
 * Gemini AI Helper Function
 * Generates product descriptions for ecommerce
 */

interface GeminiResponse {
  description: string;
  success: boolean;
  error?: string;
}

/**
 * Generate a product description using Gemini AI
 * @param productName - Name of the product
 * @param category - Category of the product
 * @returns Generated description or error
 */
export async function generateProductDescription(
  productName: string,
  category: string
): Promise<GeminiResponse> {
  try {
    // Check for API key - try both possible environment variable names
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    console.log("🔑 GEMINI API KEY LOADED:", geminiApiKey ? "YES (key exists)" : "NO (key missing)");

    if (!geminiApiKey) {
      console.error("❌ Gemini API key not configured in environment variables");
      return {
        description: "",
        success: false,
        error: "Gemini API key not configured",
      };
    }

    // Create prompt for Gemini as specified in requirements
    const prompt = `Write a short ecommerce product description for ${productName}. This is a ${category} product. Highlight freshness, quality, benefits, and usage in 3-4 lines suitable for an online grocery store.`;

    console.log("📤 SENDING GEMINI REQUEST:", { productName, category });
    console.log("📝 PROMPT:", prompt);

    // Call Gemini API - using the working model from chat suggestions
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

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

    console.log("📥 GEMINI RESPONSE STATUS:", geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("❌ Gemini API Error:", errorData);
      return {
        description: "",
        success: false,
        error: "Failed to generate description from AI",
      };
    }

    const geminiData = await geminiResponse.json();
    console.log("📥 GEMINI RESPONSE DATA:", JSON.stringify(geminiData));

    // Extract the generated description
    const generatedDescription =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!generatedDescription) {
      console.warn("⚠️ No description generated from Gemini");
      return {
        description: "",
        success: false,
        error: "No description generated",
      };
    }

    console.log("✅ GENERATED DESCRIPTION:", generatedDescription);

    return {
      description: generatedDescription,
      success: true,
    };
  } catch (error) {
    console.error("❌ Gemini Description Generation Error:", error);
    return {
      description: "",
      success: false,
      error: "Server error during description generation",
    };
  }
}

