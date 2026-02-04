import { Button, Card, Col, Row, Space, Typography, theme, message } from "antd";
import React, { useState } from "react";
import Editor from "@monaco-editor/react";

const { Title } = Typography;

export const CsvToJsonPage: React.FC = () => {
    const [csvContent, setCsvContent] = useState("");
    const [jsonContent, setJsonContent] = useState("");
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();

    const handleCsvToJson = () => {
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

            // Basic CSV parsing
            const parseLine = (line: string) => {
                const result = [];
                let startValueIndex = 0;
                let inQuotes = false;

                for (let i = 0; i < line.length; i++) {
                    if (line[i] === '"') {
                        inQuotes = !inQuotes;
                    } else if (line[i] === ',' && !inQuotes) {
                        let value = line.substring(startValueIndex, i);
                        if (value.startsWith('"') && value.endsWith('"')) {
                            value = value.substring(1, value.length - 1);
                        }
                        value = value.replace(/""/g, '"');
                        result.push(value);
                        startValueIndex = i + 1;
                    }
                }
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
            messageApi.success("Converted CSV to JSON successfully!");
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to convert CSV to JSON");
        }
    };

    const handleJsonToCsv = () => {
        try {
            if (!jsonContent.trim()) {
                setCsvContent("");
                return;
            }

            const jsonData = JSON.parse(jsonContent);
            if (!Array.isArray(jsonData)) {
                messageApi.error("JSON must be an array of objects");
                return;
            }

            if (jsonData.length === 0) {
                setCsvContent("");
                return;
            }

            // Collect all unique keys from all objects
            const allKeys = new Set<string>();
            jsonData.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    Object.keys(item).forEach(key => allKeys.add(key));
                }
            });
            const headers = Array.from(allKeys);

            const csvRows = [];
            // Add header row
            csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

            // Add data rows
            jsonData.forEach(item => {
                const row = headers.map(header => {
                    const val = (item as Record<string, unknown>)[header];
                    const valStr = val === undefined || val === null ? "" : String(val);
                    // Quote and escape quotes
                    return `"${valStr.replace(/"/g, '""')}"`;
                });
                csvRows.push(row.join(','));
            });

            setCsvContent(csvRows.join('\n'));
            messageApi.success("Converted JSON to CSV successfully!");

        } catch (error) {
            console.error(error);
            messageApi.error("Failed to convert JSON to CSV. Invalid JSON?");
        }
    }

    const handleClear = () => {
        setCsvContent("");
        setJsonContent("");
    };

    return (
        <Card>
            {contextHolder}
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Title level={2}>CSV ↔ JSON Converter</Title>

                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Typography.Text strong>CSV</Typography.Text>
                            <div style={{ border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius, overflow: 'hidden' }}>
                                <Editor
                                    height="70vh"
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
                            <Typography.Text strong>JSON</Typography.Text>
                            <div style={{ border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius, overflow: 'hidden' }}>
                                <Editor
                                    height="70vh"
                                    defaultLanguage="json"
                                    value={jsonContent}
                                    onChange={(value) => setJsonContent(value || "")}
                                    theme={token.colorBgBase === '#000000' || token.colorBgBase === '#141414' ? "vs-dark" : "light"}
                                    options={{
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                            </div>
                        </Space>
                    </Col>
                </Row>

                <Space>
                    <Button type="primary" onClick={handleCsvToJson}>
                        CSV to JSON →
                    </Button>
                    <Button type="primary" onClick={handleJsonToCsv}>
                        ← JSON to CSV
                    </Button>
                    <Button onClick={handleClear}>
                        Clear All
                    </Button>
                </Space>
            </Space>
        </Card>
    );
};
