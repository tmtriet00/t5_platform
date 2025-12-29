import { Edit, useForm } from "@refinedev/antd";
import { Form, Skeleton } from "antd";
import { useUpdate, useInvalidate } from "@refinedev/core";
import { EmergencyKit } from "interfaces";
import { AutosaveBlockNoteEditor } from "../../components/common/autosave-block-note-editor";
import { Input } from "antd";

export const EmergencyKitEdit: React.FC = () => {
    const { formProps, saveButtonProps, query, id } = useForm<EmergencyKit>();
    const emergencyKit = query?.data?.data;

    // Autosave handling
    const { mutateAsync: update } = useUpdate();
    const invalidate = useInvalidate();

    const handleFieldSave = async (fieldName: keyof EmergencyKit, content: string) => {
        if (!id) return;
        await update({
            resource: "emergency_tickets",
            id,
            values: { [fieldName]: content },
        });
        // Invalidate list to refresh data if needed elsewhere
        await invalidate({ resource: "emergency_tickets", invalidates: ["list"] });
    };

    if (!emergencyKit) {
        return <Skeleton active />;
    }

    return (
        <Edit saveButtonProps={saveButtonProps}>
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
                <Form.Item label="Reason" name="reason">
                    {/* 
                        We use AutosaveBlockNoteEditor's onChange to sync with Form 
                        AND onSave for autosave feature.
                        We pass clear initialContent from loaded data.
                     */}
                    <AutosaveBlockNoteEditor
                        initialContent={emergencyKit.reason}
                        autosave={true}
                        onSave={(val) => handleFieldSave('reason', val)}
                        // Sync with form so standard Save button also works if clicked
                        onChange={(val) => formProps.form?.setFieldValue('reason', val)}
                    />
                </Form.Item>
                <Form.Item label="Note" name="note">
                    <AutosaveBlockNoteEditor
                        initialContent={emergencyKit.note}
                        autosave={true}
                        onSave={(val) => handleFieldSave('note', val)}
                        onChange={(val) => formProps.form?.setFieldValue('note', val)}
                    />
                </Form.Item>
            </Form>
        </Edit>
    );
};
