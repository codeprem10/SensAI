import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from './ui/button';
import { ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, StarsIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { checkUser } from '@/lib/checkUser';

const Header = async() => {

  await checkUser();
  return (
    <header className='top-0 w-full fixed border-b bg-background/80 backdrop-blur-md z-50 
    supports-[backdrop-filter]:bg-background/60 '>
      <nav className='w-full px-4 flex h-16 items-center justify-between'>

        <Link href='/'>
        <Image
          src="/logo.png" alt="Sensai logo" width={200} height={60}
          className="h-12 py-1 w-auto object-contain"
          />
        </Link>


        <div className='items-center space-x-2 flex md:space-x-4'>
          <SignedIn>
            <Link href={"/dashboard"}>
            <Button variant="outline">
              <LayoutDashboard className='h-4 w-4'/>
              <span className='hidden md:block'>Industry Insights</span>
            </Button>
            </Link>
          

          {/* dropdown menu */}
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button>
              <StarsIcon className='h-4 w-4'/>
              <span className='hidden md:block'>Growth Tools</span>
              <ChevronDown className='h-4 w-4' />
            </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent>
        <DropdownMenuItem>
          <Link  href={"/resume"} className='flex items-center gap-2'>
              <FileText className='h-4 w-4'/>
              <span>Build Resume</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link  href={"/ai-cover-letter"} className='flex items-center gap-2'>
              <PenBox className='h-4 w-4'/>
              Cover Letter
          </Link>
          </DropdownMenuItem>
        <DropdownMenuItem>
          <Link  href={"/interview"} className='flex items-center gap-2'>
              <GraduationCap className='h-4 w-4'/>
              Interview
          </Link>
        </DropdownMenuItem>
      
        </DropdownMenuContent>
      </DropdownMenu>
    </SignedIn>
            <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
            <SignedIn>
              <UserButton 
              appearance={{
                elements:{
                  avatarBox:"w-10 h-10",
                  userButtonPopoverCard:"shadow-x1",
                  userPreviewMainIdentifier:"font-semibold",
                },
              }}
              afterSignOutUrl='/'
              />
            </SignedIn>
        </div>

      </nav>

          
      
    </header>
  );
};

export default Header;
