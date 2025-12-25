import { KBarProvider } from "kbar";

export const KBarProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    const actions = [
        {
            id: "blog",
            name: "Blog",
            shortcut: ["b"],
            keywords: "writing words",
            perform: () => (window.location.pathname = "blog"),
        },
        {
            id: "contact",
            name: "Contact",
            shortcut: ["c"],
            keywords: "email",
            perform: () => (window.location.pathname = "contact"),
        },
    ]


    return (
        <KBarProvider>
            {children}
        </KBarProvider>
    );
};