import { useEffect, useCallback, useState, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { Button, Space, Typography } from "antd";
import { useUpdate, useInvalidate } from "@refinedev/core";
import "@blocknote/mantine/style.css";

interface TaskDetailEditorProps {
    taskId: number;
    initialNote?: string;
}

type SaveStatus = 'saved' | 'saving' | 'unsaved';

export const TaskDetailEditor: React.FC<TaskDetailEditorProps> = ({ taskId, initialNote }) => {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const invalidate = useInvalidate();
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);

    // Parse initial content from JSON string
    const getInitialContent = () => {
        if (!initialNote) return undefined;
        try {
            return JSON.parse(initialNote);
        } catch {
            return undefined;
        }
    };

    const editor = useCreateBlockNote({
        initialContent: getInitialContent(),
    });

    const { mutate: updateTask } = useUpdate();

    const saveNote = useCallback(() => {
        setSaveStatus('saving');
        const noteJson = JSON.stringify(editor.document);

        updateTask(
            {
                resource: "tasks",
                id: taskId,
                values: { note: noteJson },
            },
            {
                onSuccess: () => {
                    setSaveStatus('saved');
                    invalidate({
                        resource: "tasks",
                        invalidates: ["list"],
                    });
                },
                onError: () => {
                    setSaveStatus('unsaved');
                },
            }
        );
    }, [taskId, updateTask, invalidate, editor]);

    const handleSaveClick = useCallback(() => {
        // Clear any pending auto-save
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = null;
        }
        saveNote();
    }, [saveNote]);

    // Handle editor changes for auto-save
    const handleEditorChange = useCallback(() => {
        // Skip the initial content load
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            return;
        }

        setSaveStatus('unsaved');

        // Clear existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Set new auto-save timer
        autoSaveTimerRef.current = setTimeout(() => {
            saveNote();
        }, 2000);
    }, [saveNote]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, []);

    const statusText = {
        saved: '✓ Saved',
        saving: 'Saving...',
        unsaved: 'Unsaved changes',
    };

    const statusColor = {
        saved: '#52c41a',
        saving: '#1890ff',
        unsaved: '#faad14',
    };

    return (
        <div>
            <Space style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Typography.Text style={{ color: statusColor[saveStatus], fontSize: 12 }}>
                    {statusText[saveStatus]}
                </Typography.Text>
                <Button
                    type="primary"
                    size="small"
                    onClick={handleSaveClick}
                    loading={saveStatus === 'saving'}
                >
                    Save
                </Button>
            </Space>
            <BlockNoteView
                theme="dark"
                editor={editor}
                onChange={handleEditorChange}
                style={{ minHeight: 150, backgroundColor: '#1a1a1a' }}
            />
        </div>
    );
};