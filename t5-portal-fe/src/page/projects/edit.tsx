import React, { useState } from "react";

import {
    Edit,
    ListButton,
    RefreshButton,
    useForm,
} from "@refinedev/antd";
import { Alert, Button, Form, Input } from "antd";

import { Project } from "interfaces";

export const ProjectEdit: React.FC = () => {
    const [isDeprecated, setIsDeprecated] = useState(false);
    const { formProps, saveButtonProps, query } = useForm<Project>({
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
                    message="This project is changed. Reload to see it's latest version."
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
                    label="Color"
                    name="color"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input type="color" />
                </Form.Item>
            </Form>
        </Edit>
    );
};
