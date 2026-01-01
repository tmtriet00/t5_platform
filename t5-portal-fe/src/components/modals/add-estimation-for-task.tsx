import React, { useImperativeHandle, useState } from 'react'
import { Form, Modal, InputNumber, Button, Select, message } from 'antd';
import { useCreate, useInvalidate } from "@refinedev/core";
import { TaskEstimation } from '../../interfaces';

export interface AddEstimationForTaskModalRef {
    open: (taskId: number) => void;
    close: () => void;
}

export interface AddEstimationForTaskModalProps {
}

export const AddEstimationForTaskModal = React.forwardRef<AddEstimationForTaskModalRef, AddEstimationForTaskModalProps>((_, ref) => {
    const [open, setOpen] = useState(false);
    const [taskId, setTaskId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const invalidate = useInvalidate();

    useImperativeHandle(ref, () => ({
        open: (id: number) => {
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