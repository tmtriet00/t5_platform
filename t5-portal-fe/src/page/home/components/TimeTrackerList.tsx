import React from 'react';
import { Card, Typography, Flex, Empty } from 'antd';
import { TaskGroup } from './types';
import { TimeTrackerItem } from './TimeTrackerItem';

const { Text } = Typography;

interface TimeTrackerListProps {
  groups: TaskGroup[];
  weekTotal: string;
}

export const TimeTrackerList: React.FC<TimeTrackerListProps> = ({ groups, weekTotal }) => {
  if (groups.length === 0) {
    return (
      <div className="mt-4">
        <Empty
          description="No time entries yet"
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div>
      <Flex
        justify="space-between"
        align="center"
        className="mb-2 px-1"
      >
        <Text className="text-gray-500 text-[13px] font-medium">This week</Text>
        <div className="text-gray-500 text-[13px]">
          Week total: <span className="text-gray-800 font-bold ml-1 text-base">{weekTotal}</span>
        </div>
      </Flex>

      {groups.map((group) => (
        <Card
          key={group.dateLabel}
          bordered
          className="mb-4 overflow-hidden rounded-sm shadow-sm border-gray-200"
          styles={{ body: { padding: 0 } }}
        >
          <div
            className="px-4 py-2 border-b bg-[#EAEEF2] border-gray-200"
          >
            <Flex justify="space-between" align="center">
              <span className="text-gray-500 font-medium text-[13px]">{group.dateLabel}</span>
              <div className="text-gray-500 text-[13px]">
                Total: <span className="text-gray-600 font-bold ml-1">{group.totalDuration}</span>
              </div>
            </Flex>
          </div>

          <div>
            {group.tasks.map((task) => (
              <TimeTrackerItem key={task.id} task={task} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
