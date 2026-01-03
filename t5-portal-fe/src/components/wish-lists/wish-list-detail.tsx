
import { Tabs, Table, Button } from "antd";
import { useList, useOne } from "@refinedev/core";
import { DeleteButton } from "@refinedev/antd";
import dayjs from "dayjs";
import { useRef } from "react";
import { AddTrackModal, AddTrackModalRef } from "../modals";
import { WishListItem } from "interfaces/model/wish-list-item";
import { roundDecimal } from "utility/number";

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
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            width: 100,
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Actions',
            dataIndex: 'id',
            key: 'actions',
            width: 80,
            render: (value: string) => <DeleteButton hideText size="small" recordItemId={value} resource="wish_list_items_track" />
        }
    ];

    const items = [
        {
            key: '1',
            label: `Tracks (${roundDecimal((tracksData?.data?.reduce((total, item) => total + item.point, 0) ?? 0) / (data?.amount || 1) * 100, 2)}%)`,
            children: (
                <Table
                    loading={isLoading}
                    dataSource={tracksData?.data || []}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
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
                    <div>
                        <Button type="primary" size="small" onClick={() => addTrackModalRef.current?.open(data.id)}>
                            Add Track
                        </Button>
                    </div>
                }
            />
            <AddTrackModal ref={addTrackModalRef} />
        </div>
    );
};
