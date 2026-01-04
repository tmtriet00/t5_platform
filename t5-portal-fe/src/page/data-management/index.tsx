import React, { useState } from "react";
import { Card, Button, Upload, Modal, Typography, Space, message, Alert, Divider } from "antd";
import { UploadOutlined, DownloadOutlined, WarningOutlined } from "@ant-design/icons";
import { supabaseClient } from "../../utility";
import { useTenant } from "../../contexts/tenant";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

export const DataManagementPage: React.FC = () => {
    const { selectedTenants } = useTenant();
    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [modal, contextHolder] = Modal.useModal();

    const isSingleTenant = selectedTenants.length === 1;
    const currentTenant = isSingleTenant ? selectedTenants[0] : null;

    const handleExport = async () => {
        if (!currentTenant) {
            message.error("Please select exactly one tenant for export");
            return;
        }

        try {
            setExportLoading(true);
            const { data, error } = await supabaseClient.rpc("export_tenant_data", {
                target_tenant_code: currentTenant.code,
            });

            if (error) throw error;

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `tenant_data_backup_${currentTenant.code}_${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success("Data exported successfully");
        } catch (err: any) {
            console.error("Export failed:", err);
            message.error(`Export failed: ${err.message}`);
        } finally {
            setExportLoading(false);
        }
    };

    const handleImport = (file: File) => {
        if (!currentTenant) {
            message.error("Please select exactly one tenant for import");
            return false;
        }

        const hide = message.loading("Reading file...", 0);
        const reader = new FileReader();

        reader.onload = async (e) => {
            hide();
            try {
                const jsonContent = JSON.parse(e.target?.result as string);
                modal.confirm({
                    title: "Are you sure you want to overwrite ALL data?",
                    icon: <WarningOutlined style={{ color: "red" }} />,
                    content: (
                        <div>
                            <p>This action will <b>PERMANENTLY DELETE</b> all existing data for tenant <b>{currentTenant.code}</b> and replace it with the data from the file.</p>
                            <p>This action cannot be undone.</p>
                        </div>
                    ),
                    okText: "Yes, Overwrite Everything",
                    okType: "danger",
                    cancelText: "Cancel",
                    onOk: async () => {
                        try {
                            setImportLoading(true);
                            const { error } = await supabaseClient.rpc("import_tenant_data", {
                                target_tenant_code: currentTenant.code,
                                data: jsonContent,
                            });

                            if (error) throw error;

                            message.success("Data imported successfully! The page will reload.");
                            setTimeout(() => window.location.reload(), 1500);
                        } catch (err: any) {
                            console.error("Import failed:", err);
                            message.error(`Import failed: ${err.message}`);
                        } finally {
                            setImportLoading(false);
                        }
                    },
                });
            } catch (err: any) {
                message.error("Invalid JSON file");
            }
        };

        reader.onerror = () => {
            hide();
            message.error("Failed to read file");
        };

        reader.readAsText(file);
        return false; // Prevent default upload behavior immediately
    };

    if (!isSingleTenant) {
        return (
            <div style={{ padding: "24px" }}>
                <Title level={2}>Data Management</Title>
                <Alert
                    message="Multiple Tenants Selected"
                    description="Data management operations (Export/Import) require exactly one tenant to be selected. Please select a single tenant from the switcher."
                    type="warning"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            {contextHolder}
            <Title level={2}>Data Management</Title>
            <Paragraph>
                Manage your tenant data. You can export a full backup or import a previous backup to restore your data.
            </Paragraph>

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Card title="Export Data" bordered={false}>
                    <Space direction="vertical">
                        <Text>Download a JSON file containing all data for the current tenant ({currentTenant?.code}).</Text>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            loading={exportLoading}
                            onClick={handleExport}
                        >
                            Export All Data
                        </Button>
                    </Space>
                </Card>

                <Card title="Import Data" bordered={false} style={{ borderColor: "#ff4d4f" }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Alert
                            message="Warning: Destructive Action"
                            description="Importing data will WIPE ALL current data for this tenant and replace it with the contents of the uploaded file."
                            type="warning"
                            showIcon
                        />
                        <Dragger
                            name="file"
                            multiple={false}
                            accept=".json"
                            beforeUpload={handleImport}
                            showUploadList={false}
                            disabled={importLoading}
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint">
                                Support for a single JSON backup file.
                            </p>
                        </Dragger>
                        {importLoading && <Text>Importing data... please wait.</Text>}
                    </Space>
                </Card>
            </Space>
        </div>
    );
};
