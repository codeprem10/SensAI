import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" ,
     name:'sensai', 
    credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});
