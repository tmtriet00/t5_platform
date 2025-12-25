import React from "react";
import { Layout, Spin, Alert } from "antd";
import { TimeTrackerInput } from "./components/TimeTrackerInput";
import { TimeTrackerList } from "./components/TimeTrackerList";
import { useTaskByDate } from "./hooks/useTaskByDate";
import { useSelect } from "@refinedev/antd";
import { TimeEntry } from "../home/components/types";

const { Content } = Layout;

const Home: React.FC = () => {
  const { groups, weekTotal, loading, error } = useTaskByDate();
  const { selectProps } = useSelect<TimeEntry>({
    resource: "time_entries",
  });

  return (
    <Layout className="min-h-screen bg-[#f0f2f5]">
      <Content className="p-6 max-w-[1000px] mx-auto w-full">
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
          <TimeTrackerList groups={groups} weekTotal={weekTotal} />
        )}
      </Content>
    </Layout>
  );
};

export default Home;
