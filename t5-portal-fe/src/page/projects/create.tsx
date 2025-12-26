import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

import { Project } from "interfaces";

export const ProjectCreate: React.FC = () => {
    const { formProps, saveButtonProps } = useForm<Project>();

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
        </Create>
    );
};
