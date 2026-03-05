"use client";

import React,{useState,useEffect} from "react";
import {motion,AnimatePresence} from "framer-motion";
import Image from "next/image";

import {
Search,
Pencil,
ArrowLeft,
Package,
Upload,
X
} from "lucide-react";

import {useRouter} from "next/navigation";


interface Product{

_id:string;
name:string;
category:string;
price:string;
mrp:string;
unit:string;
image:string;
description?:string;

}


const categories=[

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


const units=["kg","g","liter","ml","piece","pack"];



export default function AdminProductsClient({products}:{products:Product[]}){


const router=useRouter();

const[search,setSearch]=useState("");

const[editing,setEditing]=useState<Product|null>(null);

const[imagePreview,setImagePreview]=useState<string|null>(null);

const[filtered,setFiltered]=useState<Product[]>([]);



useEffect(()=>{

setFiltered(products);

},[products]);



/* Search */

const handleSearch=(e:React.FormEvent)=>{

e.preventDefault();

const q=search.toLowerCase();

setFiltered(

products.filter(

(p)=>

p.name.toLowerCase().includes(q) ||

p.category.toLowerCase().includes(q)

)

)

}



/* Image */

const handleImageChange=(e:React.ChangeEvent<HTMLInputElement>)=>{

const file=e.target.files?.[0];

if(file){

const reader=new FileReader();

reader.onload=(ev)=>{

setImagePreview(ev.target?.result as string)

}

reader.readAsDataURL(file)

}

}



/* Save */

const handleEditSave = async()=>{

if(!editing)return;

const updated={

...editing,

price:Number(editing.price),
mrp:Number(editing.mrp),

image:imagePreview || editing.image

};

const res = await fetch(

`/api/admin/grocery/${editing._id}`,

{

method:"PATCH",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(updated)

}

)

if(res.ok){

setEditing(null);

router.refresh(); // ✅ Important

}

}




return(

<section className="max-w-7xl mx-auto px-4 py-6 pb-20">


{/* Header */}

<div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">


<button
onClick={()=>router.push("/")}
className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full"
>

<ArrowLeft size={18}/>
Back

</button>



<h1 className="text-2xl md:text-3xl font-bold text-green-700 flex gap-2">

<Package/>
Store Product Manager

</h1>


</div>



{/* Search */}

<form
onSubmit={handleSearch}
className="flex items-center border rounded-full px-5 py-3 mb-10 max-w-xl mx-auto shadow-sm"
>

<Search className="mr-2"/>

<input
value={search}
onChange={(e)=>setSearch(e.target.value)}
placeholder="Search product..."
className="w-full outline-none"
/>

</form>




{/* Products */}

{categories.map((category)=>{

const categoryProducts=filtered.filter(
(p)=>p.category===category
)

if(categoryProducts.length===0)return null;


return(

<div key={category} className="mb-10">


<h2 className="text-xl font-bold text-green-700 mb-4 border-l-4 border-green-600 pl-3">

{category}

</h2>



<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">


{categoryProducts.map((product)=>(


<div
key={product._id}
className="bg-white rounded-xl shadow hover:shadow-lg transition p-3 relative"
>


<button
onClick={()=>{
setEditing(product)
setImagePreview(product.image)
}}
className="absolute top-2 right-2 bg-white shadow-md p-2 rounded-full"
>

<Pencil size={16}/>

</button>




<div className="relative w-full h-32 mb-2">

<Image
src={product.image}
alt={product.name}
fill
sizes="200px"
className="object-cover rounded-lg"
/>

</div>



<h3 className="font-semibold text-sm line-clamp-1">

{product.name}

</h3>



{/* Price */}

<p className="text-sm mb-2">

<span className="text-green-700 font-bold">
₹{product.price}
</span>

<span className="line-through text-gray-400 ml-2">
₹{product.mrp}
</span>

<span className="text-gray-500 ml-1">
/{product.unit}
</span>

</p>



<button
onClick={()=>{
setEditing(product)
setImagePreview(product.image)
}}
className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-2 rounded-lg"
>

<Pencil size={16}/>
Edit

</button>



</div>


))}



</div>


</div>

)

})}




{/* Edit Modal */}

<AnimatePresence>

{editing&&(

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
>


<motion.div
initial={{scale:0.9}}
animate={{scale:1}}
exit={{scale:0.9}}
className="bg-white rounded-2xl p-6 w-[95%] sm:w-[420px]"
>



<div className="flex justify-between items-center mb-4">


<h2 className="text-xl font-bold">
Edit Product
</h2>


<button onClick={()=>setEditing(null)}>
<X/>
</button>


</div>




<input
value={editing.name}
onChange={(e)=>setEditing({...editing,name:e.target.value})}
className="border p-3 w-full mb-3 rounded-lg"
/>



<select
value={editing.category}
onChange={(e)=>setEditing({...editing,category:e.target.value})}
className="border p-3 w-full mb-3 rounded-lg"
>

{categories.map(c=>(
<option key={c}>{c}</option>
))}

</select>



{/* Actual Price */}

<input
value={editing.mrp}
type="number"
placeholder="Actual Price ₹"
onChange={(e)=>setEditing({
...editing,
mrp:e.target.value
})}
className="border p-3 w-full mb-3 rounded-lg"
/>



{/* Offer Price */}

<input
value={editing.price}
type="number"
placeholder="Offer Price ₹"
onChange={(e)=>setEditing({
...editing,
price:e.target.value
})}
className="border p-3 w-full mb-3 rounded-lg"
/>



{/* Discount Preview */}

{editing.mrp && editing.price &&(

<div className="bg-gray-50 p-3 rounded-lg mb-3">

<span className="text-green-700 font-bold">
₹{editing.price}
</span>

<span className="line-through text-gray-400 ml-2">
₹{editing.mrp}
</span>

<span className="text-green-600 ml-2 font-semibold">

{Math.round(
(1-Number(editing.price)/Number(editing.mrp))*100
)}% off

</span>

</div>

)}



<select
value={editing.unit}
onChange={(e)=>setEditing({...editing,unit:e.target.value})}
className="border p-3 w-full mb-3 rounded-lg"
>

{units.map(u=>(
<option key={u}>{u}</option>
))}

</select>



{/* Description Textarea */}
<textarea
value={editing.description || ""}
onChange={(e)=>setEditing({...editing,description:e.target.value})}
placeholder="Product Description (optional)"
rows={3}
className="border p-3 w-full mb-3 rounded-lg resize-none"
/>
<p className="text-xs text-gray-500 mb-3">
  If left empty, AI will automatically generate a description on save.
</p>



<label className="flex items-center justify-center gap-2 border p-3 rounded-lg cursor-pointer mb-3">

<Upload size={18}/>

Choose Photo

<input
type="file"
onChange={handleImageChange}
className="hidden"
/>

</label>



{imagePreview&&(

<div className="flex justify-center mb-3">

<div className="relative w-32 h-32 border rounded-lg overflow-hidden">

<Image
src={imagePreview}
alt="preview"
fill
className="object-cover"
/>

</div>

</div>

)}




<div className="flex gap-3 justify-end">


<button
onClick={()=>setEditing(null)}
className="border px-4 py-2 rounded-lg"
>
Cancel
</button>


<button
onClick={handleEditSave}
className="bg-green-600 text-white px-4 py-2 rounded-lg"
>
Save
</button>


</div>



</motion.div>


</motion.div>

)}

</AnimatePresence>



</section>

);

}