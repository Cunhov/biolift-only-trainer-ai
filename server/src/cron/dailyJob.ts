import cron from 'node-cron';

export const startCronJobs = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', () => {
        console.log(`[${new Date().toISOString()}] Running daily maintenance task...`);
        // Add maintenance logic here, e.g., cleaning up old temp files, sending reminders, etc.
        // For now, just a log to prove it works.
    });

    console.log('Cron jobs scheduled.');
};
