import React from "react";
import {
    Edit,
    ListButton,
    RefreshButton,
    useForm,
    useSelect,
} from "@refinedev/antd";
import { Form, Select, InputNumber } from "antd";
import { TaskEstimation, Task } from "interfaces";

export const TaskEstimationEdit: React.FC = () => {
    const { formProps, saveButtonProps, query } = useForm<TaskEstimation>();

    const taskEstimationData = query?.data?.data;

    const { selectProps: taskSelectProps } = useSelect<Task>({
        resource: "tasks",
        defaultValue: taskEstimationData?.task_id,
        optionLabel: "name",
        optionValue: "id",
    });

    return (
        <Edit
            saveButtonProps={saveButtonProps}
            headerProps={{
                extra: (
                    <>
                        <ListButton />
                        <RefreshButton onClick={() => query?.refetch()} />
                    </>
                ),
            }}
        >
            <Form {...formProps} layout="vertical">
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
                    label="Estimation Time"
                    name="estimation_time"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Edit>
    );
};
