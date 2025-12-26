import React from "react";
import { Layout, Spin, Alert, DatePicker } from "antd";
import { TimeTrackerInput } from "./components/time-tracker-input";
import { TimeTrackerList } from "./components/time-tracker-list";
import { useTaskByDate } from "./hooks/use-task-by-date";

import dayjs from "dayjs";

const { Content } = Layout;

const Home: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState<string>(dayjs().format("YYYY-MM-DD"));
  const { tasks, weekTotal, loading, error } = useTaskByDate({ date: selectedDate });

  return (
    <Layout className="min-h-screen bg-[#f0f2f5]">
      <Content className="flex flex-col gap-5">
        <div className="flex justify-end">
          <DatePicker size="large" value={dayjs(selectedDate)} onChange={(date) => setSelectedDate(date?.format("YYYY-MM-DD") || "")} />
        </div>
        <TimeTrackerInput />

        {loading ? (
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
          <TimeTrackerList tasks={tasks} weekTotal={weekTotal} />
        )}
      </Content>
    </Layout>
  );
};

export default Home;
