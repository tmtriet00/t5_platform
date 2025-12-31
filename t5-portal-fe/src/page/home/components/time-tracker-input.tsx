import React, { useState } from "react";
import { Card, Input, Button, Flex, Typography, theme, Divider } from "antd";
import {
  PlusCircleOutlined,
  TagOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { HttpError, useCreate, useList } from '@refinedev/core';
import { Task, TimeEntry } from "interfaces";
import { AutoComplete } from 'antd';
import { debounce } from 'lodash';
import { SearchOutlined } from "@ant-design/icons";
import { useStartTrackingTask } from "../hooks/use-start-tracking";

export const TimeTrackerInput: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const { query } = useList<Task, HttpError>({
    resource: 'tasks',
    filters: [
      {
        field: 'name',
        operator: 'contains',
        value: keyword,
      },
    ],
  });

  const createTaskMutation = useCreate<Task, HttpError>({
    resource: 'tasks',
    mutationOptions: {
      onSuccess: (data) => {
        useStartTrackingTaskReturn.mutate({ task: data.data });
        setKeyword('');
      }
    }
  });

  const useStartTrackingTaskReturn = useStartTrackingTask();

  return (
    <Card className="mb-6 shadow-sm rounded-none border-t-0 border-x-0 border-b border-gray-200" styles={{ body: { padding: "8px 16px" } }}>
      <Flex align="center" className="w-full h-12">
        <AutoComplete
          value={keyword}
          options={(() => {
            const taskOptions = query.data?.data.map((item) => ({
              task: item,
              value: item.id,
              label: item.name,
            })) || [];

            if (taskOptions.length === 0 && keyword) {
              return [
                {
                  value: `NEW_TASK::${keyword}`,
                  label: (
                    <Flex justify="space-between">
                      <span>Track A New Task</span>
                      <span>{keyword}</span>
                    </Flex>
                  ),
                  isNew: true,
                }
              ]
            }

            return taskOptions;
          })()}
          filterOption={false}
          onChange={(value: string) => setKeyword(value)}
          className="flex-1 mr-4"
          onSelect={(_: string, option: any) => {
            if (option.isNew) {
              createTaskMutation.mutate({
                values: {
                  name: keyword,
                  risk_type: 'high',
                }
              });
            } else {
              const selectedTask = option?.task as Task | undefined;
              if (selectedTask) {
                useStartTrackingTaskReturn.mutate({ task: selectedTask });
                setKeyword('');
              }
            }
          }}
        >
          <Input
            size="large"
            placeholder="Search posts or categories"
            suffix={<SearchOutlined />}
            variant="borderless"
            className="text-lg placeholder:text-gray-400"
          />
        </AutoComplete>

        {/* <div className="flex items-center h-full border-l border-dotted border-gray-300 px-4">
          <Button
            type="text"
            className="flex items-center gap-1 text-[#1890ff] hover:text-[#40a9ff] hover:bg-transparent p-0"
            icon={<PlusCircleOutlined className="text-[#1890ff]" />}
          >
            <span className="font-medium text-[15px]">Project</span>
          </Button>
        </div>

        <div className="flex items-center h-full border-l border-dotted border-gray-300 px-3">
          <Button type="text" icon={<TagOutlined className="text-gray-400 text-lg" />} className="w-8 h-8 flex items-center justify-center p-0" />
        </div>

        <div className="flex items-center h-full border-l border-dotted border-gray-300 px-3">
          <Button type="text" icon={<DollarOutlined className="text-gray-400 text-lg" />} className="w-8 h-8 flex items-center justify-center p-0" />
        </div>

        <div className="flex items-center h-full border-l border-dotted border-gray-300 px-6">
          <div className="text-xl font-bold text-gray-800 tabular-nums">00:00:00</div>
        </div>

        <div className="flex items-center h-full pl-4">
          <Button type="primary" className="h-full px-8 rounded-sm bg-[#00A0D2] hover:!bg-[#008fcb] text-white font-bold tracking-wide shadow-none border-none text-[13px]">
            START
          </Button>
        </div>

        <div className="flex flex-col ml-2 gap-0">
          <div className="h-1/2 flex items-center justify-center">
            <Button type="text" icon={<ClockCircleOutlined className="text-[#00A0D2] text-[12px]" />} className="w-6 h-6 min-w-0 p-0" />
          </div>
          <div className="h-1/2 flex items-center justify-center">
            <Button type="text" icon={<UnorderedListOutlined className="text-gray-400 text-[12px]" />} className="w-6 h-6 min-w-0 p-0" />
          </div>
        </div> */}
      </Flex>
    </Card>
  );
};
