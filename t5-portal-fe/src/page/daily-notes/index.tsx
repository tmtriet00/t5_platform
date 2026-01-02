import React, { useState } from "react";
import { AutosaveBlockNoteEditor } from "../../components/common/autosave-block-note-editor";
import { useList, useCreate, useUpdate } from "@refinedev/core";
import { Note } from "../../interfaces";
import { Typography, Spin, Card, DatePicker, Layout } from "antd";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title } = Typography;

export const DailyNotePage: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));

    const { query } = useList<Note>({
        resource: "notes",
        filters: [
            {
                field: "title",
                operator: "contains",
                value: `Daily Note - ${selectedDate}`,
            },
        ],
        pagination: {
            mode: "off",
        },
    });

    const { data, isLoading, refetch } = query;
    const { mutate: createNote } = useCreate<Note>();
    const { mutate: updateNote } = useUpdate<Note>();

    const existingNote = data?.data?.[0];

    const handleSave = async (content: string) => {
        if (existingNote) {
            updateNote({
                resource: "notes",
                id: existingNote.id,
                values: {
                    content: content,
                },
            });
        } else {
            createNote({
                resource: "notes",
                values: {
                    title: `Daily Note - ${selectedDate}`,
                    content: content,
                },
            }, {
                onSuccess: () => {
                    refetch();
                }
            });
        }
    };

    return (
        <Layout className="min-h-screen bg-white p-6">
            <div className="flex flex-col gap-4 h-full">
                <div className="flex justify-start">
                    <DatePicker
                        size="large"
                        value={dayjs(selectedDate)}
                        onChange={(date) => setSelectedDate(date?.format("YYYY-MM-DD") || dayjs().format("YYYY-MM-DD"))}
                        allowClear={false}
                    />
                </div>

                <div className="flex-1 border rounded-lg p-4 shadow-sm bg-[#1a1a1a]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Spin />
                        </div>
                    ) : (
                        <AutosaveBlockNoteEditor
                            key={existingNote ? `note-${existingNote.id}` : `new-${selectedDate}`}
                            initialContent={existingNote?.content}
                            autosave={true}
                            onSave={handleSave}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};
