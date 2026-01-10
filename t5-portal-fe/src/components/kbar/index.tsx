import {
    useRegisterActions,
} from "@refinedev/kbar";
import React, { useState } from "react";
import { TrackBreakTaskModal } from "../modals/track-break-task";
import { QuickLogModal } from "../modals/quick-log-modal";

export const KBarProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
    const [isQuickLogModalOpen, setIsQuickLogModalOpen] = useState(false);

    const actions = [
        {
            id: "track_break_task",
            name: "Track Break Task",
            shortcut: ["b"],
            keywords: "track break task pause",
            section: "Quick Actions",
            perform: () => {
                setIsBreakModalOpen(true);
            },
        },
        {
            id: "quick_log",
            name: "Quick Log",
            shortcut: ["q"],
            keywords: "quick log task time",
            section: "Quick Actions",
            perform: () => {
                setIsQuickLogModalOpen(true);
            },
        },
    ];

    useRegisterActions(actions, []);

    return (
        <>
            {children}
            <TrackBreakTaskModal
                open={isBreakModalOpen}
                onClose={() => setIsBreakModalOpen(false)}
            />
            <QuickLogModal
                open={isQuickLogModalOpen}
                onClose={() => setIsQuickLogModalOpen(false)}
            />
        </>
    );
};