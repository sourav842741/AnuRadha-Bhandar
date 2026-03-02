"use client";

import {
  ShoppingCart,
  LogOut,
  User,
  Package,
  Search,
  PlusCircle,
  ClipboardList,
  Menu,
  Truck,
  Boxes,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import mongoose from "mongoose";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { createPortal } from "react-dom";

interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  role: "admin" | "user" | "deliveryBoy";
  image?: string;
  email: string;
  mobile?: string;
  myOrders?: mongoose.Types.ObjectId[];
}

function Nav({ user }: { user: IUser }) {

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cartData } = useSelector((state: RootState) => state.cart);


  // ✅ Auto Search Suggestions
  const suggestions = [
    "Milk",
    "Eggs",
    "Bread",
    "Rice",
    "Atta",
    "Oil",
    "Sugar",
    "Tea",
    "Salt",
    "Potato",
    "Onion"
  ];

  const [placeholder,setPlaceholder] =
  useState("Search groceries...");


  useEffect(()=>{

    const interval = setInterval(()=>{

      const random =
      suggestions[Math.floor(Math.random()*suggestions.length)];

      setPlaceholder(`Search ${random}...`);

    },2000)

    return ()=>clearInterval(interval)

  },[])



  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(search)}`;
      setMobileSearchOpen(false);
    }
  };

  const isUser = user.role === "user";
  const isAdmin = user.role === "admin";
  const isDelivery = user.role === "deliveryBoy";

  const SidebarPortal = menuOpen
    ? createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[1000]"
            onClick={() => setMenuOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="fixed top-0 left-0 h-full w-[75%] z-[9999]
              bg-green-800 text-white flex flex-col p-6"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white text-2xl mb-6"
            >
              ✕
            </button>

            <Link href="/admin/add-grocery">Add Grocery</Link>
            <Link href="/admin/products">Products</Link>
            <Link href="/admin/manage-orders">Orders</Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-auto text-red-300"
            >
              Logout
            </button>
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>

<nav className="fixed top-3 left-1/2 -translate-x-1/2 
w-[96%] max-w-6xl h-16 px-5
bg-white/80 backdrop-blur-xl
border border-white/40
rounded-2xl
shadow-lg flex justify-between items-center z-[999]">

{/* Logo */}

<Link
href="/"
className="flex items-center gap-2 font-bold text-xl text-green-700"
>

<ShoppingCart className="w-6 h-6 text-green-600"/>

<span>
AnuRadha Bhandar
</span>

</Link>


{/* Desktop Search */}

{isUser && (

<form
onSubmit={handleSearch}
className="hidden md:flex items-center 
bg-gray-100 rounded-full px-4 py-2
w-[40%]"
>

<Search className="w-5 h-5 text-gray-500 mr-2"/>

<input
type="text"
value={search}
onChange={(e)=>setSearch(e.target.value)}
placeholder={placeholder}
className="bg-transparent outline-none w-full"
/>

</form>

)}



<div className="flex items-center gap-3">


{/* Mobile Search */}

{isUser && (

<button
onClick={()=>setMobileSearchOpen(!mobileSearchOpen)}
className="md:hidden
w-10 h-10 rounded-full
bg-gray-100 flex items-center justify-center"
>

<Search className="w-5 h-5 text-green-600"/>

</button>

)}



{/* Cart */}

{isUser && (

<Link
href="/user/cart"
className="relative
w-10 h-10 rounded-full
bg-green-600
flex items-center justify-center"
>

<ShoppingCart className="w-5 h-5 text-white"/>


{cartData.length>0 &&(

<span className="
absolute -top-1 -right-1
bg-red-500 text-white
text-xs w-5 h-5
flex items-center justify-center
rounded-full">

{cartData.length}

</span>

)}

</Link>

)}



{/* Profile */}

<div ref={dropdownRef} className="relative">

<button
onClick={()=>setOpen(!open)}
className="w-10 h-10 rounded-full
overflow-hidden bg-gray-100
flex items-center justify-center"
>

{user.image ?

<Image
src={user.image}
alt="user"
fill
className="object-cover"/>

:

<User className="text-green-600 w-5 h-5"/>

}

</button>


<AnimatePresence>

{open &&(

<motion.div
initial={{opacity:0,y:-10}}
animate={{opacity:1,y:0}}
exit={{opacity:0,y:-10}}
className="absolute right-0 mt-3 w-56
bg-white rounded-2xl shadow-xl p-2"
>

<div className="p-3 border-b">

<p className="font-semibold">

{user.name}

</p>

<p className="text-xs text-gray-500">

{user.role}

</p>

</div>


<Link
href="/user/my-orders"
className="flex gap-2 p-3 hover:bg-gray-50 rounded-lg"
>

<Package className="w-5 h-5 text-green-600"/>

My Orders

</Link>


<button
onClick={()=>signOut({callbackUrl:"/"})}
className="flex gap-2 p-3 w-full
hover:bg-red-50 rounded-lg"
>

<LogOut className="w-5 h-5 text-red-600"/>

Logout

</button>

</motion.div>

)}

</AnimatePresence>

</div>

</div>

</nav>



{/* Mobile Search */}

<AnimatePresence>

{mobileSearchOpen && isUser &&(

<motion.div
initial={{y:-80}}
animate={{y:0}}
exit={{y:-80}}
className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] 
bg-white rounded-full shadow-lg z-40 flex items-center px-4 py-2"
>

<Search className="text-gray-500 w-5 h-5 mr-2"/>

<form onSubmit={handleSearch} className="flex-grow">

<input
type="text"
value={search}
onChange={(e)=>setSearch(e.target.value)}
placeholder={placeholder}
className="w-full outline-none"
/>

</form>

<X
onClick={()=>setMobileSearchOpen(false)}
className="text-gray-500 w-5 h-5 cursor-pointer"
/>

</motion.div>

)}

</AnimatePresence>

{SidebarPortal}

</>

);

}

export default Nav;