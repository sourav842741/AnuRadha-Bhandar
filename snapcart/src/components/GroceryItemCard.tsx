"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import {
addToCart,
increaseQuantity,
decreaseQuantity
} from "@/redux/cartSlice";

interface GroceryItemCardProps {

_id:string
name:string
price:string
mrp:string
image:string
category?:string
unit?:string

}

export default function GroceryItemCard({

_id,
name,
price,
mrp,
image,
category,
unit

}:GroceryItemCardProps){

const dispatch=useDispatch<AppDispatch>();

const cart=useSelector(
(state:RootState)=>state.cart.cartData
);

const cartItem=
cart.find((item)=>item._id?.toString()===_id);



const discount=

mrp && price

? Math.round(

((Number(mrp)-Number(price))/

Number(mrp))*100

)

:0;



return(

<motion.div

initial={{opacity:0,scale:0.9}}

whileInView={{opacity:1,scale:1}}

viewport={{once:false,amount:0.4}}

transition={{duration:0.3}}

whileHover={{scale:1.02}}

className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"

>


{/* Image */}

<div className="relative w-full aspect-4/3 bg-gray-50 overflow-hidden group">

<Image
src={image}
alt={name}
fill
sizes="(max-width:768px)100vw,25vw"
className="object-contain p-4"
/>

</div>



{/* Details */}

<div className="p-4 flex flex-col flex-1">


{category && (

<p className="text-xs text-gray-500 mb-1">

{category}

</p>

)}



<h3 className="text-lg font-semibold text-gray-800 line-clamp-1">

{name}

</h3>



{/* Flipkart Style Price */}

<div className="flex items-center justify-between mt-2">



{unit && (

<span className="text-xs bg-gray-100 px-2 py-1 rounded-full">

{unit}

</span>

)}



<div>



<span className="text-green-700 font-bold text-lg mr-2">

₹{price}

</span>



<span className="text-gray-500 line-through text-sm mr-1">

₹{mrp}

</span>



<span className="text-green-600 text-sm font-semibold">

{discount}% off

</span>



</div>



</div>



{/* Cart Button */}

{!cartItem?(

<button

onClick={()=>

dispatch(

addToCart({

_id: _id as any,

name,

price: Number(price),

image,

category:category||"",

unit:unit||""

})

)

}

className="mt-4 flex items-center justify-center gap-2 bg-green-600 text-white rounded-full py-2 text-sm"

>

<ShoppingCart size={18}/>

Add to Cart

</button>

)

:(

<div className="mt-4 flex items-center justify-center bg-green-50 border rounded-full py-2 px-4 gap-4">


<button

onClick={()=>

dispatch(decreaseQuantity(_id))

}

>

<Minus size={16}/>

</button>


<span>

{cartItem.quantity}

</span>



<button

onClick={()=>

dispatch(increaseQuantity(_id))

}

>

<Plus size={16}/>

</button>


</div>

)}



</div>

</motion.div>

)

}