import {
  List,
  useTable,
  EditButton,
  ShowButton,
  getDefaultSortOrder,
  FilterDropdown,
  useSelect,
} from "@refinedev/antd";
import { Table, Space, Select } from "antd";

import { Post, Category } from "interfaces";

export const PostList: React.FC = () => {
  const { tableProps, sorters } = useTable<Post>({
    sorters: {
      initial: [
        {
          field: "id",
          order: "asc",
        },
      ],
    },
    meta: {
      select: "*, categories(title)",
    },
  });

  const { selectProps } = useSelect<Category>({
    resource: "categories",
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          key="id"
          dataIndex="id"
          title="ID"
          sorter
          defaultSortOrder={getDefaultSortOrder("id", sorters)}
        />
        <Table.Column key="title" dataIndex="title" title="Title" sorter />
        <Table.Column
          key="categoryId"
          dataIndex={["categories", "title"]}
          title="Category"
          defaultSortOrder={getDefaultSortOrder("categories.title", sorters)}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                className="min-w-[200px]"
                mode="multiple"
                placeholder="Select Category"
                {...selectProps}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column<Post>
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
