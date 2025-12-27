import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";

export const TaskDetailEditor = () => {
    const editor = useCreateBlockNote();

    return <div >
        <BlockNoteView theme="dark" editor={editor} />
    </div>;
};