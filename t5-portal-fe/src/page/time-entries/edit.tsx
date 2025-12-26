import React, { useState } from "react";

import {
    Edit,
    ListButton,
    RefreshButton,
    useForm,
    useSelect,
} from "@refinedev/antd";
import { Alert, Button, Form, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";

import { TimeEntry, Task } from "interfaces";

export const TimeEntryEdit: React.FC = () => {
    const [isDeprecated, setIsDeprecated] = useState(false);
    const { formProps, saveButtonProps, query } = useForm<TimeEntry>({
        liveMode: "manual",
        onLiveEvent: () => {
            setIsDeprecated(true);
        },
    });

    const timeEntryData = query?.data?.data;
    const { selectProps: taskSelectProps } = useSelect<Task>({
        resource: "tasks",
        defaultValue: timeEntryData?.task_id,
        optionLabel: "name",
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
                    message="This time entry is changed. Reload to see it's latest version."
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
                    label="Description"
                    name="description"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item
                    label="Task"
                    name="task_id"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select {...taskSelectProps} />
                </Form.Item>
                <Form.Item
                    label="Start Time"
                    name="start_time"
                    getValueProps={(value) => ({
                        value: value ? dayjs(value) : "",
                    })}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <DatePicker showTime />
                </Form.Item>
                <Form.Item
                    label="End Time"
                    name="end_time"
                    getValueProps={(value) => ({
                        value: value ? dayjs(value) : "",
                    })}
                >
                    <DatePicker showTime />
                </Form.Item>
                <Form.Item
                    label="Tags"
                    name="tags"
                >
                    <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']} />
                </Form.Item>
            </Form>
        </Edit>
    );
};
