import { Button, Card, Col, Row, Space, Typography, theme, Checkbox, notification } from "antd";
import React, { useState } from "react";
import Editor from "@monaco-editor/react";

const { Title } = Typography;

export const Base64ConverterPage: React.FC = () => {
    const [inputContent, setInputContent] = useState("");
    const [outputContent, setOutputContent] = useState("");
    const [isUriSafe, setIsUriSafe] = useState(false);
    const { token } = theme.useToken();
    const [api, contextHolder] = notification.useNotification();

    const handleEncode = () => {
        try {
            let toEncode = inputContent;
            if (isUriSafe) {
                toEncode = encodeURIComponent(inputContent).replace(/%([0-9A-F]{2})/g,
                    function toSolidBytes(_match, p1) {
                        return String.fromCharCode(parseInt(p1, 16));
                    });
            }
            const encoded = btoa(toEncode);
            setOutputContent(encoded);
        } catch {
            api.error({
                message: "Encoding Error",
                description: "Failed to encode content.",
            });
        }
    };

    const handleDecode = () => {
        try {
            let decoded = atob(inputContent);
            if (isUriSafe) {
                decoded = decodeURIComponent(Array.prototype.map.call(decoded, function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
            }
            setOutputContent(decoded);
        } catch {
            api.error({
                message: "Decoding Error",
                description: "Failed to decode content. Ensure the input is valid Base64.",
            });
        }
    };

    const handleClear = () => {
        setInputContent("");
        setOutputContent("");
    };

    return (
        <Card>
            {contextHolder}
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Title level={2}>Base64 Converter</Title>

                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Typography.Text strong>Input</Typography.Text>
                            <div style={{ border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius, overflow: 'hidden' }}>
                                <Editor
                                    height="50vh"
                                    defaultLanguage="text"
                                    value={inputContent}
                                    onChange={(value) => {
                                        setInputContent(value || "");
                                    }}
                                    theme={token.colorBgBase === '#000000' || token.colorBgBase === '#141414' ? "vs-dark" : "light"}
                                    options={{
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        wordWrap: "on",
                                    }}
                                />
                            </div>
                        </Space>
                    </Col>
                    <Col span={12}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Typography.Text strong>Output</Typography.Text>
                            <div style={{ border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius, overflow: 'hidden' }}>
                                <Editor
                                    height="50vh"
                                    defaultLanguage="text"
                                    value={outputContent}
                                    onChange={(value) => {
                                        setOutputContent(value || "");
                                    }}
                                    theme={token.colorBgBase === '#000000' || token.colorBgBase === '#141414' ? "vs-dark" : "light"}
                                    options={{
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        wordWrap: "on",
                                    }}
                                />
                            </div>
                        </Space>
                    </Col>
                </Row>

                <Space>
                    <Button type="primary" onClick={handleEncode}>
                        Encode (Input → Output)
                    </Button>
                    <Button onClick={handleDecode}>
                        Decode (Input → Output)
                    </Button>
                    <Button onClick={handleClear} danger>
                        Clear
                    </Button>
                    <Checkbox checked={isUriSafe} onChange={(e) => setIsUriSafe(e.target.checked)}>
                        Safe Encode/Decode Base URI
                    </Checkbox>
                </Space>
            </Space>
        </Card>
    );
};
