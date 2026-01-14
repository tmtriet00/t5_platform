import React, { useImperativeHandle, useState } from 'react'
import { Form, Modal, InputNumber, Button, Select, message } from 'antd';
import { useCreate, useInvalidate } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { TaskEstimation } from '../../interfaces';

export interface AddEstimationForTaskModalRef {
    open: (taskId: string) => void;
    close: () => void;
}

export interface AddEstimationForTaskModalProps {
}

export const AddEstimationForTaskModal = React.forwardRef<AddEstimationForTaskModalRef, AddEstimationForTaskModalProps>((_, ref) => {
    const [open, setOpen] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [form] = Form.useForm();
    const invalidate = useInvalidate();
    const queryClient = useQueryClient();

    useImperativeHandle(ref, () => ({
        open: (id: string) => {
            setTaskId(id);
            setOpen(true);
        },
        close: () => {
            setOpen(false);
            setTaskId(null);
            form.resetFields();
        }
    }));

    const onClose = () => {
        setOpen(false);
        setTaskId(null);
        form.resetFields();
    };

    const [isLoading, setIsLoading] = useState(false);
    const { mutate: createEstimation } = useCreate<TaskEstimation>();

    const handleSubmit = async (values: { estimation_time: number, estimation_type: 'research' | 'other' }) => {
        if (!taskId) return;
        setIsLoading(true);

        createEstimation({
            resource: "task_estimations",
            values: {
                task_id: taskId,
                estimation_time: values.estimation_time,
                estimation_type: values.estimation_type
            },
        }, {
            onSuccess: () => {
                message.success("Estimation added successfully");
                invalidate({
                    resource: "tasks",
                    invalidates: ["list", "detail"],
                    id: taskId
                });
                invalidate({
                    resource: "task_estimations",
                    invalidates: ["list", "detail"],
                    id: taskId
                });
                queryClient.invalidateQueries({
                    queryKey: ["list_task_tracked_by_date"]
                });
                setIsLoading(false);
                onClose();
            },
            onError: () => {
                message.error("Failed to add estimation");
                setIsLoading(false);
            }
        });
    };

    return (
        <Modal
            title="Add Estimation For Task"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    estimation_type: 'other' // Default value
                }}
            >
                <Form.Item
                    name="estimation_time"
                    label="Estimation Time (Seconds)"
                    rules={[{ required: true, message: "Please enter estimation time" }]}
                >
                    <InputNumber style={{ width: '100%' }} min={0} step={0.5} autoFocus />
                </Form.Item>

                <Form.Item
                    name="estimation_type"
                    label="Type"
                >
                    <Select
                        options={[
                            { label: 'Research', value: 'research' },
                            { label: 'Other', value: 'other' },
                        ]}
                    />
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
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
})