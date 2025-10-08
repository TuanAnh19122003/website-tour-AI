import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Spin, Descriptions, Tag, Input } from 'antd';
import UserList from './UserList';
import UserForm from './UserForm';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { formatDate } from '../../../utils/helpers';
import normalizeFileName from '../../../utils/normalizeFileName';
import { toast, Toaster } from 'react-hot-toast';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [roleLoading, setRoleLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchData = useCallback(async (page = 1, pageSize = 5, keyword = search) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/users`, {
                params: { page, pageSize, search: keyword || null },
            });
            const { data, total } = res.data;
            setUsers(data);
            setPagination({ current: page, pageSize, total });
        } catch {
            toast.error('Lỗi khi tải người dùng');
        } finally {
            setLoading(false);
        }
    }, [API_URL, search]);

    const fetchRoles = useCallback(async () => {
        setRoleLoading(true);
        try {
            const res = await axios.get(`${API_URL}/roles`);
            const { data } = res.data;
            setRoles(data);
        } catch {
            toast.error('Lỗi khi tải vai trò');
        } finally {
            setRoleLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchData();
        fetchRoles();
    }, [fetchData, fetchRoles]);

    const handleAdd = () => {
        setEditingUser(null);
        setOpen(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setOpen(true);
    };

    const handleView = (user) => {
        setViewingUser(user);
    };

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${API_URL}/users/${id}`);
            const { success, message: apiMsg } = res.data;
            if (success) {
                toast.success(apiMsg || 'Xóa thành công');
                const remainingItems = users.length - 1;
                const isLastItemOnPage = remainingItems === 0 && pagination.current > 1;
                const newPage = isLastItemOnPage ? pagination.current - 1 : pagination.current;
                fetchData(newPage, pagination.pageSize);
            } else {
                toast.error(apiMsg || 'Thao tác thất bại');
            }
        } catch {
            toast.error('Thao tác thất bại');
        }
    };

    const handleSubmit = async (user) => {
        try {
            const formData = new FormData();
            formData.append('firstname', user.firstname);
            formData.append('lastname', user.lastname);
            formData.append('email', user.email);
            formData.append('password', user.password);
            formData.append('roleId', user.roleId);
            formData.append('phone', user.phone);
            formData.append('is_active', user.is_active ? 1 : 0);

            if (Array.isArray(user.image) && user.image.length > 0) {
                const originalFile = user.image[0].originFileObj;
                const normalizedName = normalizeFileName(originalFile.name);
                const newFile = new File([originalFile], normalizedName, { type: originalFile.type });
                formData.append('image', newFile);
            }

            let res;
            if (editingUser) {
                res = await axios.put(`${API_URL}/users/${editingUser.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await axios.post(`${API_URL}/users`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            const { success, message: apiMsg } = res.data;
            if (success) {
                toast.success(apiMsg || (editingUser ? 'Cập nhật thành công' : 'Thêm thành công'));
                fetchData(pagination.current, pagination.pageSize);
                setOpen(false);
            } else {
                toast.error(apiMsg || 'Thao tác thất bại');
            }
        } catch {
            toast.error('Thao tác thất bại');
        }
    };

    return (
        <div>
            <Toaster position="top-center" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Danh sách người dùng</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                        placeholder="Tìm kiếm người dùng..."
                        value={search}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearch(value);
                            fetchData(1, pagination.pageSize, value);
                        }}
                        allowClear
                        style={{ width: 250 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm
                    </Button>
                </div>
            </div>

            <Spin spinning={loading}>
                <UserList
                    data={users}
                    roles={roles}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    pagination={pagination}
                    onPageChange={fetchData}
                />
            </Spin>

            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                destroyOnClose
                title={editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng'}
            >
                <UserForm
                    initialValues={editingUser}
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                    roles={roles}
                    roleLoading={roleLoading}
                />
            </Modal>

            <Modal
                open={!!viewingUser}
                onCancel={() => setViewingUser(null)}
                centered
                footer={null}
                title="Chi tiết người dùng"
            >
                {viewingUser && (
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="ID">{viewingUser.id}</Descriptions.Item>
                        <Descriptions.Item label="Họ">{viewingUser.lastname}</Descriptions.Item>
                        <Descriptions.Item label="Tên">{viewingUser.firstname}</Descriptions.Item>
                        <Descriptions.Item label="Email">{viewingUser.email}</Descriptions.Item>
                        <Descriptions.Item label="Ảnh đại diện">
                            {viewingUser.image ? (
                                <img src={`http://localhost:5000/${viewingUser.image}`} alt="avatar" style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 10 }} />
                            ) : (
                                <span style={{ color: '#aaa' }}>Không có</span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {viewingUser.is_active ? (
                                <Tag color="green">Hoạt động</Tag>
                            ) : (
                                <Tag color="red">Không hoạt động</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vai trò">
                            {roles.find(r => r.id === viewingUser.roleId)?.name || 'Không xác định'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{formatDate(viewingUser.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">{formatDate(viewingUser.updatedAt)}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default UserPage;
