import React, { useEffect } from 'react';
import { Modal, Form, Select } from 'antd';
import { useUpdate, useInvalidate } from '@refinedev/core';
import { useQueryClient } from '@tanstack/react-query';

interface UpdateRiskTypeModalProps {
    open: boolean;
    onClose: () => void;
    taskId: string;
    currentRiskType?: string;
}

export const UpdateRiskTypeModal: React.FC<UpdateRiskTypeModalProps> = ({
    open,
    onClose,
    taskId,
    currentRiskType,
}) => {
    const [form] = Form.useForm();
    const { mutate: updateTask } = useUpdate();
    const invalidate = useInvalidate();
    const queryClient = useQueryClient();

    const riskTypeOptions = [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
    ];

    useEffect(() => {
        if (open) {
            form.setFieldsValue({ risk_type: currentRiskType });
        }
    }, [open, currentRiskType, form]);

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            updateTask(
                {
                    resource: 'tasks',
                    id: taskId,
                    values: { risk_type: values.risk_type },
                    successNotification: {
                        message: 'Risk type updated successfully',
                        type: 'success',
                    },
                },
                {
                    onSuccess: () => {
                        invalidate({
                            resource: 'tasks',
                            invalidates: ['all'],
                        });
                        queryClient.invalidateQueries({
                            queryKey: ['list_task_tracked_by_date'],
                        });
                        onClose();
                        form.resetFields();
                    },
                }
            );
        });
    };

    const handleCancel = () => {
        onClose();
        form.resetFields();
    };

    return (
        <Modal
            title="Update Risk Type"
            open={open}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="Update"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Risk Type"
                    name="risk_type"
                    rules={[
                        {
                            required: true,
                            message: 'Please select a risk type',
                        },
                    ]}
                >
                    <Select options={riskTypeOptions} placeholder="Select risk type" />
                </Form.Item>
            </Form>
        </Modal>
    );
};
