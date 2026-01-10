import {
    List,
    useTable,
    BooleanField,
} from "@refinedev/antd";
import { Table, Switch, Button, Modal, Input, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { Cron } from "interfaces";
import { supabaseClient } from "../../utility";
import { useState } from "react";

export const CronList: React.FC = () => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingJob, setEditingJob] = useState<Cron | null>(null);
    const [newSchedule, setNewSchedule] = useState("");
    const [loading, setLoading] = useState(false);

    const { tableProps, tableQuery } = useTable<Cron>({
        resource: "cron",
        pagination: {
            mode: "off",
        },
        sorters: {

        },
    });


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
                tableQuery.refetch();
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
                tableQuery.refetch();
            }
        } catch (err) {
            message.error("Failed to update schedule");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <List>
                <Table {...tableProps} rowKey="jobid">
                    <Table.Column
                        dataIndex="jobid"
                        title="ID"
                        sorter
                    />
                    <Table.Column
                        dataIndex="jobname"
                        title="Name"
                        sorter
                    />
                    <Table.Column
                        dataIndex="schedule"
                        title="Schedule"
                    />
                    <Table.Column
                        dataIndex="command"
                        title="Command"
                    />
                    <Table.Column
                        dataIndex="active"
                        title="Active"
                        render={(value, record: Cron) => (
                            <Switch
                                checked={value}
                                onChange={() => handleToggleActive(record.jobid, value)}
                            />
                        )}
                    />
                    <Table.Column
                        dataIndex="username"
                        title="Run As"
                    />
                    <Table.Column
                        title="Actions"
                        render={(_, record: Cron) => (
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => handleEditSchedule(record)}
                            >
                                Edit Schedule
                            </Button>
                        )}
                    />
                </Table>
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
