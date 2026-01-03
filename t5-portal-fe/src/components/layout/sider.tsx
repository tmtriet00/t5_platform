import React, { useState, useEffect } from "react";
import { TenantSwitcher } from "./tenant-switcher";
import { useMenu, useLink, useList, useCreate, useUpdate } from "@refinedev/core";
import { Configuration } from "../../interfaces/model/configuration";
import { Layout, Menu, Grid, theme, Button, Drawer } from "antd";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    StarOutlined,
    StarFilled,
    BarsOutlined,
} from "@ant-design/icons";
import type { RefineThemedLayoutSiderProps } from "@refinedev/antd";

const { Sider } = Layout;
const { useToken } = theme;

export const CustomSider: React.FC<RefineThemedLayoutSiderProps> = ({
    Title: TitleFromProps,
    meta,
}) => {
    const { token } = useToken();
    const { menuItems, selectedKey, defaultOpenKeys } = useMenu({ meta });
    const breakpoint = Grid.useBreakpoint();
    const Link = useLink();
    const Title = TitleFromProps;

    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [mobileSiderOpen, setMobileSiderOpen] = useState<boolean>(false);
    const isMobile = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

    const [favorites, setFavorites] = useState<string[]>([]);
    const { mutate: mutateCreate } = useCreate();
    const { mutate: mutateUpdate } = useUpdate();

    const { query } = useList<Configuration>({
        resource: "configurations",
        filters: [
            {
                field: "config_key",
                operator: "eq",
                value: "favorite_menu",
            },
        ],
    });

    const configData = query?.data;
    const isConfigRefLoading = query?.isLoading;
    const configItem = configData?.data?.[0];

    useEffect(() => {
        if (configItem && configItem.config_value) {
            try {
                const parsedFavorites = JSON.parse(configItem.config_value);
                if (Array.isArray(parsedFavorites)) {
                    setFavorites(parsedFavorites);
                }
            } catch (e) {
                console.error("Failed to parse favorites configuration", e);
            }
        }
    }, [configItem]);


    const toggleFavorite = (e: React.MouseEvent, key: string) => {
        e.preventDefault();
        e.stopPropagation();

        let newFavorites: string[] = [];
        if (favorites.includes(key)) {
            newFavorites = favorites.filter((k) => k !== key);
        } else {
            newFavorites = [...favorites, key];
        }

        setFavorites(newFavorites);

        const configValue = JSON.stringify(newFavorites);

        if (configItem) {
            mutateUpdate({
                resource: "configurations",
                id: configItem.id,
                values: {
                    config_value: configValue,
                },
            });
        } else {
            mutateCreate({
                resource: "configurations",
                values: {
                    config_key: "favorite_menu",
                    config_value: configValue,
                    config_category: "system",
                    description: "User favorites menu items",
                },
            });
        }
    };

    const createAntdMenuItem = (item: any) => {
        const isFavorited = favorites.includes(item.key);
        return {
            key: item.key,
            icon: item.icon,
            label: (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Link to={item.route ?? ""} style={{ flex: 1, color: "inherit", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => isMobile && setMobileSiderOpen(false)}>
                        {item.label}
                    </Link>
                    <Button
                        type="text"
                        size="small"
                        onClick={(e) => toggleFavorite(e, item.key)}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                            minWidth: "32px",
                            height: "32px",
                            marginRight: "-8px",
                            color: isFavorited ? token.colorWarning : token.colorTextSecondary,
                            zIndex: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        icon={isFavorited ? <StarFilled /> : <StarOutlined />}
                    />
                </div>
            ),
            title: item.label,
        };
    };

    // Group items
    const favoriteItems = menuItems.filter((item) => favorites.includes(item.key));
    const otherItems = menuItems.filter((item) => !favorites.includes(item.key));

    const antdMenuItems = [
        ...(favoriteItems.length > 0
            ? [
                {
                    key: "favorites-group",
                    type: "group",
                    label: "Favorites",
                    children: favoriteItems.map(createAntdMenuItem),
                },
            ]
            : []),
        ...(favoriteItems.length > 0 && otherItems.length > 0
            ? [{ type: 'divider' }]
            : []
        ),
        ...(otherItems.length > 0
            ? (favoriteItems.length > 0
                ? [
                    {
                        key: "others-submenu",
                        label: "Others",
                        children: otherItems.map(createAntdMenuItem),
                    },
                ]
                : otherItems.map(createAntdMenuItem))
            : []),
    ];

    const renderMenu = () => (
        <Menu
            selectedKeys={[selectedKey]}
            defaultOpenKeys={defaultOpenKeys}
            mode="inline"
            style={{ borderRight: 0 }}
            items={antdMenuItems as any} // Type assertion due to complex item structure
        />
    );

    const renderSider = () => {
        if (isMobile) {
            return (
                <>
                    {!mobileSiderOpen && (
                        <Button
                            type="text"
                            icon={<BarsOutlined />}
                            onClick={() => setMobileSiderOpen(true)}
                            style={{
                                position: "fixed",
                                top: 16,
                                left: 16,
                                zIndex: 1001,
                                backgroundColor: token.colorBgContainer,
                            }}
                        />
                    )}
                    <Drawer
                        placement="left"
                        closable={false}
                        onClose={() => setMobileSiderOpen(false)}
                        open={mobileSiderOpen}
                        width={200}
                        styles={{ body: { padding: 0 } }}
                        zIndex={1002}
                    >
                        <div
                            style={{
                                height: "auto",
                                minHeight: "64px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                borderBottom: `1px solid ${token.colorBorderBg}`,
                                padding: "12px"
                            }}
                        >
                            {Title && <Title collapsed={false} />}
                            <div style={{ width: "100%", marginTop: 8 }}>
                                <TenantSwitcher />
                            </div>
                        </div>
                        {renderMenu()}
                    </Drawer>
                </>
            );
        }

        return (
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                breakpoint="lg"
                trigger={null}
                style={{
                    overflow: "auto",
                    height: "100vh",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 999,
                    backgroundColor: token.colorBgContainer,
                    borderRight: `1px solid ${token.colorBorderBg}`,
                }}
            >
                <div
                    style={{
                        height: "auto",
                        minHeight: "64px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: collapsed ? "12px 0" : "12px",
                        borderBottom: `1px solid ${token.colorBorderBg}`,
                    }}
                >
                    {Title && <Title collapsed={collapsed} />}
                    <div style={{ width: "100%", marginTop: 8, display: collapsed ? 'none' : 'block' }}>
                        <TenantSwitcher />
                    </div>
                </div>

                {renderMenu()}
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        position: "absolute",
                        bottom: 16,
                        left: collapsed ? "50%" : 16,
                        transform: collapsed ? "translateX(-50%)" : "none",
                        width: collapsed ? 32 : "calc(100% - 32px)",
                    }}
                />
            </Sider>
        );
    };

    return (
        <>
            {renderSider()}
            {/* Spacer to push content */}
            <div style={{ width: isMobile ? 0 : (collapsed ? 80 : 200), transition: "width 0.2s" }} />
        </>
    );
};
