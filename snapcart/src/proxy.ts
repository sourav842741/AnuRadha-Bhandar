import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {

 const { pathname } = req.nextUrl;

 // ✅ Public routes
 const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/favicon.ico",
  "/_next"
 ];

 if(publicRoutes.some(path => pathname.startsWith(path))){
  return NextResponse.next();
 }

 // ✅ Token check
 const token = await getToken({
  req,
  secret: process.env.AUTH_SECRET
 });

 if(!token){
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", req.url);
  return NextResponse.redirect(loginUrl);
 }

 const role = token.role;

 // ✅ Role routes
 if(pathname.startsWith("/user") && role !== "user"){
  return NextResponse.redirect(new URL("/unauthorized", req.url));
 }

 if(pathname.startsWith("/admin") && role !== "admin"){
  return NextResponse.redirect(new URL("/unauthorized", req.url));
 }

 if(pathname.startsWith("/delivery") && role !== "deliveryBoy"){
  return NextResponse.redirect(new URL("/unauthorized", req.url));
 }

 return NextResponse.next();
}

export const config = {
 matcher: ["/:path*"],
};