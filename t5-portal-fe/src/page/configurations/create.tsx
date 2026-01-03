import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

import { Configuration } from "../../interfaces";

export const ConfigurationCreate: React.FC = () => {
    const { formProps, saveButtonProps } = useForm<Configuration>();

    return (
        <Create saveButtonProps={saveButtonProps}>
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
                    initialValue="default"
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
        </Create>
    );
};
