import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import { EmergencyKit } from "interfaces";
import { AutosaveBlockNoteEditor } from "../../components/common/autosave-block-note-editor";

// Adapter to make AutosaveBlockNoteEditor compatible with Form.Item
// accepting value (initial) and onChange.
const BlockNoteFormInput = ({ value, onChange }: { value?: string; onChange?: (val: string) => void }) => {
    return (
        <AutosaveBlockNoteEditor
            initialContent={value}
            onChange={onChange}
            autosave={false} // No autosave for Create mode usually
        />
    );
};

export const EmergencyKitCreate: React.FC = () => {
    const { formProps, saveButtonProps } = useForm<EmergencyKit>();

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Remaining Time"
                    name="remaining_time"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input type="number" />
                </Form.Item>
                <Form.Item
                    label="Reason"
                    name="reason"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                    trigger="onChange"
                    validateTrigger="onChange"
                >
                    <BlockNoteFormInput />
                </Form.Item>
                <Form.Item
                    label="Note"
                    name="note"
                    trigger="onChange"
                    validateTrigger="onChange"
                >
                    <BlockNoteFormInput />
                </Form.Item>
            </Form>
        </Create>
    );
};
