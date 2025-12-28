import { KBarProvider } from "kbar";
import { useState } from "react";
import { TrackBreakTaskModal } from "../modals/track-break-task";

export const KBarProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);

    const actions = [
        {
            id: "track_break_task",
            name: "Track Break Task",
            shortcut: ["b"],
            keywords: "track break task",
            perform: () => {
                setIsBreakModalOpen(true);
            },
        },
    ]


    return (
        <KBarProvider actions={actions}>
            {children}
            <TrackBreakTaskModal
                open={isBreakModalOpen}
                onClose={() => setIsBreakModalOpen(false)}
            />
        </KBarProvider>
    );
};