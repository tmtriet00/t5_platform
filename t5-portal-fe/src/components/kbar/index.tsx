import {
    useRegisterActions,
} from "@refinedev/kbar";
import React, { useState } from "react";
import { TrackBreakTaskModal } from "../modals/track-break-task";

export const KBarProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);

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
    ];

    useRegisterActions(actions, []);

    return (
        <>
            {children}
            <TrackBreakTaskModal
                open={isBreakModalOpen}
                onClose={() => setIsBreakModalOpen(false)}
            />
        </>
    );
};