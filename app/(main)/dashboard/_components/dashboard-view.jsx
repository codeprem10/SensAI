"use client";
import {Brain, Briefcase, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react' // ⭐ UPDATED BY CHATGPT ON 24 FEB 2026
import {formatDistanceToNow , format} from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';


const DashboardView = ({insights}) => {
  // ⭐ UPDATED BY CHATGPT ON 24 FEB 2026
    const [jobs, setJobs] = useState([]);


    // ⭐ UPDATED BY CHATGPT ON 24 FEB 2026
useEffect(() => {

    async function fetchJobs() {
        try {
            const res = await fetch(`/api/jobs?role=${insights.industry}`);
            const data = await res.json();
            setJobs(data);
        } catch (error) {
            console.error(error);
        }
    }

    fetchJobs();

}, []);

////////////////////////////////////////////////
    const salaryData = insights.salaryRanges.map((range)=>({
        name:range.role,
        min:range.min/1000,
        max:range.max/1000,
        median : range.median/1000,
    }));

    const getDemandLevelColor = (level) =>{
        switch (level.toLowerCase()){
            case "high":
                return "bg-green-500";
            case "medium":
                return "bg-yellow-500";
            case "low":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

     const getMarketOutlookInfo = (outlook) =>{
        switch (outlook.toLowerCase()){
            case "positive":
                return {icon:TrendingUp , color:"text-green-500"};
            case "neutral":
                return {icon:LineChart , color:"text-yellow-500"};
            case "negative":
                return {icon:TrendingDown , color:"text-red-500"};
            default:
                return {icon:LineChart , color:"text-gray-500"};
        }
    };

    const OutLookIcon = getMarketOutlookInfo(insights.marketOutlook).icon;
    const outLookColor = getMarketOutlookInfo(insights.marketOutlook).color;

    const lastUpdatedDate = format(new Date(insights.lastUpdated) , "dd/MM/yyyy");
    const nextUpdateDistance = formatDistanceToNow(
        new Date(insights.nextUpdate),
        {addSuffix:true}
    );
    
  return (
    <div className='space-y-6'>
        <div className='flex , justify-between items-center'>
            <Badge variant = "outline">Last Updated : {lastUpdatedDate}</Badge>
        </div>

         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                     <CardTitle className="text-sm font-medium">Market Outlook</CardTitle>
                     <OutLookIcon  className={`h-4 w-4 ${outLookColor}`}/>
                 </CardHeader>
                 <CardContent>
                      <div className='text-2xl font-bold'>{insights.marketOutlook}</div>
                              <p className='text-xs text-muted-foreground'>
                                 Next update {nextUpdateDistance}</p>
                </CardContent>
 
             </Card>


             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                     <CardTitle className="text-sm font-medium">Industry growth</CardTitle>
                     <TrendingUp  className={`h-4 w-4 ${outLookColor}`}/>
                 </CardHeader>
                 <CardContent>
                      <div className='text-2xl font-bold'>{insights.growthRate.toFixed(1)}%</div>
                      <Progress value={insights.growthRate} className="mt-2"/>
                              <p className='text-xs text-muted-foreground'>
                                 Next update {nextUpdateDistance}</p>
                </CardContent>
 
             </Card>


             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                     <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
                     <Briefcase className='h-4 w-4 text-muted-foreground'/>
                 </CardHeader>
                 <CardContent>
                      <div className='text-2xl font-bold'>{insights.demandLevel}</div>
                      <div 
                      className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(insights.demandLevel)}`}/>
                            
                </CardContent>
 
             </Card>


             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                     <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
                     <Brain className='h-4 w-4 text-muted-foreground'/>
                 </CardHeader>
                 <CardContent>
                      <div className='flex flex-wrap gap-2'>
                        {insights.topSkills.map((skill)=>(
                            <Badge key={skill} variant="secondary">
                                {skill}
                            </Badge>
                        )
                    )}</div>
                              
                </CardContent>
 
             </Card>

             </div>

              {/* bar graphs */}
             <Card>
                <CardHeader >
                     <CardTitle >Salary ranges by Role</CardTitle>
                     <CardDescription>
                        Displaying minimum , median and  maximum salaries (in thousands)
                     </CardDescription>
                     
                 </CardHeader>
                 <CardContent>
                    <div className='h-[400px]'>
                         <ResponsiveContainer width="100%" height="100%">
      <BarChart
        
        data={salaryData}
        
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={({active , payload , label})=>{
                if(active && payload && payload.length){
                     return (
                        <div className="bg-background border rounded-lg p-2 shadow-md">
                          <p className="font-medium">{label}</p>
                          {payload.map((item) => (
                            <p key={item.name} className="text-sm">
                              {item.name}: ${item.value}K
                            </p>
                          ))}
                        </div>
                      );
                }
                return null;
        }}/>
        
        <Bar dataKey="min" fill="#94a3b8" name="Min Salary (K)" />
        <Bar dataKey="median" fill="#64748b" name="Median Salary (K)" />
        <Bar dataKey="max" fill="#475569" name="Max Salary (K)" />
      </BarChart>
    </ResponsiveContainer>
                    </div>
                     
                              
                </CardContent>
 
             </Card>

             {/* Industry Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Industry Trends</CardTitle>
            <CardDescription>
              Current trends shaping the industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {insights.keyTrends.map((trend, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
            <CardDescription>Skills to consider developing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.recommendedSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>


        {/* ⭐ UPDATED BY CHATGPT ON 24 FEB 2026 */}
<Card>
  <CardHeader>
    <CardTitle>🔥 Job Opportunities</CardTitle>
  </CardHeader>

  <CardContent>

    {jobs.length === 0 && (
      <p className="text-sm text-muted-foreground">Loading jobs...</p>
    )}

    {jobs.slice(0,6).map(job => (
      <div key={job.job_id} className="border p-3 rounded-lg mb-3">

        <h3 className="font-semibold">{job.job_title}</h3>

        <p className="text-sm text-muted-foreground">
          {job.employer_name}
        </p>

        <a
          href={job.job_apply_link}
          target="_blank"
          className="text-blue-500 text-sm"
        >
          Apply →
        </a>

      </div>
    ))}

  </CardContent>
</Card>

      </div>

    </div>
  )
}

export default DashboardView





