import { Button, Card, Col, Row, Space, Typography, theme } from "antd";
import React, { useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import Editor from "@monaco-editor/react";

const { Title } = Typography;

export const DifferPage: React.FC = () => {
    const [leftContent, setLeftContent] = useState("");
    const [rightContent, setRightContent] = useState("");
    const [showDiff, setShowDiff] = useState(false);
    const { token } = theme.useToken();

    const handleCompare = () => {
        setShowDiff(true);
    };

    const handleClear = () => {
        setLeftContent("");
        setRightContent("");
        setShowDiff(false);
    };

    return (
        <Card>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Title level={2}>Text Differ</Title>

                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Typography.Text strong>Original Text</Typography.Text>
                            <div style={{ border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius, overflow: 'hidden' }}>
                                <Editor
                                    height="50vh"
                                    defaultLanguage="markdown"
                                    value={leftContent}
                                    onChange={(value) => {
                                        setLeftContent(value || "");
                                        setShowDiff(false);
                                    }}
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
                            <Typography.Text strong>Changed Text</Typography.Text>
                            <div style={{ border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius, overflow: 'hidden' }}>
                                <Editor
                                    height="50vh"
                                    defaultLanguage="markdown"
                                    value={rightContent}
                                    onChange={(value) => {
                                        setRightContent(value || "");
                                        setShowDiff(false);
                                    }}
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
                    <Button type="primary" onClick={handleCompare}>
                        Compare
                    </Button>
                    <Button onClick={handleClear}>
                        Clear
                    </Button>
                </Space>

                {showDiff && (
                    <div style={{
                        border: `1px solid ${token.colorBorder}`,
                        borderRadius: token.borderRadius,
                        overflow: 'hidden'
                    }}>
                        <ReactDiffViewer
                            oldValue={leftContent}
                            newValue={rightContent}
                            splitView={true}
                            useDarkTheme={token.colorBgBase === '#000000' || token.colorBgBase === '#141414'}
                        />
                    </div>
                )}
            </Space>
        </Card>
    );
};
