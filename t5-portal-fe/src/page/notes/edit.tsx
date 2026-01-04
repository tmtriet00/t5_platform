
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import { Note } from "interfaces";
import { AutosaveBlockNoteEditor } from "../../components/common/autosave-block-note-editor";
import { useEffect, useState } from "react";
import { useUpdate } from "@refinedev/core";

export const NoteEdit: React.FC = () => {
    const { formProps, saveButtonProps, query, id } = useForm<Note>();
    const { mutate } = useUpdate();

    const [editorContent, setEditorContent] = useState<string | undefined>(undefined);

    const noteData = query?.data?.data;

    useEffect(() => {
        if (noteData?.content !== undefined) {
            setEditorContent(noteData.content);
        }
    }, [noteData]);

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Content"
                    name="content"
                    // We don't use rules here because the value is managed by the editor
                    // But we still want to bind it to the form
                    hidden
                >
                    <Input />
                </Form.Item>

                {/* Editor is rendered outside Form.Item binding but updates it */}
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Content</label>
                    {editorContent !== undefined && (
                        <AutosaveBlockNoteEditor
                            initialContent={editorContent}
                            autosave={true}
                            onChange={(content) => {
                                // Sync back to form
                                formProps.form?.setFieldValue("content", content);
                            }}
                            onSave={async (content) => {
                                formProps.form?.setFieldValue("content", content);

                                if (id) {
                                    mutate({
                                        resource: "notes",
                                        id: id,
                                        values: {
                                            content: content,
                                        },
                                        successNotification: false,
                                    });
                                }
                            }}
                        />
                    )}
                    {/* If it's loading or undefined, we show nothing or loading state, handled by parent Edit usually */}
                </div>
            </Form>
        </Edit>
    );
};
