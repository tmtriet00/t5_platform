import { UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Upload, Typography, App } from "antd";
import React, { useState } from "react";
import { useList } from "@refinedev/core";
import { Configuration } from "../../interfaces/model/configuration";

const { Title } = Typography;

export const SandboxPage: React.FC = () => {
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const { message } = App.useApp();

    const { query } = useList<Configuration>({
        resource: "configurations",
        filters: [
            {
                field: "config_key",
                operator: "eq",
                value: "SANDBOX_HTML",
            },
        ],
        queryOptions: {
            enabled: false,
        },
    });

    const { refetch, isFetching } = query;

    const handleLoadFromConfig = async () => {
        const { data: response } = await refetch();
        if (response?.data && response.data.length > 0) {
            setHtmlContent(response.data[0].config_value);
            message.success("Loaded from configuration");
        } else {
            message.error("Configuration SANDBOX_HTML not found");
        }
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === "string") {
                setHtmlContent(content);
                message.success("File loaded successfully");
            }
        };
        reader.onerror = () => {
            message.error("Failed to read file");
        };
        reader.readAsText(file);
        return false; // Prevent auto upload
    };

    const handleClear = () => {
        setHtmlContent(null);
    };

    return (
        <div style={{ padding: "24px" }}>
            <Title level={2}>HTML Sandbox</Title>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Upload HTML">
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            <Upload
                                beforeUpload={handleFileUpload}
                                showUploadList={false}
                                accept=".html,.htm"
                            >
                                <Button icon={<UploadOutlined />}>Upload HTML File</Button>
                            </Upload>
                            <Button
                                loading={isFetching}
                                onClick={handleLoadFromConfig}
                            >
                                Load from Config
                            </Button>
                            {htmlContent && (
                                <Button danger onClick={handleClear}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </Card>
                </Col>

                {htmlContent && (
                    <Col span={24}>
                        <Card title="Preview" bodyStyle={{ padding: 0 }}>
                            <div
                                style={{
                                    border: "1px solid #f0f0f0",
                                    height: "600px",
                                    width: "100%",
                                    overflow: "hidden"
                                }}
                            >
                                <iframe
                                    title="sandbox-preview"
                                    srcDoc={htmlContent}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        border: "none"
                                    }}
                                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                                />
                            </div>
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
};
