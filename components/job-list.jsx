"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JobList() {

   const [jobs, setJobs] = useState([]);

   useEffect(() => {

      async function fetchJobs() {

         const res = await fetch(`/api/jobs?role=developer`);
         const data = await res.json();

         setJobs(data);
      }

      fetchJobs();

   }, []);

  return (

  <Card className="p-6 space-y-6">

    {/* ⭐ PREMIUM SECTION HEADER */}
    <div className="flex justify-between items-center">

      <div>
        <h2 className="text-2xl font-bold">
          🔥 Job Opportunities
        </h2>
        <p className="text-sm text-muted-foreground">
          Explore latest roles based on your selected industry
        </p>
      </div>

      <span className="text-sm bg-muted px-3 py-1 rounded-full">
        {jobs.length} Jobs
      </span>

    </div>

    {/* ⭐ JOB LIST */}
    <div className="space-y-4">

      {jobs.map((job) => (

        <Card 
          key={job.job_id} 
          className="hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
        >

          <CardContent className="flex justify-between items-center">

            {/* LEFT SIDE */}
            <div className="flex gap-4">

              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                🏢
              </div>

              <div>

                <h3 className="font-semibold text-lg">
                  {job.job_title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {job.employer_name}
                </p>

                <div className="flex gap-2 mt-2">

                  {job.job_employment_type && (
                    <span className="text-xs bg-muted px-2 py-1 rounded-md">
                      {job.job_employment_type}
                    </span>
                  )}

                  {job.job_city && (
                    <span className="text-xs border px-2 py-1 rounded-md">
                      {job.job_city}
                    </span>
                  )}

                </div>

              </div>
            </div>

            {/* RIGHT SIDE */}
            <a href={job.job_apply_link} target="_blank">
              <button className="bg-primary text-white px-4 py-2 rounded-md hover:opacity-90 transition">
                Apply Now →
              </button>
            </a>

          </CardContent>

        </Card>

      ))}

    </div>

  </Card>
);
}