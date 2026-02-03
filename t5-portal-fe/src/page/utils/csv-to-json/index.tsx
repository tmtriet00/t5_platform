import { Button, Card, Col, Row, Space, Typography, theme, message } from "antd";
import React, { useState } from "react";
import Editor from "@monaco-editor/react";

const { Title } = Typography;

export const CsvToJsonPage: React.FC = () => {
    const [csvContent, setCsvContent] = useState("");
    const [jsonContent, setJsonContent] = useState("");
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();

    const handleConvert = () => {
        try {
            if (!csvContent.trim()) {
                setJsonContent("");
                return;
            }

            const lines = csvContent.trim().split(/\r?\n/);
            if (lines.length < 2) {
                setJsonContent("[]");
                return;
            }

            // Basic CSV parsing (handling quotes is a bit simplified here but functional for standard CSV)
            // For robust parsing, a library like papaparse is recommended, but we stick to no-deps as per plan.
            const parseLine = (line: string) => {
                const result = [];
                let startValueIndex = 0;
                let inQuotes = false;

                for (let i = 0; i < line.length; i++) {
                    if (line[i] === '"') {
                        inQuotes = !inQuotes;
                    } else if (line[i] === ',' && !inQuotes) {
                        let value = line.substring(startValueIndex, i);
                        // Remove surrounding quotes if present
                        if (value.startsWith('"') && value.endsWith('"')) {
                            value = value.substring(1, value.length - 1);
                        }
                        // Handle double quotes escape inside quotes
                        value = value.replace(/""/g, '"');
                        result.push(value);
                        startValueIndex = i + 1;
                    }
                }
                // Push the last value
                let lastValue = line.substring(startValueIndex);
                if (lastValue.startsWith('"') && lastValue.endsWith('"')) {
                    lastValue = lastValue.substring(1, lastValue.length - 1);
                }
                lastValue = lastValue.replace(/""/g, '"');
                result.push(lastValue);

                return result;
            };

            const headers = parseLine(lines[0]);

            const result = lines.slice(1).map(line => {
                const values = parseLine(line);
                const obj: Record<string, string> = {};
                headers.forEach((header, index) => {
                    obj[header] = values[index] || "";
                });
                return obj;
            });

            setJsonContent(JSON.stringify(result, null, 2));
            messageApi.success("Converted successfully!");
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to convert CSV to JSON");
        }
    };

    const handleClear = () => {
        setCsvContent("");
        setJsonContent("");
    };

    const handleCopy = () => {
        if (!jsonContent) return;
        navigator.clipboard.writeText(jsonContent);
        messageApi.success("JSON copied to clipboard!");
    };

    return (
        <Card>
            {contextHolder}
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Title level={2}>CSV to JSON Converter</Title>

                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Typography.Text strong>CSV Input</Typography.Text>
                            <div style={{ border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius, overflow: 'hidden' }}>
                                <Editor
                                    height="50vh"
                                    defaultLanguage="csv"
                                    value={csvContent}
                                    onChange={(value) => setCsvContent(value || "")}
                                    theme={token.colorBgBase === '#000000' || token.colorBgBase === '#141414' ? "vs-dark" : "light"}
                                    options={{
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                            </div>
                        </Space>
                    </Col>
                    <Col span={12}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Typography.Text strong>JSON Output</Typography.Text>
                            <div style={{ border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius, overflow: 'hidden' }}>
                                <Editor
                                    height="50vh"
                                    defaultLanguage="json"
                                    value={jsonContent}
                                    options={{
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        readOnly: true
                                    }}
                                    theme={token.colorBgBase === '#000000' || token.colorBgBase === '#141414' ? "vs-dark" : "light"}
                                />
                            </div>
                        </Space>
                    </Col>
                </Row>

                <Space>
                    <Button type="primary" onClick={handleConvert}>
                        Convert
                    </Button>
                    <Button onClick={handleClear}>
                        Clear
                    </Button>
                    <Button onClick={handleCopy} disabled={!jsonContent}>
                        Copy JSON
                    </Button>
                </Space>
            </Space>
        </Card>
    );
};
