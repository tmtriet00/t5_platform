import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, InputNumber } from "antd";
import { TaskEstimation, Task } from "interfaces";

export const TaskEstimationCreate: React.FC = () => {
    const { formProps, saveButtonProps } = useForm<TaskEstimation>();

    const { selectProps: taskSelectProps } = useSelect<Task>({
        resource: "tasks",
        optionLabel: "name",
        optionValue: "id",
    });

    return (
        <Create saveButtonProps={saveButtonProps}>
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
        </Create>
    );
};
