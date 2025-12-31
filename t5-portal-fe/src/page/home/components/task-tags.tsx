import React from 'react';
import { Tag, Flex } from 'antd';
import { Task } from 'interfaces';
import { TaskSummaryDto } from 'interfaces/dto/task';

interface TaskTagsProps {
    task: (Task | TaskSummaryDto) & { task_estimations?: any[] };
}

export const TaskTags: React.FC<TaskTagsProps> = ({ task: genericTask }) => {
    const task = genericTask as any;
    const getTagColor = (tag: string) => {
        switch (tag) {
            case 'high':
                return 'red';
            case 'medium':
                return 'gold';
            case 'low':
                return 'geekblue';
            case 'new':
                return 'blue';
            case 'in_progress':
                return 'orange';
            case 'completed':
                return 'green';
            case 'canceled':
                return 'red';
            case 'blocked':
                return 'magenta';
            default:
                return '#ECEFF1';
        }
    };

    const isUnestimated = task.tags?.includes('unestimated') || (task.task_estimations && task.task_estimations.length === 0) || (task.total_estimation_time === 0);
    const activeTag = task.tags?.find((tag: string) => ['active', 'inactive'].includes(tag));
    const otherTags = task.tags?.filter((tag: string) => !['active', 'inactive', 'estimated', 'unestimated'].includes(tag) && tag !== task.status && tag !== task.risk_type);

    return (
        <Flex className='gap-2' align="center">
            {activeTag && (
                <Tag color={getTagColor(activeTag)} style={{ margin: 0 }}>
                    {activeTag}
                </Tag>
            )}
            {task.status && (
                <Tag color={getTagColor(task.status)} style={{ margin: 0 }}>
                    {task.status}
                </Tag>
            )}
            {isUnestimated && (
                <Tag color="red" style={{ margin: 0 }}>
                    unestimated
                </Tag>
            )}
            {task.risk_type && (
                <Tag color={getTagColor(task.risk_type)} style={{ margin: 0 }}>
                    {task.risk_type}
                </Tag>
            )}
            {otherTags?.map((tag: string) => (
                <Tag color={getTagColor(tag)} key={tag} style={{ margin: 0 }}>
                    {tag}
                </Tag>
            ))}
        </Flex>
    );
};
