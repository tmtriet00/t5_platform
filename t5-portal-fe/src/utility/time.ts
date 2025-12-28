
import dayjs from "dayjs";

// Helper function to format duration in hours:minutes
export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to calculate duration between two timestamps
export const calculateDuration = (startTime: string, endTime: string | null): number => {
    if (!endTime) return 0; // Running timer, no duration yet
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return end - start;
};

// Helper function to format time for display (e.g., "1:00 PM")
export const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Helper function to get date label (Today, Yesterday, or date)
export const getDateLabel = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === yesterday.getTime()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getRemainingTimeDayJS = (zone: string) => {
    try {
        const now = dayjs().tz(zone);
        const endOfDay = now.endOf('day');

        // Diff in milliseconds
        const diffMs = endOfDay.diff(now);

        return Math.floor(diffMs / 1000);
    } catch (error) {
        console.error('Error getting remaining time:', error);
        return 0;
    }
}