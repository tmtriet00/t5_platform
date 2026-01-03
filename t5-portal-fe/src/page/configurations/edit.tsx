import React, { useState } from "react";

import {
    Edit,
    ListButton,
    RefreshButton,
    useForm,
} from "@refinedev/antd";
import { Alert, Button, Form, Input } from "antd";

import { Configuration } from "../../interfaces";

export const ConfigurationEdit: React.FC = () => {
    const [isDeprecated, setIsDeprecated] = useState(false);
    const { formProps, saveButtonProps, query } = useForm<Configuration>({
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
                    message="This configuration is changed. Reload to see it's latest version."
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
                    label="Config Key"
                    name="config_key"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Config Value"
                    name="config_value"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item
                    label="Category"
                    name="config_category"
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
                    rules={[
                        {
                            required: false,
                        },
                    ]}
                >
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Edit>
    );
};
