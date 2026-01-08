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

const allMenuItems: MenuItem[] = [
  getItem('Dashboard', '1', <DashboardOutlined />),
  getItem('Profilo', '2', <UserOutlined />),
  getItem('Formazione', '3', <ReadOutlined />),
  getItem('Chatbot', '4', <RobotOutlined />),
  getItem('Crea Segnalazione', '5', <FileAddOutlined />),
  getItem('Risorse', '6', <FolderOutlined />),
];

// Funzione per filtrare i menu in base al ruolo
const getMenuItemsByRole = (ruolo?: string): MenuItem[] => {
  if (ruolo === 'DatoreDiLavoro') {
    // Datore di Lavoro vede solo: Dashboard, Profilo, Crea Segnalazione, Risorse
    return allMenuItems.filter(item => 
      ['1', '2', '5', '6'].includes(item?.key?.toString() || '')
    );
  }
  // Altri ruoli vedono tutto
  return allMenuItems;
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState<{ nome?: string; cognome?: string; email?: string; matricola?: string; ruolo?: string; codiceAzienda?: string } | null>(null);
  const [aziendaNome, setAziendaNome] = useState<string>('');
  const [aziendaCodice, setAziendaCodice] = useState<string>('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(allMenuItems);
  const [avvisi, setAvvisi] = useState<any[]>([]);
  const [avvisiNonLetti, setAvvisiNonLetti] = useState<any[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
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
        // Imposta i menu items in base al ruolo
        setMenuItems(getMenuItemsByRole(user.ruolo));
        
        // Recupera il nome dell'azienda
        if (user.codiceAzienda) {
          fetch(`/api/aziende?codice=${user.codiceAzienda}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.ragioneSociale) {
                setAziendaNome(data.ragioneSociale);
                setAziendaCodice(data.codiceAzienda);
              }
            })
            .catch(err => console.error('Errore nel recupero azienda:', err));
        }
      } catch (error) {
        console.error('Errore nel parsing dei dati utente:', error);
      }
    } else {
      // Se non c'è utente nel localStorage, resetta tutto
      setUserData(null);
      setAvvisi([]);
      setAvvisiNonLetti([]);
      setBadgeCount(0);
      setAziendaNome('');
      setAziendaCodice('');
      setMenuItems(allMenuItems);
    }
  }, []);

  // Listener per il localStorage - ricarica quando viene modificato 'user'
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        const userStr = e.newValue;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setUserData(user);
            setMenuItems(getMenuItemsByRole(user.ruolo));
            // Ricarica gli avvisi per il nuovo utente
            setAvvisi([]);
            setAvvisiNonLetti([]);
            setBadgeCount(0);
            
            // Ricarica il nome dell'azienda
            if (user.codiceAzienda) {
              fetch(`/api/aziende?codice=${user.codiceAzienda}`)
                .then(res => res.json())
                .then(data => {
                  if (data && data.ragioneSociale) {
                    setAziendaNome(data.ragioneSociale);
                    setAziendaCodice(data.codiceAzienda);
                  }
                })
                .catch(err => console.error('Errore nel recupero azienda:', err));
            }
          } catch (error) {
            console.error('Errore nel parsing dei dati utente:', error);
          }
        } else {
          // Logout effettuato
          setUserData(null);
          setAvvisi([]);
          setAvvisiNonLetti([]);
          setBadgeCount(0);
          setAziendaNome('');
          setAziendaCodice('');
          setMenuItems(allMenuItems);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Carica gli avvisi e calcola i non letti
  const loadAvvisi = async () => {
    try {
      const response = await fetch('/api/avvisi', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAvvisi(data);
        
        // Ottieni la lista degli avvisi già letti
        const matricola = userData?.matricola;
        if (matricola) {
          const avvisiLettiStr = localStorage.getItem(`avvisiLetti_${matricola}`);
          const avvisiLetti: string[] = avvisiLettiStr ? JSON.parse(avvisiLettiStr) : [];
          
          // Filtra solo gli avvisi NON creati dall'utente e NON letti
          const nonLetti = data.filter((avviso: any) => 
            avviso.matricola !== matricola && !avvisiLetti.includes(avviso.id)
          );
          
          setAvvisiNonLetti(nonLetti);
          setBadgeCount(nonLetti.length);
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento degli avvisi:', error);
    }
  };

  // Carica gli avvisi quando l'utente è disponibile
  useEffect(() => {
    if (userData?.matricola) {
      loadAvvisi();
      // Ricarica ogni 30 secondi
      const interval = setInterval(loadAvvisi, 30000);
      return () => clearInterval(interval);
    }
  }, [userData]);

  // Funzione per marcare un avviso come letto
  const markAvvisoAsRead = (avvisoId: string) => {
    const matricola = userData?.matricola;
    if (!matricola) return;

    const avvisiLettiStr = localStorage.getItem(`avvisiLetti_${matricola}`);
    const avvisiLetti: string[] = avvisiLettiStr ? JSON.parse(avvisiLettiStr) : [];
    
    if (!avvisiLetti.includes(avvisoId)) {
      avvisiLetti.push(avvisoId);
      localStorage.setItem(`avvisiLetti_${matricola}`, JSON.stringify(avvisiLetti));
      loadAvvisi(); // Ricarica per aggiornare il badge
    }
  };

  // Funzione per marcare tutti gli avvisi come letti
  const markAllAvvisiAsRead = () => {
    const matricola = userData?.matricola;
    if (!matricola) return;

    const avvisiLettiStr = localStorage.getItem(`avvisiLetti_${matricola}`);
    const avvisiLetti: string[] = avvisiLettiStr ? JSON.parse(avvisiLettiStr) : [];
    
    const allAvvisiIds = avvisi
      .filter((avviso: any) => avviso.matricola !== matricola)
      .map((avviso: any) => avviso.id);
    
    const updatedAvvisiLetti = [...new Set([...avvisiLetti, ...allAvvisiIds])];
    localStorage.setItem(`avvisiLetti_${matricola}`, JSON.stringify(updatedAvvisiLetti));
    
    setAvvisiNonLetti([]);
    setBadgeCount(0);
  };

  // RIMOSSO: Non azzera automaticamente il badge quando si entra nella home
  // Ogni utente deve cliccare singolarmente sulle notifiche per marcarle come lette
  // useEffect(() => {
  //   if (pathname === '/home' && badgeCount > 0) {
  //     markAllAvvisiAsRead();
  //   }
  // }, [pathname]);

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

  const notificationMenuItems: MenuProps['items'] = avvisiNonLetti.length > 0
    ? avvisiNonLetti.map((avviso) => ({
        key: avviso.id,
        label: (
          <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <BellOutlined style={{ marginRight: '8px' }} />
            {avviso.titolo}
          </div>
        ),
        onClick: () => {
          markAvvisoAsRead(avviso.id);
          localStorage.setItem('avvisoToScroll', avviso.id);
          router.push(`/home?tab=avvisi&avvisoId=${avviso.id}`);
        },
      }))
    : [
        {
          key: 'empty',
          label: (
            <div style={{ textAlign: 'center', color: '#999', padding: '8px' }}>
              Nessuna nuova notifica
            </div>
          ),
          disabled: true,
        },
      ];

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
        // Reset di tutti gli stati per evitare conflitti tra account
        setUserData(null);
        setAvvisi([]);
        setAvvisiNonLetti([]);
        setBadgeCount(0);
        setMenuItems(allMenuItems);
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
        {!collapsed && aziendaNome && (
          <div
            style={{
              padding: '0 16px',
              marginBottom: '16px',
              textAlign: 'center',
              color: '#fff',
              opacity: 0.85,
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                borderLeft: '3px solid #1890ff',
              }}
            >
              <div>{aziendaNome}</div>
              {aziendaCodice && (
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                  Codice: {aziendaCodice}
                </div>
              )}
            </div>
          </div>
        )}
        <Menu
          theme="dark"
          selectedKeys={selectedKeys}
          mode="inline"
          items={menuItems}
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
            <Dropdown menu={{ items: notificationMenuItems }} placement="bottomRight" trigger={['click']}>
              <Badge count={badgeCount} size="small">
                <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#595959' }} />
              </Badge>
            </Dropdown>
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
