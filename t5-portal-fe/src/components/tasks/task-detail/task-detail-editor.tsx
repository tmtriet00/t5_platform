import { useCallback } from "react";
import { useUpdate, useInvalidate } from "@refinedev/core";
import { AutosaveBlockNoteEditor } from "../../common/autosave-block-note-editor";

interface TaskDetailEditorProps {
    taskId: string;
    initialNote?: string;
}

export const TaskDetailEditor: React.FC<TaskDetailEditorProps> = ({ taskId, initialNote }) => {
    const invalidate = useInvalidate();
    const { mutateAsync: updateTask } = useUpdate();

    const handleSave = useCallback(async (content: string) => {
        await updateTask(
            {
                resource: "tasks",
                id: taskId,
                values: { note: content },
            }
        );

        await invalidate({
            resource: "tasks",
            invalidates: ["list"],
        });
    }, [taskId, updateTask, invalidate]);

    return (
        <AutosaveBlockNoteEditor
            initialContent={initialNote}
            onSave={handleSave}
            autosave={true}
        />
    );
};