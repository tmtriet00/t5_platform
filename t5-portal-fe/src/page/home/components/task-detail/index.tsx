import { Tabs } from 'antd';
import { TabsProps } from 'antd';
import { TaskDetailEditor } from './task-detail-editor';
import { TrackingList } from './tracking-list';

interface TaskDetailProps {
    taskId: number;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ taskId }) => {

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Description',
            children: <TaskDetailEditor />,
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