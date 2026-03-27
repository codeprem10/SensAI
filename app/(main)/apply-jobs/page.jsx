// app/(main)/apply-jobs/page.jsx

import JobList from "@/components/job-list"; // we will create next

export default function ApplyJobsPage() {

   return (
      <div className="container mx-auto p-4 space-y-4">

         <h1 className="text-2xl font-bold">
            🔥 Apply For Jobs
         </h1>

         <JobList />

      </div>
   );
}