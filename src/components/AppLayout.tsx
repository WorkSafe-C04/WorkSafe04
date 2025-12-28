'use client';

import React, { useState, useEffect } from 'react';
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
import { Breadcrumb, Layout, Menu, theme, Avatar, Badge, Dropdown, Space, message } from 'antd';
import { useLogout } from '@/hook/logoutHook';

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
  const [userData, setUserData] = useState<{ nome?: string; cognome?: string; email?: string } | null>(null);
  const { logout, loading: logoutLoading } = useLogout();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Mappa il pathname alla chiave del menu e al nome della sezione
  const getMenuKeyFromPath = (path: string): { key: string; name: string } => {
    const pathMap: Record<string, { key: string; name: string }> = {
      '/home': { key: '1', name: 'Dashboard' },
      '/profilo': { key: '2', name: 'Profilo' },
      '/formazione': { key: '3', name: 'Formazione' },
      '/chatbot': { key: '4', name: 'Chatbot' },
      '/creaSegnalazione': { key: '5', name: 'Crea Segnalazione' },
      '/risorse': { key: '6', name: 'Risorse' },

    };
    return pathMap[path] || { key: '1', name: 'Dashboard' };
  };

  const currentMenu = getMenuKeyFromPath(pathname || '/home');
  const selectedKeys = [currentMenu.key];
  const currentSection = currentMenu.name;

  // Recupera i dati dell'utente dal localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
      } catch (error) {
        console.error('Errore nel parsing dei dati utente:', error);
      }
    }
  }, []);

  const handleMenuClick = (e: any) => {
    const routeMap: Record<string, string> = {
      '1': '/home',
      '2': '/profilo',
      '3': '/formazione',
      '4': '/chatbot',
      '5': '/creaSegnalazione',
      '6': '/risorse',
    };
    
    const path = routeMap[e.key];
    if (path) {
      router.push(path);
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

  const handleUserMenuClick: MenuProps['onClick'] = async ({ key }) => {
    if (key === 'logout') {
      try {
        await logout();
        localStorage.removeItem('user');
        message.success('Logout effettuato con successo');
        router.push('/auth/login');
      } catch (error) {
        message.error('Errore durante il logout');
      }
    } else if (key === 'profile') {
      router.push('/profilo');
    } else if (key === 'settings') {
      router.push('/impostazioni');
    }
  };

  // Determina il nome da mostrare
  const displayName = userData?.nome && userData?.cognome 
    ? `${userData.nome} ${userData.cognome}`
    : userData?.email?.split('@')[0] || 'Utente';

  // Iniziali per l'avatar
  const avatarText = userData?.nome && userData?.cognome
    ? `${userData.nome[0]}${userData.cognome[0]}`.toUpperCase()
    : displayName[0].toUpperCase();

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
        <Menu 
          theme="dark" 
          selectedKeys={selectedKeys} 
          mode="inline" 
          items={items} 
          onClick={handleMenuClick} 
        />
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
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1890ff' }}>
                  {avatarText}
                </Avatar>
                <span style={{ color: '#001529' }}>{displayName}</span>
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
