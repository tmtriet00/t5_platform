import { Card, theme } from "antd";
import { Project, Task } from "interfaces";
import { useParams } from "react-router";
import { useOne, useList, HttpError } from "@refinedev/core";
import { useState } from "react";
import { TaskListTable } from "../../components/tasks/task-list-table";
import { ProjectTimeline } from "../../components/projects/project-timeline";
import { LinkOutlined } from "@ant-design/icons";
import { ProjectNote } from "../../components/projects/project-note";

const { useToken } = theme;

export const ProjectDetail = () => {
    const params = useParams()
    const { token } = useToken();
    const [activeTabKey, setActiveTabKey] = useState("overview");

    const { query: projectQuery } = useOne<Project, HttpError>({
        resource: "projects",
        id: params.id,
    });
    const { data: projectResponse } = projectQuery;
    const project = projectResponse?.data;

    const { query: taskQuery } = useList<Task>({
        resource: "tasks",
        filters: [
            {
                field: "project_id",
                operator: "eq",
                value: params.id,
            },
        ],
        sorters: [
            {
                field: "id",
                order: "desc",
            },
        ],
        queryOptions: {
            enabled: !!params.id,
        }
    });
    const { data: taskResponse, isLoading: isTaskLoading } = taskQuery;
    const tasks = taskResponse?.data || [];

    const items = [
        {
            key: "overview",
            tab: "Overview",
        },
        {
            key: "note",
            tab: "Note",
        },
    ]

    const renderContent = () => {
        if (activeTabKey === "overview") {
            return (
                <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ flex: 2 }}>
                        <TaskListTable
                            rowData={tasks}
                            isLoading={isTaskLoading}
                            projectId={project?.id}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <ProjectTimeline />
                    </div>
                </div>
            );
        }
        return <ProjectNote projectId={project?.id} noteId={project?.note_id} />;
    };

    return (
        <div>
            <Card
                title={
                    <div className="flex gap-1">
                        <span>Project: <span style={{ color: token.colorPrimary }}>{project?.name}</span></span>
                        {
                            project?.reference_link && (
                                <LinkOutlined style={{ color: token.colorPrimary }} onClick={() => window.open(project?.reference_link, "_blank")} />
                            )
                        }
                    </div>
                }
                tabList={items}
                activeTabKey={activeTabKey}
                onTabChange={setActiveTabKey}
            >
                {renderContent()}
            </Card>
        </div>
    );
};