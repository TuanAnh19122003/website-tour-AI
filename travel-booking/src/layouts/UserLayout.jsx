import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

function UserLayout() {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']}>
                    <Menu.Item key="home">
                        <Link to="/">Home</Link>
                    </Menu.Item>
                    <Menu.Item key="booking">
                        <Link to="/booking">Booking</Link>
                    </Menu.Item>
                    <Menu.Item key="profile">
                        <Link to="/profile">Profile</Link>
                    </Menu.Item>
                </Menu>
            </Header>
            <Content style={{ padding: '24px' }}>
                <Outlet />
            </Content>
            <Footer style={{ textAlign: 'center' }}>Travel Booking ©2025</Footer>
        </Layout>
    );
}

export default UserLayout;
