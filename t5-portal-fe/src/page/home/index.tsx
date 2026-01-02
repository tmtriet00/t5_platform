import React from "react";
import { Layout, Spin, Alert, DatePicker, Segmented } from "antd";
import { UnorderedListOutlined, CalendarOutlined } from "@ant-design/icons";
import { TimeTrackerInput } from "./components/time-tracker-input";
import { TimeTrackerList } from "./components/time-tracker-list";
import { TimelineChart } from "./components/timeline-chart";
import { useTaskByDate } from "./hooks/use-task-by-date";
import { TimeSummaryFromTask } from "./components/time-summary-from-task";

import dayjs from "dayjs";

const { Content } = Layout;

const Home: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState<string>(dayjs().format("YYYY-MM-DD"));
  const [viewMode, setViewMode] = React.useState<'list' | 'timeline'>('list');
  const { tasks, loading, error } = useTaskByDate({ date: selectedDate });

  return (
    <Layout className="min-h-screen bg-[#f0f2f5]">
      <Content className="flex flex-col gap-5">
        <div className="flex justify-end">
          <DatePicker size="large" value={dayjs(selectedDate)} onChange={(date) => setSelectedDate(date?.format("YYYY-MM-DD") || "")} />
        </div>
        <TimeTrackerInput />

        <div className="flex justify-between items-center">
          <TimeSummaryFromTask tasks={tasks} />
          <Segmented
            options={[
              { label: 'List', value: 'list', icon: <UnorderedListOutlined /> },
              { label: 'Timeline', value: 'timeline', icon: <CalendarOutlined /> },
            ]}
            value={viewMode}
            onChange={(value) => setViewMode(value as 'list' | 'timeline')}
          />
        </div>

        {viewMode === 'timeline' && <TimelineChart date={selectedDate} />}

        {viewMode === 'list' && (
          loading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert
              message="Error loading time entries"
              description={error.message}
              type="error"
              showIcon
              className="mt-4"
            />
          ) : (
            <TimeTrackerList tasks={tasks} />
          )
        )}

        <div className="flex justify-center mt-8">
          <a href="/daily-notes" className="text-blue-500 hover:underline">
            Go to Daily Notes
          </a>
        </div>
      </Content>
    </Layout>
  );
};

export default Home;
