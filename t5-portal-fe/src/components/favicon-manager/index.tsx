import React, { useEffect } from "react";
import { useList } from "@refinedev/core";
import { TimeEntry } from "interfaces";

const DEFAULT_FAVICON = "/favicon.ico";
// Simple red circle SVG
const ACTIVE_FAVICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ff0000' /%3E%3C/svg%3E`;

export const FaviconManager: React.FC = () => {
    const { query } = useList<TimeEntry>({
        resource: 'time_entries',
        filters: [
            { field: 'end_time', operator: 'null', value: null },
        ],
        pagination: {
            mode: "off",
        },
        liveMode: "auto",
        queryOptions: {
            refetchInterval: 30000, // Sync every 30s just in case, though mutations should invalidate
        }
    });

    const activeTimeEntries = query.data;

    const isTracking = (activeTimeEntries?.data?.length ?? 0) > 0;

    useEffect(() => {
        const link: HTMLLinkElement = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';

        if (isTracking) {
            // For SVG data URI, type should technically be image/svg+xml but browsers are lenient.
            // Let's stick to standard behavior replace.
            if (ACTIVE_FAVICON.startsWith('data:image/svg+xml')) {
                link.type = 'image/svg+xml';
            }
            link.href = ACTIVE_FAVICON;
        } else {
            link.type = 'image/x-icon';
            link.href = DEFAULT_FAVICON;
        }

        document.getElementsByTagName('head')[0].appendChild(link);

        return () => {
            // Cleanup not strictly necessary as we want it persistent, but good practice if component unmounts
            // verify if we should revert on unmount? probably yes.
            // link.href = DEFAULT_FAVICON; 
        };
    }, [isTracking]);

    return null;
};
