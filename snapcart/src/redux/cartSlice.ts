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
  discount: number;
  couponCode: string;
  minOrderAmount: number;   // ✅ ADDED
  finalTotal: number;
}

/* ✅ Load Cart */

const loadCart = () => {
  if (typeof window !== "undefined") {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

/* ✅ Load Coupon */

const loadCoupon = () => {
  if (typeof window !== "undefined") {
    const coupon = localStorage.getItem("coupon");
    return coupon
      ? JSON.parse(coupon)
      : { couponCode: "", discount: 0, minOrderAmount: 0 };
  }
  return { couponCode: "", discount: 0, minOrderAmount: 0 };
};

const cartFromStorage = loadCart();
const couponFromStorage = loadCoupon();

/* ✅ Initial Totals */

const initialSubtotal = cartFromStorage.reduce(
  (sum: any, item: any) => sum + item.price * (item.quantity || 1),
  0
);

const initialDelivery = initialSubtotal >= 100 ? 0 : 20;

/* ✅ Initial State */

const initialState: ICartSlice = {
  cartData: cartFromStorage,
  subtotal: initialSubtotal,
  deliveryFee: initialDelivery,
  discount: couponFromStorage.discount,
  couponCode: couponFromStorage.couponCode,
  minOrderAmount: couponFromStorage.minOrderAmount || 0, // ✅ ADDED
  finalTotal: Number(
    (
      initialSubtotal +
      initialDelivery -
      couponFromStorage.discount
    ).toFixed(2)
  ),
};

const cartSlice = createSlice({
  name: "cartSlice",
  initialState,

  reducers: {

    /* 🟢 ADD ITEM */
    addToCart: (state, action: PayloadAction<IGrocery>) => {
      const existingItem = state.cartData.find(
        (item) =>
          item._id?.toString() === action.payload._id?.toString()
      );

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        state.cartData.push({ ...action.payload, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(state.cartData));
      cartSlice.caseReducers.calculateTotals(state);
    },

    /* 🔴 REMOVE */
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartData = state.cartData.filter(
        (item) => item._id?.toString() !== action.payload
      );

      localStorage.setItem("cart", JSON.stringify(state.cartData));
      cartSlice.caseReducers.calculateTotals(state);
    },

    /* 🔼 INCREASE */
    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cartData.find(
        (item) => item._id?.toString() === action.payload
      );

      if (item) {
        item.quantity = (item.quantity || 1) + 1;
      }

      localStorage.setItem("cart", JSON.stringify(state.cartData));
      cartSlice.caseReducers.calculateTotals(state);
    },

    /* 🔽 DECREASE */
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cartData.find(
        (item) => item._id?.toString() === action.payload
      );

      if (item && item.quantity && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.cartData = state.cartData.filter(
          (cartItem) =>
            cartItem._id?.toString() !== action.payload
        );
      }

      localStorage.setItem("cart", JSON.stringify(state.cartData));
      cartSlice.caseReducers.calculateTotals(state);
    },

    /* 🎟️ SET COUPON */
    setCoupon: (
      state,
      action: PayloadAction<{
        code: string;
        discount: number;
        minOrderAmount: number;
      }>
    ) => {
      state.couponCode = action.payload.code;
      state.discount = action.payload.discount;
      state.minOrderAmount = action.payload.minOrderAmount;

      localStorage.setItem(
        "coupon",
        JSON.stringify({
          couponCode: state.couponCode,
          discount: state.discount,
          minOrderAmount: state.minOrderAmount,
        })
      );

      cartSlice.caseReducers.calculateTotals(state);
    },

    /* ❌ CLEAR COUPON */
    clearCoupon: (state) => {
      state.couponCode = "";
      state.discount = 0;
      state.minOrderAmount = 0;
      localStorage.removeItem("coupon");

      cartSlice.caseReducers.calculateTotals(state);
    },

    /* 🧹 CLEAR CART */
    clearCart: (state) => {
      state.cartData = [];
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.discount = 0;
      state.couponCode = "";
      state.minOrderAmount = 0;
      state.finalTotal = 0;

      localStorage.removeItem("cart");
      localStorage.removeItem("coupon");
    },

    /* 🧮 CALCULATE TOTAL */
    calculateTotals: (state) => {

  state.subtotal = state.cartData.reduce(
    (sum, item) =>
      sum + item.price * (item.quantity || 1),
    0
  );

  state.deliveryFee = state.subtotal >= 100 ? 0 : 20;

  /* 🔥 AUTO REMOVE COUPON IF BELOW OR EQUAL TO MIN ORDER */
  if (
    state.couponCode &&
    state.subtotal < state.minOrderAmount
  ) {
    state.couponCode = "";
    state.discount = 0;
    state.minOrderAmount = 0;
    localStorage.removeItem("coupon");
  }

  /* 🔥 SAFETY: Discount can never exceed subtotal */
  if (state.discount > state.subtotal) {
    state.discount = state.subtotal;
  }

  state.finalTotal = Number(
    (
      state.subtotal +
      state.deliveryFee -
      state.discount
    ).toFixed(2)
  );

  /* 🔥 SAFETY: Total can never be negative */
  if (state.finalTotal < 0) {
    state.finalTotal = 0;
  }
},
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  calculateTotals,
  setCoupon,
  clearCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;