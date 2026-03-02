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
import { useState } from "react";

export default function Footer() {

const [form,setForm]=useState({
name:"",
email:"",
message:""
})

const [loading,setLoading]=useState(false)
const [success,setSuccess]=useState("")


const handleChange=(e:any)=>{
setForm({...form,[e.target.name]:e.target.value})
}


const handleSubmit=async(e:any)=>{
e.preventDefault()

setLoading(true)

const res=await fetch("/api/contact",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(form)
})

const data=await res.json()

setLoading(false)

if(data.success){

setSuccess("Message Sent Successfully ✅")

setForm({
name:"",
email:"",
message:""
})

}else{

setSuccess("Error Sending Message ❌")

}
}



return (

<>

{/* CONTACT SECTION */}

<motion.div

initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
viewport={{once:true}}
transition={{duration:.6}}

className="max-w-6xl mx-auto px-6 mt-20"

>

<div className="bg-white shadow-xl rounded-3xl p-10 grid md:grid-cols-2 gap-10">


{/* Left */}

<div>

<h2 className="text-3xl font-bold text-green-700 mb-4">

Contact Us

</h2>

<p className="text-gray-500 mb-6">

Have any question?  
Send us a message.

</p>


<div className="space-y-4 text-gray-600">

<div className="flex gap-3">

<Phone size={18} className="text-green-600"/>

+91 8847608613

</div>


<div className="flex gap-3">

<Mail size={18} className="text-green-600"/>

souravkumar85054@gmail.com

</div>

</div>

</div>



{/* Form */}

<form
onSubmit={handleSubmit}
className="space-y-4"
>

<input
name="name"
value={form.name}
onChange={handleChange}
placeholder="Your Name"
required

className="w-full p-3 border rounded-xl focus:outline-none focus:border-green-500"
/>


<input
name="email"
value={form.email}
onChange={handleChange}
placeholder="Your Email"
required

className="w-full p-3 border rounded-xl focus:outline-none focus:border-green-500"
/>


<textarea
name="message"
value={form.message}
onChange={handleChange}
placeholder="Your Message"
required

className="w-full p-3 border rounded-xl h-32 focus:outline-none focus:border-green-500"
/>



<button

disabled={loading}

className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl w-full font-semibold"

>

{loading?"Sending...":"Send Message"}

</button>


{success && (

<p className="text-center text-green-600">

{success}

</p>

)}

</form>


</div>

</motion.div>



{/* FOOTER */}

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

Contact Info

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



<div className="border-t border-green-500/40 py-4 text-center text-green-100 text-sm">

© {new Date().getFullYear()}  

<span className="ml-2 font-semibold text-white">

 AnuRadha Bhandar

</span>

. All rights reserved.

</div>


</motion.footer>

</>

);

}