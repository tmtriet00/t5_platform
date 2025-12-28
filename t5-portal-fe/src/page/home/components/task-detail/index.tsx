import { Tabs, Spin } from 'antd';
import { TabsProps } from 'antd';
import { TaskDetailEditor } from './task-detail-editor';
import { TrackingList } from './tracking-list';
import { useOne } from '@refinedev/core';
import { Task } from 'interfaces';

interface TaskDetailProps {
    taskId: number;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ taskId }) => {
    const { query } = useOne<Task>({
        resource: "tasks",
        id: taskId,
    });

    const task = query?.data?.data;

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Note',
            children: query?.isLoading ? (
                <Spin />
            ) : (
                <TaskDetailEditor
                    key={`${taskId}-${task?.note?.substring(0, 20) ?? 'empty'}`}
                    taskId={taskId}
                    initialNote={task?.note}
                />
            ),
        },
        {
            key: '2',
            label: 'Tracking History',
            children: <TrackingList taskId={taskId} />,
        },
        {
            key: '3',
            label: 'Tab 3',
            children: 'Content of Tab Pane 3',
        },
    ];

    const onChange = (key: string) => {
        console.log(key);
    };

    return (
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    );
};