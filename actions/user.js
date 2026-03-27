'use server';


import {db} from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server";
import { Select } from "@radix-ui/react-select";
import { generateAIinsights } from "./dashboard";

//to find user
export async function updateUser(data){
    const {userId} = await auth();
    if(!userId) throw new Error('Unauthorized');

//to find user in db
const user = await db.user.findUnique({
    where:{
        clerkUserId : userId,
    }
});
 if(!user) throw new Error('user not found');

 //connection to database
 try {
    const result = await db.$transaction( 
        //3 api calls :
        async(tx)=>{ 
            //1.find if industry exists
            let industryInsight = await tx.industryInsight.findUnique({
                where: {
                    industry : data.industry,
                }
            });
    //2.if industry does not exists , fill it with default values - later use ai to fill those values
    if(!industryInsight){

        // This is replaced by AI
        // industryInsight = await tx.industryInsight.create({
        //     data : {
        //         industry : data.industry,
        //         salaryRanges : [],
        //         growthRate : 0 ,
        //         demandLevel :'MEDIUM',
        //         topSkills :  [],
        //         marketOutLook  : 'NEUTRAL',
        //         keyTrends : [],
        //         recommendedSkills :[],
        //         nextUpdate : new Date(Date.now() + 7*24*60*60*1000)
        //     }
        // })

        // AI -generated:
         const insights = await generateAIinsights(data.industry);
        
             industryInsight = await db.industryInsight.create({
                    data:{
                        industry:data.industry,
                        ...insights,
                        nextUpdate:new Date(Date.now() + 7*24*60*60*1000),
                    }
        });
    }    
    //3.update the user
    const updatedUser = await tx.user.update({
        where:{
            id:user.id,
        } , 
        data:{
            industry:data.industry,
            experience : data.experience,
            bio : data.bio,
            skills : data.skills,
        }
    });

   return {updatedUser , industryInsight};
    } ,
     {
        timeout:10000,
    }
);
 

return {success:true , ...result};    
 } catch (error) {
    console.error("Error updating user and industry: " , error.message);
    throw new Error("Error updating profile" + error.message);
 }
}



export async function getUserOnboardingStatus(data){
    const {userId} = await auth();
    if(!userId) throw new Error('Unauthorized');

 try {
    const user = await db.user.findUnique({
        where:{
        clerkUserId : userId,
    },
        select:{
            industry : true,
        }
       })

       if(!user) throw new Error('user not found');

       //it will return true if user is onboarded or false if user not onboarded
       return {
        isOnboarded : !!user?.industry
       }
 } catch (error) {
    console.error("Error checking onboarding status: " , error.message);
    throw new Error("Failed to check onboarding status");
 }
}