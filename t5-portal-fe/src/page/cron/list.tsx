import {
    List,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Switch, Button, Modal, Input, message, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMemo, useState } from "react";
import { Cron } from "interfaces";
import { supabaseClient } from "../../utility";

export const CronList: React.FC = () => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingJob, setEditingJob] = useState<Cron | null>(null);
    const [newSchedule, setNewSchedule] = useState("");
    const [loading, setLoading] = useState(false);

    const { query } = useList<Cron>({
        resource: "cron",
        sorters: [
            {
                field: "jobid",
                order: "desc",
            },
        ],
    });

    const { data: listData, isLoading, refetch } = query;
    const rowData = listData?.data || [];

    const handleToggleActive = async (jobid: number, currentActive: boolean) => {
        try {
            const { error } = await supabaseClient.rpc("toggle_cron", {
                p_jobid: jobid,
                p_active: !currentActive,
            });

            if (error) {
                console.error("Toggle Cron Error:", error);
                message.error(`Failed to toggle cron: ${error.message}`);
            } else {
                message.success("Cron status updated successfully");
                refetch();
            }
        } catch (err) {
            message.error("Failed to toggle cron");
        }
    };

    const handleEditSchedule = (job: Cron) => {
        setEditingJob(job);
        setNewSchedule(job.schedule);
        setEditModalVisible(true);
    };

    const handleSaveSchedule = async () => {
        if (!editingJob) return;

        setLoading(true);
        try {
            const { error } = await supabaseClient.rpc("update_cron_schedule", {
                p_jobid: editingJob.jobid,
                p_schedule: newSchedule,
            });

            if (error) {
                message.error(`Failed to update schedule: ${error.message}`);
            } else {
                message.success("Schedule updated successfully");
                setEditModalVisible(false);
                refetch();
            }
        } catch (err) {
            message.error("Failed to update schedule");
        } finally {
            setLoading(false);
        }
    };

    const columnDefs = useMemo<ColDef<Cron>[]>(() => [
        {
            field: "jobid",
            headerName: "ID",
            sortable: true,
            filter: true,
            width: 80,
        },
        {
            field: "jobname",
            headerName: "Name",
            sortable: true,
            filter: true,
            flex: 1,
        },
        {
            field: "schedule",
            headerName: "Schedule",
            sortable: true,
            filter: true,
            width: 150,
        },
        {
            field: "command",
            headerName: "Command",
            filter: true,
            flex: 2,
        },
        {
            field: "active",
            headerName: "Active",
            width: 100,
            cellRenderer: (params: any) => (
                <Switch
                    checked={params.value}
                    onChange={() => handleToggleActive(params.data.jobid, params.value)}
                />
            )
        },
        {
            field: "username",
            headerName: "Run As",
            sortable: true,
            filter: true,
            width: 120,
        },
        {
            headerName: "Actions",
            field: "jobid",
            width: 150,
            cellRenderer: (params: any) => (
                <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEditSchedule(params.data)}
                >
                    Edit Schedule
                </Button>
            )
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        resizable: true,
    }), []);

    return (
        <>
            <List>
                <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        pagination={true}
                        paginationPageSize={10}
                        loading={isLoading}
                    />
                </div>
            </List>

            <Modal
                title="Edit Cron Schedule"
                open={editModalVisible}
                onOk={handleSaveSchedule}
                onCancel={() => setEditModalVisible(false)}
                confirmLoading={loading}
            >
                <div style={{ marginBottom: 16 }}>
                    <strong>Job Name:</strong> {editingJob?.jobname}
                </div>
                <div style={{ marginBottom: 16 }}>
                    <strong>Current Schedule:</strong> {editingJob?.schedule}
                </div>
                <div>
                    <strong>New Schedule:</strong>
                    <Input
                        value={newSchedule}
                        onChange={(e) => setNewSchedule(e.target.value)}
                        placeholder="e.g., * * * * * or 30 seconds"
                        style={{ marginTop: 8 }}
                    />
                </div>
            </Modal>
        </>
    );
};
