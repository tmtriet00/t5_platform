import React from 'react';
import { Descriptions, Tag } from 'antd';
import { Task } from 'interfaces';
import dayjs from 'dayjs';
import { formatDuration } from 'utility/time';

interface TaskInfoProps {
    task: Task;
}

export const TaskInfo: React.FC<TaskInfoProps> = ({ task }) => {
    return (
        <div className="p-4">
            <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
                <Descriptions.Item label="ID">{task.id}</Descriptions.Item>
                <Descriptions.Item label="Project">{task.project?.name || '-'}</Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Tag color={task.status === 'completed' ? 'green' : 'blue'}>{task.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Risk Type">
                    <Tag color={task.risk_type === 'high' ? 'red' : task.risk_type === 'medium' ? 'orange' : 'green'}>
                        {task.risk_type}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Task Type">{task.task_type || 'work'}</Descriptions.Item>
                <Descriptions.Item label="Start Time">
                    {task.start_time ? dayjs(task.start_time).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Due Time">
                    {task.due_time ? dayjs(task.due_time).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="RRule">
                    {task.rrule || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Remaining Time">
                    {task.remaining_time || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Priority Score">
                    {task.priority_score ?? '-'}
                </Descriptions.Item>
            </Descriptions>
        </div>
    );
};
