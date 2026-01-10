import React, { useState } from "react";
import { Modal, Form, Input, Button, message, Select, DatePicker } from "antd";
import { useCreate, useInvalidate } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Task } from "../../interfaces";
import dayjs from "dayjs";

interface QuickLogModalProps {
    open: boolean;
    onClose: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const invalidate = useInvalidate();
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(false);
    const { mutate: createTask } = useCreate<Task>();
    const { mutate: createTimeEntry } = useCreate();

    const handleSubmit = async (values: {
        task_name: string;
        risk_type: 'low' | 'medium' | 'high';
        start_time: dayjs.Dayjs;
        end_time?: dayjs.Dayjs;
    }) => {
        setIsLoading(true);
        createTask({
            resource: "tasks",
            values: {
                name: values.task_name,
                // Default to 'work' since it's not a break task, unless implicit? 
                // Prioritize user input schema. Defaulting to 'work'.
                task_type: "work",
                status: values.end_time ? "completed" : "in_progress",
                risk_type: values.risk_type,
            },
        }, {
            onSuccess: (data) => {
                // Create time entry immediately after task creation
                createTimeEntry({
                    resource: "time_entries",
                    values: {
                        task_id: data.data.id,
                        start_time: values.start_time.toISOString(),
                        end_time: values.end_time ? values.end_time.toISOString() : null,
                    },
                }, {
                    onSuccess: () => {
                        message.success("Task created and time logged!");
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
                        message.error("Failed to log time entry");
                        setIsLoading(false);
                    }
                });
            },
            onError: () => {
                message.error("Failed to create task");
                setIsLoading(false);
            }
        });
    };

    return (
        <Modal
            title="Quick Log"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    start_time: dayjs(), // Default to now
                    risk_type: 'low'
                }}
            >
                <Form.Item
                    name="task_name"
                    label="Task Name"
                    rules={[{ required: true, message: "Please enter a task name" }]}
                >
                    <Input placeholder="Enter task name" autoFocus />
                </Form.Item>

                <Form.Item
                    name="risk_type"
                    label="Task Risk Type"
                    rules={[{ required: true, message: "Please select a risk type" }]}
                >
                    <Select>
                        <Select.Option value="low">Low</Select.Option>
                        <Select.Option value="medium">Medium</Select.Option>
                        <Select.Option value="high">High</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="start_time"
                    label="Time Entry Start"
                    rules={[{ required: true, message: "Please select a start time" }]}
                >
                    <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="end_time"
                    label="Time Entry End"
                >
                    <DatePicker showTime style={{ width: '100%' }} />
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
                        Save Log
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};
