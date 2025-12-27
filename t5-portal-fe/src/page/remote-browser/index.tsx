import React from "react";
import { Card, Switch } from "antd";

export const RemoteBrowser: React.FC = () => {
    const [showUI, setShowUI] = React.useState(true);

    return (
        <Card
            title="Remote Browser"
            extra={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Show UI</span>
                    <Switch checked={showUI} onChange={setShowUI} />
                </div>
            }
            bodyStyle={{ padding: 0, height: "calc(100vh - 128px)" }}
        >
            <iframe
                src={`http://localhost:8080/${showUI ? "" : "?embed=1"}`}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                }}
                title="Remote Browser"
                allow="clipboard-read; clipboard-write; microphone; camera; display-capture; autoplay; fullscreen; payment; geolocation;"
            />
        </Card>
    );
};
