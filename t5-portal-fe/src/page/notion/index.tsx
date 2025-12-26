import React from "react";

export const NotionPage: React.FC = () => {
    return (
        <div style={{ height: "calc(100vh - 64px)", width: "100%", overflow: "hidden" }}>
            <iframe
                src="https://notion.so"
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                }}
                title="Notion"
            />
        </div>
    );
};
