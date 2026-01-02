
import { Tabs, Table, Button } from "antd";
import { useList } from "@refinedev/core";
import dayjs from "dayjs";
import { useRef } from "react";
import { AddTrackModal, AddTrackModalRef } from "../modals";

interface WishListDetailProps {
    data: any;
}

export const WishListDetail: React.FC<WishListDetailProps> = ({ data }) => {
    const addTrackModalRef = useRef<AddTrackModalRef>(null);

    const { query } = useList({
        resource: "wish_list_items_track",
        filters: [
            {
                field: "wish_list_item_id",
                operator: "eq",
                value: data.id,
            },
        ],
        pagination: {
            mode: "off",
        },
        sorters: [
            {
                field: "created_at",
                order: "desc",
            },
        ]
    });

    const { data: tracksData, isLoading } = query || {};

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Point',
            dataIndex: 'point',
            key: 'point',
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
        },
    ];

    const items = [
        {
            key: '1',
            label: 'Tracks',
            children: (
                <Table
                    loading={isLoading}
                    dataSource={tracksData?.data || []}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                    scroll={{ y: 280 }}
                />
            ),
        }
    ];

    return (
        <div className="p-4">
            <Tabs
                defaultActiveKey="1"
                items={items}
                tabBarExtraContent={
                    <Button type="primary" size="small" onClick={() => addTrackModalRef.current?.open(data.id)}>
                        Add Track
                    </Button>
                }
            />
            <AddTrackModal ref={addTrackModalRef} />
        </div>
    );
};
