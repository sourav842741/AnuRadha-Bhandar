import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";

interface IGrocery {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  quantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ICartSlice {
  cartData: IGrocery[];
  subtotal: number;
  deliveryFee: number;
  finalTotal: number;
}

/* ✅ Load Cart From LocalStorage */

const loadCart = () => {

 if(typeof window !== "undefined"){

  const cart = localStorage.getItem("cart");

  return cart ? JSON.parse(cart) : [];

 }

 return [];

};


/* ✅ Calculate Initial Totals */

const cartFromStorage = loadCart();

const initialSubtotal = cartFromStorage.reduce(

 (sum:any,item:any)=> sum + item.price*(item.quantity || 1),

 0

);

const initialDelivery = initialSubtotal >=100 ? 0 : 20;


/* ✅ Initial State */

const initialState: ICartSlice = {

 cartData: cartFromStorage,

 subtotal: initialSubtotal,

 deliveryFee: initialDelivery,

 finalTotal: initialSubtotal + initialDelivery

};


const cartSlice = createSlice({

 name:"cartSlice",

 initialState,

 reducers:{


/* 🟢 ADD ITEM */

addToCart:(state,action:PayloadAction<IGrocery>)=>{

 const existingItem = state.cartData.find(

 (item)=>item._id?.toString()===action.payload._id?.toString()

 );

 if(existingItem){

 existingItem.quantity=(existingItem.quantity||1)+1

 }
 else{

 state.cartData.push({...action.payload,quantity:1})

 }

 localStorage.setItem("cart",JSON.stringify(state.cartData))

 cartSlice.caseReducers.calculateTotals(state)

},



/* 🔴 REMOVE ITEM */

removeFromCart:(state,action:PayloadAction<string>)=>{

 state.cartData = state.cartData.filter(

 (item)=>item._id?.toString()!==action.payload

 )

 localStorage.setItem("cart",JSON.stringify(state.cartData))

 cartSlice.caseReducers.calculateTotals(state)

},



/* 🔼 INCREASE */

increaseQuantity:(state,action:PayloadAction<string>)=>{

 const item = state.cartData.find(

 (item)=>item._id?.toString()===action.payload

 )

 if(item){

 item.quantity=(item.quantity||1)+1

 }

 localStorage.setItem("cart",JSON.stringify(state.cartData))

 cartSlice.caseReducers.calculateTotals(state)

},



/* 🔽 DECREASE */

decreaseQuantity:(state,action:PayloadAction<string>)=>{

 const item = state.cartData.find(

 (item)=>item._id?.toString()===action.payload

 )

 if(item && item.quantity && item.quantity>1){

 item.quantity-=1

 }
 else{

 state.cartData = state.cartData.filter(

 (cartItem)=>cartItem._id?.toString()!==action.payload

 )

 }

 localStorage.setItem("cart",JSON.stringify(state.cartData))

 cartSlice.caseReducers.calculateTotals(state)

},



/* 🧹 CLEAR CART */

clearCart:(state)=>{

 state.cartData=[]

 state.subtotal=0

 state.deliveryFee=10

 state.finalTotal=10

 localStorage.removeItem("cart")

},



/* 🧮 CALCULATE TOTAL */

calculateTotals:(state)=>{

 state.subtotal = state.cartData.reduce(

 (sum,item)=> sum + item.price*(item.quantity||1),

 0

 )

 state.deliveryFee = state.subtotal>=100 ? 0 : 20

 state.finalTotal = state.subtotal + state.deliveryFee

}

}

})


export const {

addToCart,
removeFromCart,
increaseQuantity,
decreaseQuantity,
clearCart,
calculateTotals

}=cartSlice.actions


export default cartSlice.reducer