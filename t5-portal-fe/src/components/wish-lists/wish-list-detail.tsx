
import { Tabs, List, Typography, Space, Tag } from "antd";
import { useList } from "@refinedev/core";
import dayjs from "dayjs";

interface WishListDetailProps {
    data: any;
}

export const WishListDetail: React.FC<WishListDetailProps> = ({ data }) => {
    const { data: tracksData, isLoading } = useList({
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
        }
    });

    const items = [
        {
            key: '1',
            label: 'Tracks',
            children: (
                <List
                    loading={isLoading}
                    dataSource={tracksData?.data || []}
                    renderItem={(item: any) => (
                        <List.Item>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Space>
                                    <Tag>ID: {item.id}</Tag>
                                    <Typography.Text>Point: {item.point}</Typography.Text>
                                </Space>
                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                    Created: {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                                </Typography.Text>
                            </Space>
                        </List.Item>
                    )}
                />
            ),
        }
    ];

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
};
