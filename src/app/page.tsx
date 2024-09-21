'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const jobOfferings = [
  {
    title: 'Professional Resume Writing',
    description: 'Craft a standout resume that highlights your skills and experience.',
    image: '/1.webp',
    price: '0.05 ETH'
  },
  {
    title: 'SEO-Optimized Blog Post',
    description: 'Create engaging, keyword-rich content to boost your website\'s visibility.',
    image: '/2.webp',
    price: '0.03 ETH'
  },
  {
    title: 'Social Media Content Package',
    description: 'Develop a week\'s worth of captivating posts for your social platforms.',
    image: '/3.webp',
    price: '0.08 ETH'
  },
  {
    title: 'Product Description Writing',
    description: 'Compose compelling product descriptions that drive sales.',
    image: '/4.webp',
    price: '0.02 ETH'
  }
];

export default function Home() {
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
    return <div className="landing-loading">Loading...</div>;
  }

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="landing-logo">
          <Image src="/logo.svg" alt="3er Logo" width={50} height={50} className="landing-logo-image" />
          <h1 className="landing-title">Web</h1><h1 className="logo-text">3er</h1><h1 className="landing-title">Freelance Marketplace</h1>
        </div>
        <p className="landing-subtitle">
          Connect, Create, and Verify with AI-Powered Trust
        </p>
        <Button onClick={handleSignIn} disabled={isLoading} className="landing-signin-button">
          {isLoading ? 'Signing in...' : 'Sign in with World ID'}
          <Image src="/worldcoin-org-wld-logo.svg" alt="World Coin Logo" width={24} height={24} className="landing-worldcoin-logo" />
        </Button>
      </div>
      <div className="landing-job-offerings">
        <h2 className="landing-section-title">Featured Services</h2>
        <div className="landing-job-grid">
          {jobOfferings.map((job, index) => (
            <Card key={index} className="landing-job-card">
              <CardHeader>
                <div className="landing-job-image" style={{backgroundImage: `url(${job.image})`}}></div>
                <CardTitle className="landing-job-title">{job.title}</CardTitle>
                <Badge variant="secondary" className="landing-job-price">{job.price}</Badge>
              </CardHeader>
              <CardContent>
                <p className="landing-job-description">{job.description}</p>
              </CardContent>
              <CardFooter>
                <Button className="landing-job-button">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}