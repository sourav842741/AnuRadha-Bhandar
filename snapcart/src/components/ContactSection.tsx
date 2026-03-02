"use client";

import { motion } from "framer-motion";
import { Mail, Phone, User, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ContactSection() {

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
}
else{
setSuccess("Error sending message ❌")
}
}


return(

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

Have any question or problem?  
Send us a message and we will reply soon.

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



{/* Right Form */}

<form onSubmit={handleSubmit}
className="space-y-4">

<div>

<input
name="name"
value={form.name}
onChange={handleChange}
placeholder="Your Name"
required

className="w-full p-3 border rounded-xl focus:outline-none focus:border-green-500"
/>

</div>


<div>

<input
name="email"
value={form.email}
onChange={handleChange}
placeholder="Your Email"
required

className="w-full p-3 border rounded-xl focus:outline-none focus:border-green-500"
/>

</div>


<div>

<textarea
name="message"
value={form.message}
onChange={handleChange}
placeholder="Your Message"
required

className="w-full p-3 border rounded-xl h-32 focus:outline-none focus:border-green-500"
/>

</div>



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

)

}