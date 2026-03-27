//build on 24 feb 2026
"use server";

import { auth } from "@clerk/nextjs/server";

export async function getJobOpportunities(role) {

   // check user authentication
   const { userId } = await auth();
   if (!userId) throw new Error("Unauthorized");

   // create API URL dynamically
   const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(role)}&page=1&num_pages=1`;

   try {

      const response = await fetch(url, {
         method: "GET",
         headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
         },
      });

      const data = await response.json();

      return data.data || [];

   } catch (error) {

      console.error("Error fetching jobs:", error);
      return [];

   }
}