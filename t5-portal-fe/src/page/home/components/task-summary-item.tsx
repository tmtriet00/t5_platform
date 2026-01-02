import React, { useState } from 'react';
import { Flex, Typography, Button, Tag, Dropdown, MenuProps, Modal } from 'antd';
import {
  CalendarOutlined,
  CaretRightOutlined,
  PauseOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  RightOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useUpdate, useInvalidate, useDelete, useDeleteMany, useDataProvider } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { TaskSummaryDto } from 'interfaces/dto/task';
import { formatDuration, formatTime } from 'utility/time';
import { useStopTrackingTask } from '../hooks/use-stop-tracking';
import { UpdateRiskTypeModal } from './modals/update-risk-type-modal';
import { TaskDetail } from './task-detail';
import { ModalProviderService } from 'components/modals/modal-provider-wrapper';
import { roundDecimal } from 'utility/number';
import { TaskTags } from './task-tags';

const { Text } = Typography;

interface TaskSummaryItemProps {
  task: TaskSummaryDto;
}

export const TaskSummaryItem: React.FC<TaskSummaryItemProps> = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const [riskTypeModalOpen, setRiskTypeModalOpen] = useState(false);
  const useStopTrackingReturn = useStopTrackingTask();
  const { mutate: updateTask } = useUpdate();
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();

  const { mutate: deleteTask } = useDelete();
  const { mutate: deleteManyTimeEntries } = useDeleteMany();
  const dataProvider = useDataProvider();
  const [modal, contextHolder] = Modal.useModal();

  const handleDelete = () => {
    modal.confirm({
      title: 'Delete Task',
      content: 'Are you sure you want to delete this task? All related time entries will also be deleted.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // 1. Fetch all time entries for this task
          const { data: timeEntries } = await dataProvider().getList({
            resource: 'time_entries',
            filters: [
              {
                field: 'task_id',
                operator: 'eq',
                value: task.id,
              },
            ],
            pagination: {
              mode: 'off',
            },
          });

          // 2. Delete all time entries
          if (timeEntries && timeEntries.length > 0) {
            const timeEntryIds = timeEntries.map((entry: any) => entry.id);
            await new Promise<void>((resolve, reject) => {
              deleteManyTimeEntries(
                {
                  resource: 'time_entries',
                  ids: timeEntryIds,
                },
                {
                  onSuccess: () => resolve(),
                  onError: (error) => reject(error),
                }
              );
            });
          }

          // 3. Delete the task
          deleteTask(
            {
              resource: 'tasks',
              id: task.id,
              successNotification: { message: 'Task deleted successfully', type: 'success' },
            },
            {
              onSuccess: () => {
                invalidate({
                  resource: 'tasks',
                  invalidates: ['all'],
                });
                queryClient.invalidateQueries({
                  queryKey: ['list_task_tracked_by_date'],
                });
              }
            }
          );
        } catch (error) {
          console.error("Error deleting task or time entries:", error);
          modal.error({
            title: 'Error',
            content: 'Failed to delete task or its time entries. Please try again.',
          });
        }
      },
    });
  };

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
    },
    {
      key: 'update-risk-type',
      label: 'Update Risk Type',
      icon: <EditOutlined />,
      onClick: () => setRiskTypeModalOpen(true),
    },
    {
      key: 'add-estimation',
      label: 'Add Estimation',
      icon: <PlusOutlined />,
      onClick: () => ModalProviderService.getAddEstimationForTaskModal().current?.open(task.id),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleDelete,
    },
  ];

  return (
    <>
      {contextHolder}
      <div
        className="group border-b border-gray-100 last:border-b-0 transition-all hover:bg-white hover:shadow-md flex flex-col md:flex-row md:items-center bg-white/50 py-3 md:py-0 md:h-20"
      >
        {/* Mobile Top Row: Expand | Name | Menu */}
        <div className="flex items-center w-full md:w-[45%] md:h-full">
          {/* Expand Icon */}
          <div className="flex items-center justify-center w-10 md:h-full">
            <Button
              type="text"
              size="small"
              icon={expanded ? (
                <DownOutlined className="text-gray-400 text-xs" />
              ) : (
                <RightOutlined className="text-gray-400 text-xs" />
              )
              }
              className="flex items-center justify-center w-full md:h-full"
              onClick={() => setExpanded(!expanded)}
            />
          </div>

          {/* Task Name and Project (Mobile & Desktop) */}
          <div className="flex-1 flex-col px-2 flex items-start justify-center min-w-0 md:h-full md:justify-center gap-1">
            <div className="w-full flex justify-between items-start md:block">
              <span className="font-medium text-gray-700 text-[14px] md:text-[15px] truncate block" title={task.name}>
                {task.name || '(No task name)'}
              </span>

              {/* Mobile Menu Action (moved here) */}
              <div className="md:hidden">
                <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined className="text-gray-400 text-lg" />}
                  />
                </Dropdown>
              </div>
            </div>

            {/* Desktop: Progress Text */}
            <div className="hidden md:block">
              {task.total_estimation_time ? (
                <span className="text-xs text-gray-400">
                  Progress: <span className="font-medium text-blue-600">{roundDecimal((task.time_entry_total_duration ?? 0) / task.total_estimation_time * 100, 0)}%</span>
                  <span className="mx-1">•</span>
                  Est: {formatDuration(task.total_estimation_time)}
                </span>
              ) : (
                <span className="text-xs text-gray-400">No estimation</span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Tags Column */}
        <div className="flex flex-wrap items-center px-4 gap-2 mb-2 md:mb-0 md:h-full md:w-[25%] md:justify-center md:px-2">
          {/* Progress Tag (Mobile Only) */}
          <div className="md:hidden w-full flex justify-between items-center">
            <Tag color="blue" className="mr-0">{formatDuration(task.time_entry_total_duration ?? 0)} {task.total_estimation_time && <span>({roundDecimal((task.time_entry_total_duration ?? 0) / task.total_estimation_time * 100, 0)}% - {formatDuration(task.total_estimation_time ?? 0)})</span>}</Tag>
            <span className='font-small text-gray-500 text-[12px]'>Today: {formatDuration(task.time_entry_total_duration_in_date ?? 0)}</span>
          </div>

          <div className="w-full flex md:justify-center">
            <TaskTags task={task} />
          </div>
        </div>

        {/* Desktop: Tracked Today Column */}
        <div className="hidden md:flex flex-col items-center justify-center w-[15%] h-full border-l border-dotted border-gray-200/50">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Today</span>
          <span className='font-medium text-gray-600 text-[13px]'>{formatDuration(task.time_entry_total_duration_in_date ?? 0)}</span>
        </div>

        {/* Bottom Row: Duration | Play Action | Desktop Menu */}
        <div className="flex items-center justify-between px-4 w-full md:w-[15%] md:h-full md:px-0 md:justify-end md:pr-4">

          {/* Duration */}
          <div className="flex items-center md:justify-end md:w-full md:mr-4">
            <span className={`font-mono text-[16px] font-bold ${task.tags?.includes('active') ? 'text-blue-600' : 'text-gray-700'}`}>
              {formatDuration(task.time_entry_active_duration ?? 0)}
            </span>
          </div>

          <div className="flex items-center gap-1 md:h-full">
            {/* Play Action */}
            <div className="flex items-center justify-center">
              <Button
                type="text"
                shape="circle"
                size="large"
                icon={task.tags?.includes('active') ? (
                  <PauseOutlined className="text-blue-500 text-xl" />
                ) : (
                  <CaretRightOutlined className="text-gray-400 text-xl hover:text-blue-500 transition-colors" />
                )}
                onClick={() => useStopTrackingReturn.mutate({ task })}
              />
            </div>

            {/* Desktop Menu Action */}
            <div className="hidden md:flex items-center justify-center">
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<MoreOutlined className="text-gray-400 text-lg" />}
                />
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Task Details Section */}
      {expanded && (
        <div className="bg-gray-50 border-b border-gray-100 p-4">
          {/* TODO: Add TaskDetail component here */}
          <TaskDetail taskId={task.id} />
        </div>
      )}

      {/* Modals */}
      <UpdateRiskTypeModal
        open={riskTypeModalOpen}
        onClose={() => setRiskTypeModalOpen(false)}
        taskId={task.id}
        currentRiskType={task.risk_type}
      />
    </>
  );
};
