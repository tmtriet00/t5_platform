import React from 'react';
import { Flex, Typography, Tag, Button, theme, Badge } from 'antd';
import {
  DollarOutlined,
  CalendarOutlined,
  CaretRightOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { TimeEntry } from './types';

const { Text } = Typography;

interface TimeTrackerItemProps {
  entry: TimeEntry;
}

export const TimeTrackerItem: React.FC<TimeTrackerItemProps> = ({ entry }) => {
  const { token } = theme.useToken();

  return (
    <div
      className="group border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50 h-14 flex items-center bg-white"
    >
      {/* Description and Project */}
      <div className="flex-1 px-4 flex items-center min-w-0 pr-4">
        <span className="font-medium text-gray-700 text-[15px] mr-2 truncate">
          {entry.description || '(No description)'}
        </span>
        {entry.project && (
          <div className="flex items-center whitespace-nowrap">
            <span className="mx-2 text-gray-300">•</span>
            <span style={{ color: entry.project.color }} className="font-medium max-w-[150px] truncate">
              {entry.project.name}
            </span>
          </div>
        )}
      </div>

      {/* Tags & Billable & Actions - Separated sections with dotted borders */}

      {/* Tags */}
      <div className="h-full flex items-center border-l-2 border-dotted border-gray-200 px-4 min-w-[100px] justify-end">
        {entry.tags && entry.tags.length > 0 && (
          <Flex gap="4px">
            {entry.tags.map(tag => (
              <span key={tag} className="text-[11px] font-medium text-[#00A0D2] bg-[#E1F5FE] px-2 py-0.5 rounded-sm uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </Flex>
        )}
      </div>

      {/* Billable */}
      <div className="h-full flex items-center justify-center border-l-2 border-dotted border-gray-200 w-12 text-center">
        <DollarOutlined
          className={`text-lg ${entry.billable ? 'text-[#00A0D2]' : 'text-gray-300'}`}
        />
      </div>

      {/* Time Range */}
      <div className="h-full flex items-center justify-center border-l-2 border-dotted border-gray-200 w-[180px]">
        <span className="text-gray-500 text-[14px] font-medium">
          {entry.startTime} - {entry.endTime}
        </span>
        <Button type="text" size="small" icon={<CalendarOutlined className="text-gray-400" />} className="ml-1 flex items-center justify-center" />
      </div>

      {/* Duration */}
      <div className="h-full flex items-center justify-center border-l-2 border-dotted border-gray-200 w-[80px]">
        <span className="text-gray-800 font-bold text-[16px]">
          {entry.duration}
        </span>
      </div>

      {/* Play Action */}
      <div className="h-full flex items-center justify-center border-l-2 border-dotted border-gray-200 w-14">
        <Button
          type="text"
          icon={<CaretRightOutlined className="text-gray-500 text-xl hover:text-[#00A0D2]" />}
          className="flex items-center justify-center w-full h-full"
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
