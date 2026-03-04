"use client";

import React, { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Upload, PlusCircle, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Rice, Atta & Grains",
  "Snacks & Biscuits",
  "Spices & Masalas",
  "Beverages & Drinks",
  "Personal Care",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet Care",
];

const units = ["kg","g","liter","ml","piece","pack"];

export default function AddGrocery() {

const [name,setName]=useState("");
const [category,setCategory]=useState("");
const [price,setPrice]=useState("");
const [actualPrice,setActualPrice]=useState("");
const [unit,setUnit]=useState("piece");

const [image,setImage]=useState<File|null>(null);
const [preview,setPreview]=useState<string|null>(null);

const [loading,setLoading]=useState(false);


/* Upload Image */

const handleImage=(e:React.ChangeEvent<HTMLInputElement>)=>{

const file=e.target.files?.[0];

if(!file) return;

setImage(file);
setPreview(URL.createObjectURL(file));

};



/* Submit */

const handleSubmit=async(e:FormEvent)=>{

e.preventDefault();

if(loading) return;

setLoading(true);

try{

const formdata=new FormData();

formdata.append("name",name);

formdata.append("category",category);

formdata.append("unit",unit);

formdata.append("price",price);

/* ✅ IMPORTANT FIX */
formdata.append("mrp",actualPrice);

if(image){

formdata.append("file",image);

}

await axios.post("/api/admin/add-grocery",formdata);

alert("✅ Grocery Added");

setName("");
setCategory("");
setPrice("");
setActualPrice("");
setPreview(null);
setImage(null);

}
catch(error){

alert("❌ Error Adding Grocery");

}
finally{

setLoading(false);

}

};



/* Discount Preview */

const discount =
actualPrice && price
? Math.round(
(1-Number(price)/Number(actualPrice))*100
)
:0;



return(

<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white py-16 px-4 relative">

<Link
href="/"
className="absolute top-6 left-6 flex items-center gap-2 text-green-700 font-semibold bg-white px-4 py-2 rounded-full shadow-md"
>

<ArrowLeft className="w-5 h-5"/>
Back

</Link>

<Link
href="/admin/coupons"
className="absolute top-6 right-6 flex items-center gap-2 text-white bg-green-600 px-4 py-2 rounded-full shadow-md"
>
Manage Coupons
</Link>

<Link
href="/admin/banner"
className="absolute top-20 right-6 flex items-center gap-2 text-white bg-black px-4 py-2 rounded-full shadow-md"
>
Manage Banner
</Link>



<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
className="bg-white w-full max-w-2xl shadow-2xl rounded-3xl p-8"
>

<h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
Add Grocery Item
</h2>


<form
onSubmit={handleSubmit}
className="flex flex-col gap-6"
>


<input
placeholder="Product Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border p-3 rounded-xl"
/>


<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="border p-3 rounded-xl"
>

<option value="">Select Category</option>

{categories.map(c=>(
<option key={c}>{c}</option>
))}

</select>


<select
value={unit}
onChange={(e)=>setUnit(e.target.value)}
className="border p-3 rounded-xl"
>

{units.map(u=>(
<option key={u}>{u}</option>
))}

</select>



<input
type="number"
placeholder="Actual Price ₹"
value={actualPrice}
onChange={(e)=>setActualPrice(e.target.value)}
className="border p-3 rounded-xl"
/>


<input
type="number"
placeholder="Sale Price ₹"
value={price}
onChange={(e)=>setPrice(e.target.value)}
className="border p-3 rounded-xl"
/>



{price && actualPrice && (

<div className="bg-gray-50 p-4 rounded-xl">

<p className="font-semibold mb-2">
Price Preview
</p>

<div className="flex gap-3 items-center">

<span className="text-green-700 font-bold text-lg">
₹{price}
</span>

<span className="line-through text-gray-400">
₹{actualPrice}
</span>

<span className="text-green-600 font-semibold">
{discount}% off
</span>

</div>

</div>

)}



<label className="flex gap-2 border p-3 rounded-xl cursor-pointer justify-center">

<Upload/>

Choose Photo

<input
type="file"
onChange={handleImage}
className="hidden"
/>

</label>



{preview &&(

<Image
src={preview}
alt="preview"
width={120}
height={120}
className="rounded-xl"
/>

)}



<button
disabled={loading}
className="bg-green-600 text-white py-3 rounded-xl flex justify-center gap-2 disabled:opacity-60"
>

{loading ? (

<>
<Loader2 className="animate-spin"/>
Saving...
</>

)

:(

<>
<PlusCircle/>
Add Grocery
</>

)}

</button>


</form>


</motion.div>


</div>

);

}