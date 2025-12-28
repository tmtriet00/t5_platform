import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { useCreate, useInvalidate } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Task } from "../../interfaces";

interface TrackBreakTaskModalProps {
    open: boolean;
    onClose: () => void;
}

export const TrackBreakTaskModal: React.FC<TrackBreakTaskModalProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const invalidate = useInvalidate();
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(false);
    const { mutate: createTask } = useCreate<Task>();
    const { mutate: createTimeEntry } = useCreate();

    const handleSubmit = async (values: { task_name: string }) => {
        setIsLoading(true);
        createTask({
            resource: "tasks",
            values: {
                name: values.task_name,
                task_type: "break",
                status: "in_progress",
                risk_type: "low",
            },
        }, {
            onSuccess: (data) => {
                // Create time entry immediately after task creation
                createTimeEntry({
                    resource: "time_entries",
                    values: {
                        task_id: data.data.id,
                        start_time: new Date().toISOString(),
                    },
                }, {
                    onSuccess: () => {
                        message.success("Break task created and tracking started!");
                        invalidate({
                            resource: 'tasks',
                            invalidates: ['all'],
                        });
                        queryClient.invalidateQueries({
                            queryKey: ['list_task_tracked_by_date'],
                        });
                        form.resetFields();
                        setIsLoading(false);
                        onClose();
                    },
                    onError: () => {
                        message.error("Failed to start tracking the break task");
                        setIsLoading(false);
                    }
                });
            },
            onError: () => {
                message.error("Failed to create break task");
                setIsLoading(false);
            }
        });
    };

    return (
        <Modal
            title="Track Break Task"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="task_name"
                    label="Task Name"
                    rules={[{ required: true, message: "Please enter a task name" }]}
                >
                    <Input placeholder="Enter break task name (e.g., Coffee break, Lunch)" autoFocus />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button onClick={onClose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                    >
                        Start Break
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};