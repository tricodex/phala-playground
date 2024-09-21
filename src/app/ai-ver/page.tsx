// app/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Define the type for verificationResult
type VerificationResult = {
  isValid: boolean;
  reason: string;
  timestamp: string;
  contentHash: string;
};

export default function Home() {
  const [step, setStep] = useState(1)
  const [requirements, setRequirements] = useState('')
  const [content, setContent] = useState('')
  const [requestId, setRequestId] = useState('')
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)

  const handleCreateRequest = async () => {
    const res = await fetch('/api/phala-ai-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createRequest', data: { requirements } }),
    })
    const data = await res.json()
    setRequestId(data.requestId)
    setStep(2)
  }

  const handleSubmitContent = async () => {
    await fetch('/api/phala-ai-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submitContent', data: { requestId, content } }),
    })
    setStep(3)
  }

  const handleVerifyContent = async () => {
    const res = await fetch('/api/phala-ai-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verifyContent', data: { requestId } }),
    })
    const data: VerificationResult = await res.json()
    setVerificationResult(data)
    setStep(4)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Verification Playground</h1>
      
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Create Request</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="mb-4"
            />
            <Button onClick={handleCreateRequest}>Create Request</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Submit Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-4"
            />
            <Button onClick={handleSubmitContent}>Submit Content</Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Verify Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleVerifyContent}>Verify Content</Button>
          </CardContent>
        </Card>
      )}

      {step === 4 && verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle>Is Valid: {verificationResult.isValid ? 'Yes' : 'No'}</AlertTitle>
              <AlertDescription>{verificationResult.reason}</AlertDescription>
            </Alert>
            <pre className="mt-4 p-4 bg-gray-100 rounded">
              {JSON.stringify(verificationResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}