import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Spin, Descriptions, Input } from 'antd';
import RoleList from './RoleList';
import RoleForm from './RoleForm';
import { PlusOutlined } from "@ant-design/icons";
import { formatDate } from '../../../utils/helpers';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const RolePage = () => {
    const [roles, setRoles] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewingRole, setViewingRole] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchData = useCallback(async (page = 1, pageSize = 5, keyword = search) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/roles`, {
                params: { page, pageSize, search: keyword || null },
            });
            const { data, total } = response.data;
            setRoles(data);
            setPagination({ current: page, pageSize, total });
        } catch {
            toast.error('Lỗi khi tải danh sách vai trò');
        } finally {
            setLoading(false);
        }
    }, [API_URL, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setEditingRole(null);
        setOpen(true);
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setOpen(true);
    };

    const handleView = (role) => {
        setViewingRole(role);
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/roles/${id}`);
            const { success, message: apiMsg } = response.data;
            if (success) {
                toast.success(apiMsg || 'Xóa thành công');
                const remainingItems = roles.length - 1;
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

    const handleSubmit = async (role) => {
        try {
            let response;
            if (editingRole) {
                response = await axios.put(`${API_URL}/roles/${editingRole.id}`, role);
            } else {
                response = await axios.post(`${API_URL}/roles`, role);
            }

            const { success, message: apiMsg } = response.data;
            if (success) {
                toast.success(apiMsg || (editingRole ? 'Cập nhật thành công' : 'Thêm thành công'));
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
            <Toaster position="top-center" reverseOrder={false} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Danh sách vai trò</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                        placeholder="Tìm kiếm vai trò..."
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
                <RoleList
                    data={roles}
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
                title={editingRole ? 'Cập nhật vai trò' : 'Thêm vai trò'}
            >
                <RoleForm
                    initialValues={editingRole}
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <Modal
                open={!!viewingRole}
                onCancel={() => setViewingRole(null)}
                footer={null}
                title="Chi tiết vai trò"
                centered
            >
                {viewingRole && (
                    <Descriptions
                        bordered
                        column={1}
                        size="middle"
                        labelStyle={{ fontWeight: 600, width: 150 }}
                    >
                        <Descriptions.Item label="ID">{viewingRole.id}</Descriptions.Item>
                        <Descriptions.Item label="Mã vai trò">{viewingRole.code}</Descriptions.Item>
                        <Descriptions.Item label="Tên vai trò">{viewingRole.name}</Descriptions.Item>
                        <Descriptions.Item label="Slug">{viewingRole.slug}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{formatDate(viewingRole.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">{formatDate(viewingRole.updatedAt)}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default RolePage;
