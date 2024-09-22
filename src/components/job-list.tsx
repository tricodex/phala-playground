import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types";

interface JobListProps {
  jobs: Job[];
  selectedJob: Job | null;
  onJobSelect: (job: Job) => void;
}

export function JobList({ jobs, selectedJob, onJobSelect }: JobListProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Job List</CardTitle>
        <CardDescription>View and manage your service requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Select onValueChange={(value) => onJobSelect(jobs.find(job => job.id === value) as Job)} value={selectedJob?.id}>
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
            <p>{selectedJob.requirements}</p>
            <h4 className="font-semibold mt-2">Escrow Amount:</h4>
            <p>{selectedJob.escrowAmount.toString()} xDAI</p>
            <h4 className="font-semibold mt-2">Requester:</h4>
            <p>{selectedJob.requester}</p>
            <h4 className="font-semibold mt-2">Worker:</h4>
            <p>{selectedJob.worker === '0x0000000000000000000000000000000000000000' ? 'Not assigned' : selectedJob.worker}</p>
            {selectedJob.content && (
              <>
                <h4 className="font-semibold mt-2">Submitted Content:</h4>
                <p>{selectedJob.content}</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
