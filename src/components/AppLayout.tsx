'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  UserOutlined,
  ReadOutlined,
  RobotOutlined,
  FileAddOutlined,
  FolderOutlined,
  SafetyOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, theme, Avatar, Badge, Dropdown, Space } from 'antd';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Dashboard', '1', <DashboardOutlined />),
  getItem('Profilo', '2', <UserOutlined />),
  getItem('Formazione', '3', <ReadOutlined />),
  getItem('Chatbot', '4', <RobotOutlined />),
  getItem('Crea Segnalazione', '5', <FileAddOutlined />),
  getItem('Risorse', '6', <FolderOutlined />),
];

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [currentSection, setCurrentSection] = useState('Dashboard');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e: any) => {
    const routeMap: Record<string, { path: string; name: string }> = {
      '1': { path: '/', name: 'Dashboard' },
      '2': { path: '/profilo', name: 'Profilo' },
      '3': { path: '/formazione', name: 'Formazione' },
      '4': { path: '/chatbot', name: 'Chatbot' },
      '5': { path: '/segnalazione', name: 'Crea Segnalazione' },
      '6': { path: '/risorse', name: 'Risorse' },
    };
    
    const route = routeMap[e.key];
    if (route) {
      setCurrentSection(route.name);
      router.push(route.path);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profilo',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Impostazioni',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Esci',
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div 
          style={{
            height: '64px',
            margin: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? '24px' : '20px',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
        >
          <SafetyOutlined style={{ fontSize: collapsed ? '32px' : '28px', marginRight: collapsed ? 0 : '12px' }} />
          {!collapsed && <span>WorkSafe</span>}
        </div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={handleMenuClick} />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            padding: '0 24px', 
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: '500', color: '#001529' }}>
            Sistema di Gestione Sicurezza sul Lavoro
          </div>
          <Space size="large">
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#595959' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                <span style={{ color: '#001529' }}>Bill</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <div style={{ margin: '16px 0', fontSize: '16px', fontWeight: '500', color: '#595959' }}>
            Sezione attuale: <span style={{ color: '#1890ff' }}>{currentSection}</span>
          </div>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          WorkSafe ©{new Date().getFullYear()} Created by worksafeDevTeam
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
