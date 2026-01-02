
import { List } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { WishListTable } from "../../components/wish-lists";

export const WishListList = () => {
    const { query } = useList({
        resource: "wish_list_items",
        pagination: {
            mode: "off"
        },
        sorters: [
            {
                field: "created_at",
                order: "desc",
            },
        ],
    });

    const { data: listData, isLoading } = query;

    return (
        <List>
            <WishListTable
                rowData={listData?.data || []}
                isLoading={isLoading}
            />
        </List>
    );
};
