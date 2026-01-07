import { useCreate, useOne, useUpdate } from "@refinedev/core";
import { Button, Card, Empty, Skeleton, message } from "antd";
import { Note } from "interfaces";
import { AutosaveBlockNoteEditor } from "../common/autosave-block-note-editor";
import { useState, useEffect } from "react";

interface ProjectNoteProps {
    projectId?: number;
    noteId?: string;
}

export const ProjectNote: React.FC<ProjectNoteProps> = ({ projectId, noteId }) => {
    const [isCreating, setIsCreating] = useState(false);
    const { mutate: createNote } = useCreate();
    const { mutate: updateProject } = useUpdate();
    const { mutate: updateNote } = useUpdate();

    // If noteId is present, we fetch the note
    const { data: noteData, isLoading: isNoteLoading, isError } = useOne<Note>({
        resource: "notes",
        id: noteId,
        queryOptions: {
            enabled: !!noteId,
        },
    }).query;

    const note = noteData?.data;

    const handleCreateNote = () => {
        if (!projectId) return;

        setIsCreating(true);
        createNote(
            {
                resource: "notes",
                values: {
                    title: `Note for Project ${projectId}`,
                    content: "",
                },
            },
            {
                onSuccess: (data) => {
                    const newNoteId = data.data.id;
                    // Link to project
                    updateProject({
                        resource: "projects",
                        id: projectId,
                        values: {
                            note_id: newNoteId,
                        },
                        successNotification: {
                            message: "Note created and linked to project",
                            type: "success",
                        },
                    }, {
                        onSettled: () => {
                            setIsCreating(false);
                        }
                    });
                },
                onError: () => {
                    setIsCreating(false);
                }
            }
        );
    };

    // Handle saving the note content
    const handleSaveNote = async (content: string) => {
        if (!noteId) return;

        updateNote({
            resource: "notes",
            id: noteId,
            values: {
                content,
            },
            successNotification: false,
        });
    };

    if (!noteId) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Empty
                    description="No note linked to this project yet"
                >
                    <Button type="primary" onClick={handleCreateNote} loading={isCreating}>
                        Create Note
                    </Button>
                </Empty>
            </div>
        );
    }

    if (isNoteLoading) {
        return <Skeleton active />;
    }

    if (isError) {
        return <div>Error loading note.</div>
    }

    return (
        <AutosaveBlockNoteEditor
            initialContent={note?.content}
            autosave={true}
            onSave={handleSaveNote}
        />
    );
};
