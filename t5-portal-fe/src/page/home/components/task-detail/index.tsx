import { Tabs } from 'antd';
import { TabsProps } from 'antd';
import { TaskDetailEditor } from './task-detail-editor';

export const TaskDetail: React.FC = () => {

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Description',
            children: <TaskDetailEditor />,
        },
        {
            key: '2',
            label: 'Tab 2',
            children: 'Content of Tab Pane 2',
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