import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import {
  Layout as AntdLayout,
  Avatar,
  Space,
  Switch,
  theme,
  Typography,
  Dropdown,
  MenuProps
} from "antd";
import React, { useContext } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import { User } from "interfaces";
import { Link } from "react-router";
import { supabaseClient } from "../../utility";
import { Button, Tag } from "antd";


const { Text } = Typography;
const { useToken } = theme;

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<User>();
  const { mode, setMode } = useContext(ColorModeContext);
  const [mfaVerified, setMfaVerified] = React.useState<boolean>(false);
  const [needMfaVerification, setNeedMfaVerification] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkMfa = async () => {
      const { data, error } = await supabaseClient.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!error && data) {
        if (data.currentLevel === 'aal2') {
          setMfaVerified(true);
          setNeedMfaVerification(false);
        } else if (data.currentLevel === 'aal1' && data.nextLevel === 'aal2') {
          setMfaVerified(false);
          setNeedMfaVerification(true);
        } else {
          setMfaVerified(false);
          setNeedMfaVerification(false);
        }
      }
    };
    checkMfa();
  }, []);


  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: <Link to="/profile">Profile</Link>,
    },
  ];

  return (
    <AntdLayout.Header
      className={`flex justify-end items-center px-6 h-16 ${sticky ? "sticky top-0 z-[1]" : ""
        }`}
      style={{ backgroundColor: token.colorBgElevated }}
    >
      <Space>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        <Space className="ml-2" size="middle">
          {needMfaVerification && (
            <Link to="/mfa-verify">
              <Button type="primary" danger size="small">
                Verify MFA
              </Button>
            </Link>
          )}
          {mfaVerified && (
            <Tag color="green">MFA Verified</Tag>
          )}

          <Dropdown menu={{ items: menuItems }}>
            <Space style={{ cursor: "pointer" }}>
              {user?.name && <Text strong>{user.name}</Text>}
              {user?.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
            </Space>
          </Dropdown>
        </Space>
      </Space>
    </AntdLayout.Header>
  );
};
