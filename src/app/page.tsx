// src/app/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

const jobOfferings = [
  {
    title: 'Professional Resume Writing',
    description: 'Craft a standout resume that highlights your skills and experience.',
    image: '/1.webp',
    price: '$50'
  },
  {
    title: 'SEO-Optimized Blog Post',
    description: 'Create engaging, keyword-rich content to boost your website\'s visibility.',
    image: '/2.webp',
    price: '$30'
  },
  {
    title: 'Social Media Content Package',
    description: 'Develop a week\'s worth of captivating posts for your social platforms.',
    image: '/3.webp',
    price: '$75'
  },
  {
    title: 'Product Description Writing',
    description: 'Compose compelling product descriptions that drive sales.',
    image: '/4.webp',
    price: '$20'
  }
];

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/service-marketplace');
    }
  }, [status, router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('worldcoin', { callbackUrl: '/marketplace' });
    setIsLoading(false);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <h1>Web3 Freelance Marketplace</h1>
        <p>Connect, Create, and Verify with AI-Powered Trust</p>
        <Button onClick={handleSignIn} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in with World ID'}        
          <Image className='logo-image ml-2'src="/worldcoin-org-wld-logo.svg" alt="World Coin Logo" width="16" height="16"/>
        </Button>
      </div>
      <div className="landing-job-offerings">
        <h2>Featured Services</h2>
        <div className="landing-job-grid">
          {jobOfferings.map((job, index) => (
            <Card key={index} className="landing-job-card">
              <CardHeader>
                <div className="landing-job-image" style={{backgroundImage: `url(${job.image})`}}></div>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.price}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{job.description}</p>
              </CardContent>
              <CardFooter>
                <Button disabled>View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}