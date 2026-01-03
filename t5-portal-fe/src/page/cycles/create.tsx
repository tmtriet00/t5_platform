import { Create, useForm } from "@refinedev/antd";
import { Form, Input, DatePicker } from "antd";
import { Cycle } from "../../interfaces";
import dayjs from "dayjs";

export const CycleCreate: React.FC = () => {
    const { formProps, saveButtonProps } = useForm<Cycle>();

    return (
        <Create saveButtonProps={saveButtonProps}>
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
        </Create>
    );
};
