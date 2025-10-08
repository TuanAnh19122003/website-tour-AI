import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Spin, Descriptions, Input } from 'antd';
import ContactForm from './ContactForm';
import ContactList from './ContactList';
import { PlusOutlined } from "@ant-design/icons";
import { formatDate } from '../../../utils/helpers';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const ContactPage = () => {
    const [contacts, setContacts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewingContact, setViewingContact] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchContact = useCallback(async (page = 1, pageSize = 5, keyword = search) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/contacts`, {
                params: { page, pageSize, search: keyword || null },
            });

            const { data, total } = response.data;
            setContacts(data);
            setPagination({ current: page, pageSize, total });
        } catch {
            toast.error('Lỗi khi tải người dùng');
        } finally {
            setLoading(false);
        }
    }, [API_URL, search]);

    useEffect(() => {
        fetchContact();
    }, [fetchContact]);

    const handleAdd = () => {
        setEditingContact(null);
        setOpen(true);
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setOpen(true);
    };

    const handleView = (contact) => {
        setViewingContact(contact);
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/contacts/${id}`);
            const { success, message: apiMsg } = response.data;

            if (success) {
                toast.success(apiMsg || 'Xóa thành công');
                const remainingItems = contacts.length - 1;
                const isLastItemOnPage = remainingItems === 0 && pagination.current > 1;
                const newPage = isLastItemOnPage ? pagination.current - 1 : pagination.current;
                fetchContact(newPage, pagination.pageSize);
            } else {
                toast.error(apiMsg || 'Thao tác thất bại');
            }
        } catch {
            toast.error('Thao tác thất bại');
        }
    };

    const handleSubmit = async (contact) => {
        try {
            let response;
            if (editingContact) {
                response = await axios.put(`${API_URL}/contacts/${editingContact.id}`, contact);
            } else {
                response = await axios.post(`${API_URL}/contacts`, contact);
            }

            const { success, message: apiMsg } = response.data;
            if (success) {
                toast.success(apiMsg || (editingContact ? 'Cập nhật thành công' : 'Thêm thành công'));
                fetchContact(pagination.current, pagination.pageSize);
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
                <h2>Danh sách liên hệ</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                        placeholder="Tìm kiếm liên hệ..."
                        value={search}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearch(value);
                            fetchContact(1, pagination.pageSize, value);
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
                <ContactList
                    data={contacts}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    pagination={pagination}
                    onPageChange={fetchContact}
                />
            </Spin>

            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                destroyOnHidden
                title={editingContact ? 'Cập nhật liên hệ' : 'Thêm liên hệ'}
            >
                <ContactForm
                    initialValues={editingContact}
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <Modal
                open={!!viewingContact}
                onCancel={() => setViewingContact(null)}
                footer={null}
                title="Chi tiết liên hệ"
                centered
            >
                {viewingContact && (
                    <Descriptions
                        bordered
                        column={1}
                        size="middle"
                        labelStyle={{ fontWeight: 600, width: 150 }}
                    >
                        <Descriptions.Item label="ID">{viewingContact.id}</Descriptions.Item>
                        <Descriptions.Item label="Tên người gửi">{viewingContact.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{viewingContact.email}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{viewingContact.phone}</Descriptions.Item>
                        <Descriptions.Item label="Tiêu đề">{viewingContact.subject}</Descriptions.Item>
                        <Descriptions.Item label="Nội dung">{viewingContact.message}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{formatDate(viewingContact.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">{formatDate(viewingContact.updatedAt)}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default ContactPage;
