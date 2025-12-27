import React from 'react';
import { Modal, Form, Select, InputNumber } from 'antd';
import { useCreate, useInvalidate } from '@refinedev/core';
import { useQueryClient } from '@tanstack/react-query';

interface AddEstimationModalProps {
    open: boolean;
    onClose: () => void;
    taskId: number;
}

export const AddEstimationModal: React.FC<AddEstimationModalProps> = ({
    open,
    onClose,
    taskId,
}) => {
    const [form] = Form.useForm();
    const { mutate: createEstimation } = useCreate();
    const invalidate = useInvalidate();
    const queryClient = useQueryClient();

    const estimationTypeOptions = [
        { label: 'Research', value: 'research' },
        { label: 'Other', value: 'other' },
    ];

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            createEstimation(
                {
                    resource: 'task_estimations',
                    values: {
                        task_id: taskId,
                        estimation_type: values.estimation_type,
                        estimation_time: values.estimation_time,
                    },
                    successNotification: {
                        message: 'Estimation added successfully',
                        type: 'success',
                    },
                },
                {
                    onSuccess: () => {
                        invalidate({
                            resource: 'task_estimations',
                            invalidates: ['all'],
                        });
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
            title="Add Estimation"
            open={open}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="Add"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Estimation Type"
                    name="estimation_type"
                    rules={[
                        {
                            required: true,
                            message: 'Please select an estimation type',
                        },
                    ]}
                >
                    <Select
                        options={estimationTypeOptions}
                        placeholder="Select estimation type"
                    />
                </Form.Item>
                <Form.Item
                    label="Estimation Time (hours)"
                    name="estimation_time"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter estimation time',
                        },
                        {
                            type: 'number',
                            min: 0,
                            message: 'Estimation time must be positive',
                        },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Enter estimation time"
                        min={0}
                        step={0.5}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
