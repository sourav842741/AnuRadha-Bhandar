"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useSession } from "next-auth/react";

import { AppDispatch, RootState } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";

export const useGetMe = () => {

  const dispatch = useDispatch<AppDispatch>();

  const { userData } = useSelector(
    (state: RootState) => state.user
  );

  const { status } = useSession(); // ⭐ important

  useEffect(() => {

    const fetchUser = async () => {

      try {

        const res = await axios.get("/api/user/me");

        dispatch(setUserData(res.data));

        console.log("User:", res.data);

      } catch (error:any) {

        console.log("GetMe Error:", error.response?.data || error.message);

      }

    };

    // ⭐ session ready hone ke baad hi call karo
    if (status === "authenticated" && !userData) {
      fetchUser();
    }

  }, [dispatch, userData, status]);

  return userData;
};