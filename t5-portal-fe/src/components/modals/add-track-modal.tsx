
import React, { useImperativeHandle, useState } from 'react'
import { Form, Modal, InputNumber, Button, message } from 'antd';
import { useCreate, useInvalidate } from "@refinedev/core";

export interface AddTrackModalRef {
    open: (wishListItemId: number) => void;
    close: () => void;
}

export interface AddTrackModalProps {
}

export const AddTrackModal = React.forwardRef<AddTrackModalRef, AddTrackModalProps>((_, ref) => {
    const [open, setOpen] = useState(false);
    const [wishListItemId, setWishListItemId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const invalidate = useInvalidate();

    useImperativeHandle(ref, () => ({
        open: (id: number) => {
            setWishListItemId(id);
            setOpen(true);
        },
        close: () => {
            setOpen(false);
            setWishListItemId(null);
            form.resetFields();
        }
    }));

    const onClose = () => {
        setOpen(false);
        setWishListItemId(null);
        form.resetFields();
    };

    const [isLoading, setIsLoading] = useState(false);
    const { mutate: createTrack } = useCreate();

    const handleSubmit = async (values: { point: number }) => {
        if (!wishListItemId) return;
        setIsLoading(true);

        createTrack({
            resource: "wish_list_items_track",
            values: {
                wish_list_item_id: wishListItemId,
                point: values.point,
            },
        }, {
            onSuccess: () => {
                message.success("Track added successfully");
                invalidate({
                    resource: "wish_list_items_track",
                    invalidates: ["list"],
                });
                setIsLoading(false);
                onClose();
            },
            onError: () => {
                message.error("Failed to add track");
                setIsLoading(false);
            }
        });
    };

    return (
        <Modal
            title="Add Track"
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
                    name="point"
                    label="Point"
                    rules={[{ required: true, message: "Please enter point" }]}
                >
                    <InputNumber style={{ width: '100%' }} min={0} autoFocus />
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
