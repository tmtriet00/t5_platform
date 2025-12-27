import { Card, theme } from "antd";
import { Project } from "interfaces";
import { useParams } from "react-router";
import { useOne, HttpError } from "@refinedev/core";
import { useState } from "react";
import { AgGridReact } from 'ag-grid-react';

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

    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState([
        { make: "Tesla", model: "Model Y", price: 64950, electric: true },
        { make: "Ford", model: "F-Series", price: 33850, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    ]);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { field: "make" },
        { field: "model" },
        { field: "price" },
        { field: "electric" }
    ]);

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