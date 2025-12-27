import React, { useState } from "react";

import {
    Edit,
    ListButton,
    RefreshButton,
    useForm,
    useSelect,
} from "@refinedev/antd";
import { Alert, Button, Form, Input, Select } from "antd";

import { Task, Project } from "interfaces";

export const TaskEdit: React.FC = () => {
    const [isDeprecated, setIsDeprecated] = useState(false);
    const { formProps, saveButtonProps, query } = useForm<Task>({
        liveMode: "manual",
        onLiveEvent: () => {
            setIsDeprecated(true);
        },
    });

    const taskData = query?.data?.data;
    const { selectProps: projectSelectProps } = useSelect<Project>({
        resource: "projects",
        defaultValue: taskData?.project_id,
    });

    const handleRefresh = () => {
        query?.refetch();
        setIsDeprecated(false);
    };

    const riskTypeOptions = [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
    ];

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
                    message="This task is changed. Reload to see it's latest version."
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
                    label="Project"
                    name="project_id"
                    rules={[
                        {
                            required: false,
                        },
                    ]}
                >
                    <Select {...projectSelectProps} />
                </Form.Item>
                <Form.Item
                    label="Risk Type"
                    name="risk_type"
                    rules={[
                        {
                            required: false,
                        },
                    ]}
                >
                    <Select options={riskTypeOptions} />
                </Form.Item>
            </Form>
        </Edit>
    );
};
