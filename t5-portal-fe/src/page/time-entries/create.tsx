
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, DatePicker } from "antd";
import { TimeEntry, Task } from "interfaces";
import dayjs from "dayjs";

export const TimeEntryCreate: React.FC = () => {
    const { formProps, saveButtonProps } = useForm<TimeEntry>();

    const { selectProps: taskSelectProps } = useSelect<Task>({
        resource: "tasks",
        optionLabel: "name",
    });

    return (
        <Create saveButtonProps={saveButtonProps}>
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
        </Create>
    );
};
