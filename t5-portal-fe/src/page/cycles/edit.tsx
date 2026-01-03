import React, { useState } from "react";
import {
    Edit,
    ListButton,
    RefreshButton,
    useForm,
} from "@refinedev/antd";
import { Alert, Button, Form, Input, DatePicker } from "antd";
import { Cycle } from "../../interfaces";
import dayjs from "dayjs";

export const CycleEdit: React.FC = () => {
    const [isDeprecated, setIsDeprecated] = useState(false);
    const { formProps, saveButtonProps, query } = useForm<Cycle>({
        liveMode: "manual",
        onLiveEvent: () => {
            setIsDeprecated(true);
        },
    });

    const handleRefresh = () => {
        query?.refetch();
        setIsDeprecated(false);
    };

    return (
        <Edit
            saveButtonProps={saveButtonProps}
            headerProps={{
                extra: (
                    <>
                        <ListButton />
                        <RefreshButton onClick={handleRefresh} />
                    </>
                ),
            }}
        >
            {isDeprecated && (
                <Alert
                    message="This cycle is changed. Reload to see it's latest version."
                    type="warning"
                    className="mb-5"
                    action={
                        <Button onClick={handleRefresh} size="small">
                            Refresh
                        </Button>
                    }
                />
            )}

            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Description"
                    name="description"
                >
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    label="Start Time"
                    name="start_time"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                    getValueProps={(value) => ({
                        value: value ? dayjs(value) : "",
                    })}
                >
                    <DatePicker showTime />
                </Form.Item>
                <Form.Item
                    label="End Time"
                    name="end_time"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                    getValueProps={(value) => ({
                        value: value ? dayjs(value) : "",
                    })}
                >
                    <DatePicker showTime />
                </Form.Item>
            </Form>
        </Edit>
    );
};
