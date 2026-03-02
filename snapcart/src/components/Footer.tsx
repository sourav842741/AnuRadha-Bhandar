"use client";

import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
  ShoppingBasket
} from "lucide-react";
import Link from "next/link";

export default function Footer() {

return (

<motion.footer
initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
viewport={{once:true}}
transition={{duration:.6}}

className="mt-24 
bg-gradient-to-b 
from-green-600 
to-green-700 
text-white
rounded-t-3xl
shadow-xl"

>


<div className="max-w-6xl mx-auto px-6 py-14
grid md:grid-cols-3 gap-10">


{/* Brand */}

<div>

<div className="flex items-center gap-2 mb-4">

<ShoppingBasket className="text-white"/>

<h2 className="text-2xl font-bold">

AnuRadha Bhandar

</h2>

</div>

<p className="text-green-100 text-sm leading-relaxed">

Fresh groceries delivered to your doorstep quickly and safely.
Shop smart and eat fresh every day.

</p>

</div>



{/* Links */}

<div>

<h3 className="font-semibold text-lg mb-4">

Quick Links

</h3>

<ul className="space-y-3 text-green-100 text-sm">


<li>

<Link
href="/"
className="hover:text-white transition"
>

Home

</Link>

</li>


<li>

<Link
href="/user/my-orders"
className="hover:text-white transition"
>

My Orders

</Link>

</li>


<li>

<Link
href="/"
className="hover:text-white transition"
>

Shop

</Link>

</li>


<li>

<Link
href="/privacy"
className="hover:text-white transition"
>

Privacy Policy

</Link>

</li>

</ul>

</div>



{/* Contact */}

<div>

<h3 className="font-semibold text-lg mb-4">

Contact Us

</h3>

<div className="space-y-3 text-green-100 text-sm">


<div className="flex gap-2">

<MapPin size={16}/>

<span>

11/1 T.C Mukherjee Street  
Rishra, Kolkata

</span>

</div>


<div className="flex gap-2">

<Phone size={16}/>

+91 8847608613

</div>


<div className="flex gap-2">

<Mail size={16}/>

souravkumar85054@gmail.com

</div>

</div>



{/* Social */}

<div className="flex gap-4 mt-5">


<Link href="#">

<div className="w-9 h-9 rounded-full
bg-green-500
flex items-center justify-center
hover:bg-green-400
transition">

<Facebook size={16}/>

</div>

</Link>


<Link href="#">

<div className="w-9 h-9 rounded-full
bg-green-500
flex items-center justify-center
hover:bg-green-400
transition">

<Instagram size={16}/>

</div>

</Link>


<Link href="#">

<div className="w-9 h-9 rounded-full
bg-green-500
flex items-center justify-center
hover:bg-green-400
transition">

<Twitter size={16}/>

</div>

</Link>


</div>

</div>

</div>



{/* Bottom */}

<div className="border-t border-green-500/40 py-4 text-center text-green-100 text-sm">

© {new Date().getFullYear()}  

<span className="ml-2 font-semibold text-white">

 AnuRadha Bhandar

</span>

. All rights reserved.

</div>


</motion.footer>

);

}