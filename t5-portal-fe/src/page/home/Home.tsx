import React from "react";
import { Layout } from "antd";
import { TimeTrackerInput } from "./components/TimeTrackerInput";
import { TimeTrackerList } from "./components/TimeTrackerList";
import { TimeEntryGroup } from "./components/types";

const { Content } = Layout;

const mockGroups: TimeEntryGroup[] = [
  {
    dateLabel: "Today",
    totalDuration: "7:00",
    entries: [
      {
        id: "1",
        description: "Illustrations",
        project: { name: "ACME", color: "#1890ff" },
        tags: ["EUR", "Invoiced"],
        billable: true,
        startTime: "1:00 PM",
        endTime: "3:00 PM",
        duration: "2:00",
        date: "2023-10-27",
      },
      {
        id: "2",
        description: "Fixing bug #212",
        project: { name: "Project X", color: "#722ed1" },
        tags: [],
        billable: true,
        startTime: "9:30 AM",
        endTime: "1:00 PM",
        duration: "3:30",
        date: "2023-10-27",
      },
      {
        id: "3",
        description: "Filing tax return",
        project: { name: "Office", color: "#faad14" },
        tags: ["Overtime"],
        billable: false,
        startTime: "8:00 AM",
        endTime: "9:30 AM",
        duration: "1:30",
        date: "2023-10-27",
      },
    ],
  },
  {
    dateLabel: "Yesterday",
    totalDuration: "7:30",
    entries: [
      {
        id: "4",
        description: "Developing new feature",
        project: { name: "Project X", color: "#722ed1" },
        tags: ["Overtime"],
        billable: true,
        startTime: "3:00 PM",
        endTime: "6:00 PM",
        duration: "3:00",
        date: "2023-10-26",
      },
      {
        id: "5",
        description: "Interface design",
        project: { name: "ACME", color: "#1890ff" },
        tags: [],
        billable: true,
        startTime: "1:30 PM",
        endTime: "3:00 PM",
        duration: "1:30",
        date: "2023-10-26",
      },
      {
        id: "6",
        description: "Lunch",
        project: { name: "Break", color: "#8c8c8c" },
        tags: [],
        billable: false,
        startTime: "1:00 PM",
        endTime: "1:30 PM",
        duration: "0:30",
        date: "2023-10-26",
      },
      {
        id: "7",
        description: "Company training",
        project: { name: "Office", color: "#faad14" },
        tags: [],
        billable: false,
        startTime: "10:00 AM",
        endTime: "1:00 PM",
        duration: "3:00",
        date: "2023-10-26",
      },
    ],
  },
];

const Home: React.FC = () => {
  return (
    <Layout className="min-h-screen bg-[#f0f2f5]">
      <Content className="p-6 max-w-[1000px] mx-auto w-full">
        <TimeTrackerInput />
        <TimeTrackerList groups={mockGroups} weekTotal="34:30" />
      </Content>
    </Layout>
  );
};

export default Home;
