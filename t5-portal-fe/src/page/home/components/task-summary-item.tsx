import React, { useState } from 'react';
import { Flex, Typography, Button, Tag, Dropdown, MenuProps } from 'antd';
import {
  CalendarOutlined,
  CaretRightOutlined,
  PauseOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  RightOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useUpdate, useInvalidate } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { TaskSummaryDto } from 'interfaces/dto/task';
import { formatDuration, formatTime } from 'utility/time';
import { useStopTrackingTask } from '../hooks/use-stop-tracking';

const { Text } = Typography;

interface TaskSummaryItemProps {
  task: TaskSummaryDto;
}

export const TaskSummaryItem: React.FC<TaskSummaryItemProps> = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const useStopTrackingReturn = useStopTrackingTask();
  const { mutate: updateTask } = useUpdate();
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'high':
        return 'red';
      case 'medium':
        return 'gold';
      case 'low':
        return 'geekblue';
      case 'active':
        return 'green';
      case 'inactive':
        return '#bec9beff';
      case 'unestimated':
        return 'red';
      case 'estimated':
        return 'cyan';
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
  }

  const activeTag = task.tags?.find(tag => ['active', 'inactive'].includes(tag));
  const estimatedTag = task.tags?.find(tag => ['estimated', 'unestimated'].includes(tag));
  const otherTags = task.tags?.filter(tag => !['active', 'inactive', 'estimated', 'unestimated'].includes(tag));

  const menuItems: MenuProps['items'] = [
    {
      key: 'completed',
      label: 'Mark as completed',
      icon: <CheckCircleOutlined />,
      onClick: () => {
        updateTask({
          resource: 'tasks',
          id: task.id,
          values: { status: 'completed' },
          successNotification: { message: 'Task marked as completed', type: 'success' },
        }, {
          onSuccess: () => {
            invalidate({
              resource: 'tasks',
              invalidates: ['all'],
            });
            queryClient.invalidateQueries({
              queryKey: ['list_task_tracked_by_date'],
            });
          }
        });
      }
    }
  ];

  return (
    <>
      <div
        className="group border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50 h-14 flex items-center bg-white"
      >
        {/* Expand Icon */}
        <div className="h-full flex items-center justify-center w-10 border-r-2 border-dotted border-gray-200">
          <Button
            type="text"
            icon={expanded ? (
              <DownOutlined className="text-gray-500 text-sm" />
            ) : (
              <RightOutlined className="text-gray-500 text-sm" />
            )}
            className="flex items-center justify-center w-full h-full"
            onClick={() => setExpanded(!expanded)}
          />
        </div>

        {/* Task Name and Project */}
        <div className="flex-1 px-4 flex items-center min-w-0 pr-4">
          <span className="font-medium text-gray-700 text-[15px] mr-2 truncate">
            {task.name || '(No task name)'}
          </span>
          <span>
            <Tag color="blue">{formatDuration(task.time_entry_total_duration ?? 0)}</Tag>
          </span>
          {/* {task.project && (
            <div className="flex items-center whitespace-nowrap">
              <span className="mx-2 text-gray-300">•</span>
              <span style={{ color: task.project.color }} className="font-medium max-w-[150px] truncate">
                {task.project.name}
              </span>
            </div>
          )} */}
        </div>

        {/* Tags */}
        <div className="h-full flex items-center border-r-dotted border-gray-200 px-4 min-w-[100px] justify-end">
          <Flex gap="4px">
            {activeTag && <Tag color={getTagColor(activeTag)}>{activeTag}</Tag>}
            {task.status && <Tag color={getTagColor(task.status)}>{task.status}</Tag>}
            {estimatedTag && <Tag color={getTagColor(estimatedTag)}>{estimatedTag}</Tag>}
            {otherTags?.map(tag => (
              <Tag color={getTagColor(tag)} key={tag}>{tag}</Tag>
            ))}
          </Flex>
        </div>

        {/* Time Range */}
        {/* <div className="h-full flex items-center justify-center border-l-2 border-dotted border-gray-200 w-[180px]">
          <span className="text-gray-500 text-[14px] font-medium">
            {formatTime(task?.time_entries?.[0].start_time ?? '')} - {formatTime(task?.time_entries?.[0].end_time ?? '')}
          </span>
          <Button type="text" size="small" icon={<CalendarOutlined className="text-gray-400" />} className="ml-1 flex items-center justify-center" />
        </div> */}

        {/* Duration */}
        <div className="h-full flex items-center justify-center border-l-2 border-dotted border-gray-200 w-[100px]">
          <span className="text-gray-800 font-bold text-[16px]">
            {formatDuration(task.time_entry_active_duration ?? 0)}
          </span>
        </div>

        {/* Play Action */}
        <div className="h-full flex items-center justify-center border-l-2 border-dotted border-gray-200 w-14">
          <Button
            type="text"
            icon={task.tags?.includes('active') ? (
              <PauseOutlined className="text-gray-500 text-xl hover:text-[#00A0D2]" />
            ) : (
              <CaretRightOutlined className="text-gray-500 text-xl hover:text-[#00A0D2]" />
            )}
            className="flex items-center justify-center w-full h-full"
            onClick={() => useStopTrackingReturn.mutate({ task })}
          />
        </div>

        {/* Menu Action */}
        <div className="h-full flex items-center justify-center border-l-2 border-dotted border-gray-200 w-10">
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="text"
              icon={<MoreOutlined className="text-gray-400 text-lg" />}
              className="flex items-center justify-center w-full h-full"
            />
          </Dropdown>
        </div>
      </div>

      {/* Expandable Task Details Section */}
      {expanded && (
        <div className="bg-gray-50 border-b border-gray-100 p-4">
          {/* TODO: Add TaskDetail component here */}
          <div className="text-gray-500 text-sm">
            Task details will be displayed here. This component will be developed later.
          </div>
        </div>
      )}
    </>
  );
};
