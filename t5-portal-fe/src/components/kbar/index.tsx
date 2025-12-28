import { KBarProvider } from "kbar";

export const KBarProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    const actions = [
        {
            id: "track_break_task",
            name: "Track Break Task",
            shortcut: ["b"],
            keywords: "track break task",
            perform: () => async () => {

            },
        },
    ]


    return (
        <KBarProvider>
            {children}
        </KBarProvider>
    );
};