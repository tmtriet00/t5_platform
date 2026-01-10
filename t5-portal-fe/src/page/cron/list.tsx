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
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editingJob, setEditingJob] = useState<Cron | null>(null);
    const [newSchedule, setNewSchedule] = useState("");
    const [loading, setLoading] = useState(false);

    // New Cron State
    const [newJobName, setNewJobName] = useState("");
    const [newJobSchedule, setNewJobSchedule] = useState("");
    const [newJobCommand, setNewJobCommand] = useState("");
    const [modal, contextHolder] = Modal.useModal();

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

    const handleDelete = (job: Cron) => {
        modal.confirm({
            title: "Delete Cron Job",
            content: `Are you sure you want to delete cron job "${job.jobname}"?`,
            onOk: async () => {
                try {
                    const { error } = await supabaseClient.rpc("remove_cron", {
                        p_jobname: job.jobname,
                    });

                    if (error) {
                        message.error(`Failed to delete cron: ${error.message}`);
                    } else {
                        message.success("Cron deleted successfully");
                        refetch();
                    }
                } catch (err) {
                    message.error("Failed to delete cron");
                }
            }
        });
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

    const handleCreate = () => {
        setNewJobName("");
        setNewJobSchedule("");
        setNewJobCommand("");
        setCreateModalVisible(true);
    };

    const handleSaveNewCron = async () => {
        if (!newJobName || !newJobSchedule || !newJobCommand) {
            message.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabaseClient.rpc("add_cron", {
                p_jobname: newJobName,
                p_schedule: newJobSchedule,
                p_command: newJobCommand,
            });

            if (error) {
                message.error(`Failed to create cron: ${error.message}`);
            } else {
                message.success("Cron created successfully");
                setCreateModalVisible(false);
                refetch();
            }
        } catch (err) {
            message.error("Failed to create cron");
        } finally {
            setLoading(false);
        }
    };

    const CreateButton = (props: any) => {
        return <div className="p-2">
            <Button type="primary" onClick={props.onCreate}>Add Cron</Button>
        </div>;
    }

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
            width: 200,
            cellRenderer: (params: any) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditSchedule(params.data)}
                    >
                        Edit
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(params.data)}
                    >
                        Delete
                    </Button>
                </div>
            )
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const statusBar = useMemo(() => ({
        statusPanels: [
            {
                statusPanel: CreateButton,
                align: 'left',
                statusPanelParams: {
                    onCreate: handleCreate
                }
            }
        ]
    }), []);

    return (
        <>
            {contextHolder}
            <List>
                <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        pagination={true}
                        paginationPageSize={10}
                        loading={isLoading}
                        statusBar={statusBar}
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

            <Modal
                title="Add New Cron Job"
                open={createModalVisible}
                onOk={handleSaveNewCron}
                onCancel={() => setCreateModalVisible(false)}
                confirmLoading={loading}
            >
                <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8 }}><strong>Job Name:</strong></div>
                    <Input
                        value={newJobName}
                        onChange={(e) => setNewJobName(e.target.value)}
                        placeholder="unique_job_name"
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8 }}><strong>Schedule:</strong></div>
                    <Input
                        value={newJobSchedule}
                        onChange={(e) => setNewJobSchedule(e.target.value)}
                        placeholder="e.g., * * * * * or 30 seconds"
                    />
                </div>
                <div>
                    <div style={{ marginBottom: 8 }}><strong>Command:</strong></div>
                    <Input.TextArea
                        value={newJobCommand}
                        onChange={(e) => setNewJobCommand(e.target.value)}
                        placeholder="SQL command to execute"
                        rows={4}
                    />
                </div>
            </Modal>
        </>
    );
};
