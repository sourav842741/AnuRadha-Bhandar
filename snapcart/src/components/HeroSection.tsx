"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBasket,
  Leaf,
  Truck,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket";

const slides = [
  {
    id: 1,
    icon: <Leaf className="w-16 h-16 text-green-500" />,
    title: "Fresh Organic Groceries",
    subtitle:
      "Farm fresh fruits and vegetables delivered to your doorstep in minutes.",
    btnText: "Shop Now",
    bg: "https://res.cloudinary.com/dm9hpyepi/image/upload/v1765042711/Screenshot_2025-12-06_230420_taahup.png",
  },
  {
    id: 2,
    icon: <Truck className="w-16 h-16 text-yellow-400" />,
    title: "Lightning Fast Delivery",
    subtitle:
      "Groceries delivered to your home quickly and safely.",
    btnText: "Order Now",
    bg: "https://res.cloudinary.com/dm9hpyepi/image/upload/v1765043020/Screenshot_2025-12-06_230529_n2nbrd.png",
  },
  {
    id: 3,
    icon: <Smartphone className="w-16 h-16 text-blue-400" />,
    title: "Easy Online Shopping",
    subtitle:
      "Simple and smooth grocery shopping from your phone.",
    btnText: "Get Started",
    bg: "https://plus.unsplash.com/premium_photo-1663091378026-7bee6e1c7247?auto=format&fit=crop&w=1771&q=80",
  },
];

function HeroSection() {

  const [current,setCurrent]=useState(0);

  const { data: session, status } = useSession();

  /* Socket Identity */

  useEffect(() => {

    if(status!=="authenticated") return;

    const socket=getSocket();

    socket.emit("identity",{
      userId:session.user.id
    });

  },[status]);


  /* Auto Slide */

  useEffect(()=>{

    const timer=setInterval(()=>{
      setCurrent((prev)=>(prev+1)%slides.length);
    },4000);

    return ()=>clearInterval(timer)

  },[])



  return (

<section className="relative w-[96%] mx-auto mt-16 md:mt-20 h-[70vh] rounded-3xl overflow-hidden shadow-xl">


{/* Background */}

<AnimatePresence mode="wait">

<motion.div
key={slides[current].id}
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
transition={{duration:1}}
className="absolute inset-0"
>

<Image
src={slides[current].bg}
alt="banner"
fill
priority
className="object-cover"
/>

{/* Gradient Overlay */}

<div className="absolute inset-0 bg-gradient-to-r
from-black/70
via-black/40
to-transparent"/>

</motion.div>

</AnimatePresence>


{/* Content */}

<div className="absolute inset-0 flex items-center">

<div className="max-w-6xl mx-auto w-full px-8">

<motion.div
key={slides[current].title}
initial={{y:40,opacity:0}}
animate={{y:0,opacity:1}}
transition={{duration:.6}}
className="max-w-xl text-white"
>


{/* Icon */}

<div className="mb-4 bg-white/10 backdrop-blur-lg
w-16 h-16 rounded-2xl
flex items-center justify-center">

{slides[current].icon}

</div>



{/* Title */}

<h1 className="text-4xl md:text-6xl font-bold leading-tight">

{slides[current].title}

</h1>



{/* Subtitle */}

<p className="mt-4 text-lg text-gray-200">

{slides[current].subtitle}

</p>



{/* Button */}

<motion.button

whileHover={{scale:1.05}}
whileTap={{scale:.95}}

className="mt-6 bg-green-600
hover:bg-green-700
px-7 py-3 rounded-xl
font-semibold
shadow-lg
flex items-center gap-2"
>

<ShoppingBasket size={18}/>

{slides[current].btnText}

</motion.button>


</motion.div>

</div>

</div>



{/* Dots */}

<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">

{slides.map((_,i)=>(

<button
key={i}
onClick={()=>setCurrent(i)}
className={`h-2 rounded-full transition-all

${i===current
?"bg-white w-8"
:"bg-white/50 w-2"}

`}
/>

))}

</div>


</section>

  );
}

export default HeroSection;