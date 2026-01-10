export interface Cron {
    jobid: number;
    schedule: string;
    command: string;
    nodename: string;
    nodeport: number;
    database: string;
    username: string;
    active: boolean;
    jobname: string;
}
