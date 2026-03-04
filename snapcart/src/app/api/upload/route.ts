import { NextResponse } from "next/server";
import uploadOnCloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {

  try {

    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    const imageUrl = await uploadOnCloudinary(file);

    return NextResponse.json({
      url: imageUrl
    });

  } catch (error) {

    console.log("Upload error:", error);

    return NextResponse.json(
      { message: "Upload failed" },
      { status: 500 }
    );

  }

}