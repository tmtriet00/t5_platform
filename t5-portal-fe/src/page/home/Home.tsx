import React from "react";
import { Layout, Spin, Alert } from "antd";
import { TimeTrackerInput } from "./components/TimeTrackerInput";
import { TimeTrackerList } from "./components/TimeTrackerList";
import { useTaskByDate } from "./hooks/useTaskByDate";

const { Content } = Layout;

const Home: React.FC = () => {
  const { tasks, weekTotal, loading, error } = useTaskByDate();

  return (
    <Layout className="min-h-screen bg-[#f0f2f5]">
      <Content className="flex flex-col gap-5">
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
