import React from 'react';
import { Flex, Typography, Button, Tag } from 'antd';
import {
  CalendarOutlined,
  CaretRightOutlined,
  PauseOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { TaskSummaryDto } from 'interfaces/dto/task';
import { formatDuration, formatTime } from 'utility/time';
import { useStopTrackingTask } from '../hooks/use-stop-tracking';

const { Text } = Typography;

interface TaskSummaryItemProps {
  task: TaskSummaryDto;
}

export const TaskSummaryItem: React.FC<TaskSummaryItemProps> = ({ task }) => {
  const useStopTrackingReturn = useStopTrackingTask();

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'high':
        return '#be1f2edd';
      case 'medium':
        return '#9f942fff';
      case 'low':
        return '#C8E6C9';
      case 'active':
        return '#a8eeabff';
      case 'inactive':
        return '#bec9beff';
      default:
        return '#ECEFF1';
    }
  }

  return (
    <div
      className="group border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50 h-14 flex items-center bg-white"
    >
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
      {task.tags && task.tags.length > 0 && (
        <div className="h-full flex items-center border-r-dotted border-gray-200 px-4 min-w-[100px] justify-end">

          <Flex gap="4px">
            {task.tags.map(tag => (
              <span key={tag} style={{ backgroundColor: getTagColor(tag) }} className="text-[11px] font-medium px-2 py-0.5 rounded-sm uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </Flex>
        </div>
      )}

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
        <Button
          type="text"
          icon={<MoreOutlined className="text-gray-400 text-lg" />}
          className="flex items-center justify-center w-full h-full"
        />
      </div>

    </div>
  );
};
