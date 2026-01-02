import React, { useState, useEffect } from "react";
import { useMenu, useLink } from "@refinedev/core";
import { Layout, Menu, Grid, theme, Button } from "antd";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    StarOutlined,
    StarFilled,
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

    // State for favorites
    const [favorites, setFavorites] = useState<string[]>(() => {
        const stored = localStorage.getItem("t5-portal-favorites");
        return stored ? JSON.parse(stored) : [];
    });

    const [collapsed, setCollapsed] = useState<boolean>(false);
    const isMobile = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

    useEffect(() => {
        localStorage.setItem("t5-portal-favorites", JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (e: React.MouseEvent, key: string) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites((prev) => {
            if (prev.includes(key)) {
                return prev.filter((k) => k !== key);
            }
            return [...prev, key];
        });
    };

    const createAntdMenuItem = (item: any) => {
        const isFavorited = favorites.includes(item.key);
        return {
            key: item.key,
            icon: item.icon,
            label: (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Link to={item.route ?? ""} style={{ flex: 1, color: "inherit", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
            ? [
                {
                    key: "others-group",
                    type: "group",
                    label: favoriteItems.length > 0 ? "Others" : undefined,
                    children: otherItems.map(createAntdMenuItem),
                },
            ]
            : []),
    ];

    const renderSider = () => {
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
                        height: "64px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: collapsed ? "0" : "0 12px",
                        borderBottom: `1px solid ${token.colorBorderBg}`,
                    }}
                >
                    {/* Simple logo/title placeholder - relying on props or fallback */}
                    {Title && <Title collapsed={collapsed} />}
                </div>

                <Menu
                    selectedKeys={[selectedKey]}
                    defaultOpenKeys={defaultOpenKeys}
                    mode="inline"
                    style={{ borderRight: 0 }}
                    items={antdMenuItems as any} // Type assertion due to complex item structure
                />
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
            {/* Mobile Drawer/Sider handling could be improved, but sticking to basic Sider for now */}
            {renderSider()}
            {/* Spacer to push content */}
            <div style={{ width: collapsed ? 80 : 200, transition: "width 0.2s" }} />
        </>
    );
};
