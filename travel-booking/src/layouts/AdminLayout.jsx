import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

function AdminLayout() {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashboard']}>
                    <Menu.Item key="dashboard">
                        <Link to="/admin/dashboard">Dashboard</Link>
                    </Menu.Item>
                    <Menu.Item key="bookings">
                        <Link to="/admin/bookings">Bookings</Link>
                    </Menu.Item>
                    <Menu.Item key="users">
                        <Link to="/admin/users">Users</Link>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: 0 }}>Admin Panel</Header>
                <Content style={{ margin: '16px' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminLayout;
