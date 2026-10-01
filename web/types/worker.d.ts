declare module '@autososmed/worker' {
  export interface RunJobOptions {
    dryRun?: boolean;
  }

  export interface RunJobResult {
    success: boolean;
    jobId: string;
    screenshotPath?: string;
    postUrl?: string;
    error?: string;
    simulated?: boolean;
  }

  export function runJob(jobId: string, options?: RunJobOptions): Promise<RunJobResult>;
}
