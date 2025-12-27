import { Card, theme } from "antd";
import { Project } from "interfaces";
import { useParams } from "react-router";
import { useOne, HttpError } from "@refinedev/core";

const { useToken } = theme;

export const ProjectDetail = () => {
    const params = useParams()
    const { token } = useToken();

    const {
        result: project,
        query: { isLoading, isError },
    } = useOne<Project, HttpError>({
        resource: "projects",
        id: params.id,
    });

    const items = [
        {
            key: "overview",
            tab: "Overview",
        },
        {
            key: "brainstorm",
            tab: "Brainstorm",
        },
    ]

    return (
        <div>
            <Card title={
                <div>
                    <span>Project: <span style={{ color: token.colorPrimary }}>{project?.name}</span></span>
                </div>
            } tabList={items}>

            </Card>
        </div>
    );
};