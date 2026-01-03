
import React, { useImperativeHandle, useState } from 'react'
import { Form, Modal, InputNumber, Button, message, Input, Select, DatePicker } from 'antd';
import { useCreate, useInvalidate } from "@refinedev/core";
import dayjs from 'dayjs';

export interface AddTransactionModalRef {
    open: (ledgerId: number) => void;
    close: () => void;
}

export interface AddTransactionModalProps {
}

export const AddTransactionModal = React.forwardRef<AddTransactionModalRef, AddTransactionModalProps>((_, ref) => {
    const [open, setOpen] = useState(false);
    const [ledgerId, setLedgerId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const invalidate = useInvalidate();

    useImperativeHandle(ref, () => ({
        open: (id: number) => {
            setLedgerId(id);
            setOpen(true);
        },
        close: () => {
            setOpen(false);
            setLedgerId(null);
            form.resetFields();
        }
    }));

    const onClose = () => {
        setOpen(false);
        setLedgerId(null);
        form.resetFields();
    };

    const [isLoading, setIsLoading] = useState(false);
    const { mutate: createTransaction } = useCreate();

    const handleSubmit = async (values: { amount: number; currency: string; type: string; category: string; description: string; transaction_time: any }) => {
        if (!ledgerId) return;
        setIsLoading(true);

        createTransaction({
            resource: "transactions",
            values: {
                ledger_id: ledgerId,
                amount: values.amount,
                currency: values.currency,
                type: values.type,
                category: values.category,
                description: values.description,
                transaction_time: values.transaction_time ? values.transaction_time.toISOString() : null,
            },
        }, {
            onSuccess: () => {
                message.success("Transaction added successfully");
                invalidate({
                    resource: "transactions",
                    invalidates: ["list"],
                });
                setIsLoading(false);
                onClose();
            },
            onError: () => {
                message.error("Failed to add transaction");
                setIsLoading(false);
            }
        });
    };

    return (
        <Modal
            title="Add Transaction"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ currency: 'VND', type: 'debit', category: 'default', transaction_time: dayjs() }}
            >
                <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true, message: "Please enter amount" }]}
                >
                    <InputNumber style={{ width: '100%' }} min={0} autoFocus />
                </Form.Item>

                <Form.Item
                    name="currency"
                    label="Currency"
                    rules={[{ required: true, message: "Please enter currency" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: "Please select type" }]}
                >
                    <Select>
                        <Select.Option value="credit">Credit</Select.Option>
                        <Select.Option value="debit">Debit</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true, message: "Please select category" }]}
                >
                    <Select>
                        <Select.Option value="default">Default</Select.Option>
                        <Select.Option value="transfer_only">Transfer Only</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="transaction_time"
                    label="Transaction Time"
                    rules={[{ required: true, message: "Please select transaction time" }]}
                >
                    <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea />
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
