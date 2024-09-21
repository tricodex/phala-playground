import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types";


interface JobListProps {
  jobs: Job[];
  selectedJob: string;
  onJobSelect: (jobId: string) => void;
}

export function JobList({ jobs, selectedJob, onJobSelect }: JobListProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Your Requests</CardTitle>
        <CardDescription>View and manage your service requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Select onValueChange={onJobSelect} value={selectedJob}>
          <SelectTrigger>
            <SelectValue placeholder="Select a job" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map(job => (
              <SelectItem key={job.id} value={job.id}>
                Job {job.id} - <Badge variant={job.status === 'completed' ? 'default' : 'outline'}>{job.status}</Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedJob && (
          <div className="mt-4">
            <h4 className="font-semibold">Requirements:</h4>
            <p>{jobs.find(job => job.id === selectedJob)?.requirements}</p>
            <h4 className="font-semibold mt-2">Escrow Amount:</h4>
            <p>{jobs.find(job => job.id === selectedJob)?.escrowAmount} ETH</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}