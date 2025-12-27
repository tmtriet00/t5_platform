import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";

export const TaskDetailEditor = () => {
    const editor = useCreateBlockNote();

    return <BlockNoteView editor={editor} />;
};