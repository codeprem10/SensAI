
//build on 24 feb 2026
import { getJobOpportunities } from "@/actions/job";

export default async function JobOpportunities({ role }) {

   // call backend server action
   const jobs = await getJobOpportunities(role);

   return (

      <div className="mt-8">

         <h2 className="text-2xl font-bold mb-4">
            🔥 Job Opportunities
         </h2>

         <div className="grid md:grid-cols-2 gap-4">

            {jobs.slice(0,6).map((job) => (

               <div
                  key={job.job_id}
                  className="border rounded-xl p-4 shadow hover:shadow-lg transition"
               >

                  <h3 className="text-lg font-semibold">
                     {job.job_title}
                  </h3>

                  <p className="text-sm text-gray-600">
                     {job.employer_name}
                  </p>

                  <p className="text-sm text-gray-500">
                     📍 {job.job_city || "Location not specified"}
                  </p>

                  <a
                     href={job.job_apply_link}
                     target="_blank"
                     className="text-blue-600 mt-2 inline-block"
                  >
                     Apply Now →
                  </a>

               </div>

            ))}

         </div>

      </div>
   );
}