

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

import { Task, Project } from "interfaces";

export const TaskCreate: React.FC = () => {
    const { formProps, saveButtonProps } = useForm<Task>();

    const { selectProps: projectSelectProps } = useSelect<Project>({
        resource: "projects",
    });

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
            </Form>
        </Create>
    );
};
