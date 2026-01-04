import { useEffect, useCallback, useState, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { Button, Space, Typography } from "antd";
import "@blocknote/mantine/style.css";

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

interface AutosaveBlockNoteEditorProps {
    initialContent?: string; // JSON string
    onSave?: (content: string) => Promise<void>; // Argument is JSON string
    onChange?: (content: string) => void;
    autosave?: boolean;
    debounceMs?: number;
}

export const AutosaveBlockNoteEditor: React.FC<AutosaveBlockNoteEditorProps> = ({
    initialContent,
    onSave,
    onChange,
    autosave = false,
    debounceMs = 2000
}) => {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);

    // Parse initial content from JSON string
    const getInitialContent = () => {
        if (!initialContent) return undefined;
        try {
            return JSON.parse(initialContent);
        } catch {
            return undefined;
        }
    };

    const editor = useCreateBlockNote({
        initialContent: getInitialContent(),
    });

    const handleSave = useCallback(async () => {
        if (!onSave) return;

        setSaveStatus('saving');
        const noteJson = JSON.stringify(editor.document);

        try {
            await onSave(noteJson);
            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to save:", error);
            setSaveStatus('unsaved');
        }
    }, [editor, onSave]);

    const handleManualSave = useCallback(() => {
        // Clear any pending auto-save
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = null;
        }
        handleSave();
    }, [handleSave]);

    // Handle editor changes
    const handleEditorChange = useCallback(() => {
        // Skip the initial content load if needed, though BlockNote handle it well usually
        // But for autosave logic, we might want to skip first render trigger if any
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            return;
        }

        const content = JSON.stringify(editor.document);
        if (onChange) {
            onChange(content);
        }

        if (autosave && onSave) {
            setSaveStatus('unsaved');

            // Clear existing timer
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }

            // Set new auto-save timer
            autoSaveTimerRef.current = setTimeout(() => {
                handleSave();
            }, debounceMs);
        }
    }, [editor, onChange, autosave, onSave, debounceMs, handleSave]);

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

    // Bind to editor changes directly for more reliable updates
    useEffect(() => {
        if (editor) {
            // Subscribe to document updates
            const unsubscribe = editor.onChange(() => {
                handleEditorChange();
            });
            return unsubscribe; // Cleanup subscription
        }
    }, [editor, handleEditorChange]);

    return (
        <div>
            {autosave && (
                <Space style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography.Text style={{ color: statusColor[saveStatus], fontSize: 12 }}>
                        {statusText[saveStatus]}
                    </Typography.Text>
                    <Button
                        type="primary"
                        size="small"
                        onClick={handleManualSave}
                        loading={saveStatus === 'saving'}
                    >
                        Save
                    </Button>
                </Space>
            )}
            <BlockNoteView
                theme="dark"
                editor={editor}
                style={{ minHeight: 150, backgroundColor: '#1a1a1a' }}
            />
        </div>
    );
};
