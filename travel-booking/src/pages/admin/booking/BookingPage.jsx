import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Spin, Descriptions, Tag, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import BookingForm from './BookingForm';
import BookingList from './BookingList';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const BookingPage = () => {
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [viewingBooking, setViewingBooking] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    // Fetch bookings với user + items sẵn
    const fetchBookings = useCallback(async (page = 1, pageSize = 5, keyword = search) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/bookings`, {
                params: { page, pageSize, search: keyword || null, include: 'user,items.tour' }
            });
            const { data, total } = res.data;
            setBookings(data);
            setPagination({ current: page, pageSize, total });
        } catch {
            toast.error('Lỗi khi tải bookings');
        } finally {
            setLoading(false);
        }
    }, [API_URL, search]);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/users`);
            setUsers(res.data.data);
        } catch {
            toast.error('Lỗi khi tải người dùng');
        }
    }, [API_URL]);

    useEffect(() => {
        fetchBookings();
        fetchUsers();
    }, [fetchBookings, fetchUsers]);

    const handleAdd = () => {
        setEditingBooking(null);
        setOpen(true);
    };

    const handleEdit = (booking) => {
        setEditingBooking(booking);
        setOpen(true);
    };

    const handleView = (booking) => {
        setViewingBooking(booking);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/bookings/${id}`);
            toast.success('Xóa thành công');
            const remainingItems = bookings.length - 1;
            const isLastItemOnPage = remainingItems === 0 && pagination.current > 1;
            const newPage = isLastItemOnPage ? pagination.current - 1 : pagination.current;
            fetchBookings(newPage, pagination.pageSize);
        } catch {
            toast.error('Thao tác thất bại');
        }
    };

    const handleSubmit = async (booking) => {
        try {
            let res;
            if (editingBooking) {
                res = await axios.put(`${API_URL}/bookings/${editingBooking.id}`, booking);
            } else {
                res = await axios.post(`${API_URL}/bookings`, booking);
            }
            if (res.data.success) {
                toast.success(res.data.message || (editingBooking ? 'Cập nhật thành công' : 'Thêm thành công'));
                fetchBookings(pagination.current, pagination.pageSize);
                setOpen(false);
            } else {
                toast.error(res.data.message || 'Thao tác thất bại');
            }
        } catch {
            toast.error('Thao tác thất bại');
        }
    };

    return (
        <div>
            <Toaster position="top-center" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Danh sách đặt tour</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearch(value);
                            fetchBookings(1, pagination.pageSize, value);
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
                <BookingList
                    data={bookings}
                    users={users}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    pagination={pagination}
                    onPageChange={fetchBookings}
                    API_URL={API_URL}
                    fetchBookings={fetchBookings}
                />
            </Spin>

            {/* Modal Thêm/Sửa Booking */}
            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                destroyOnClose
                title={editingBooking ? 'Cập nhật booking' : 'Thêm booking'}
            >
                <BookingForm
                    initialValues={editingBooking}
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                    users={users}
                />
            </Modal>

            {/* Modal Chi tiết Booking */}
            <Modal
                open={!!viewingBooking}
                onCancel={() => setViewingBooking(null)}
                centered
                footer={null}
                title="Chi tiết Booking"
                width={800}
                bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
            >
                {viewingBooking && (
                    <>
                        {/* Thông tin Booking */}
                        <Descriptions bordered column={1} size="middle" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Mã">{viewingBooking.id}</Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">
                                {viewingBooking.user
                                    ? `${viewingBooking.user.lastname} ${viewingBooking.user.firstname}`
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                {Number(viewingBooking.total_price).toLocaleString("vi-VN")} ₫
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={
                                    viewingBooking.status === 'pending' ? 'orange' :
                                        viewingBooking.status === 'paid' ? 'blue' :
                                            viewingBooking.status === 'completed' ? 'green' :
                                                'red'
                                }>
                                    {viewingBooking.status}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thanh toán">
                                <Tag>{viewingBooking.paymentMethod === 'cod' ? 'COD' : 'PayPal'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú">{viewingBooking.note || "Không có"}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">
                                {new Date(viewingBooking.booking_date).toLocaleDateString("vi-VN")}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Danh sách tour trong booking */}
                        <h4>Danh sách tour</h4>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#fafafa" }}>
                                    <th style={{ border: "1px solid #ddd", padding: 8 }}>Mã tour</th>
                                    <th style={{ border: "1px solid #ddd", padding: 8 }}>Tên tour</th>
                                    <th style={{ border: "1px solid #ddd", padding: 8 }}>Số lượng</th>
                                    <th style={{ border: "1px solid #ddd", padding: 8 }}>Giá</th>
                                    <th style={{ border: "1px solid #ddd", padding: 8 }}>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewingBooking.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.tour?.code}</td>
                                        <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.tour?.name}</td>
                                        <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.quantity}</td>
                                        <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                            {Number(item.price).toLocaleString("vi-VN")} ₫
                                        </td>
                                        <td style={{ border: "1px solid #ddd", padding: 8 }}>
                                            {(item.quantity * Number(item.price)).toLocaleString("vi-VN")} ₫
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default BookingPage;
