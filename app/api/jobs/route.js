import { auth } from "@clerk/nextjs/server";

export async function GET(request) {

   const { userId } = await auth();

   if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
   }

   const { searchParams } = new URL(request.url);
   const role = searchParams.get("role") || "developer";

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

      console.log("API RESPONSE:", data); // debug log

      return Response.json(data.data || []);

   } catch (error) {

      console.error(error);

      return Response.json([], { status: 500 });

   }
}