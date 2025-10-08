import React from 'react';
import { Table, Button, Popconfirm, Space, Tooltip, Tag, Select } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const BookingList = ({ data, users = [], onEdit, onDelete, onView, pagination, onPageChange, API_URL, fetchBookings }) => {

    const handleStatusChange = async (id, newStatus) => {
        try {
            console.log("Updating booking status:", id, newStatus);
            await axios.patch(`${API_URL}/bookings/status`, { bookingId: id, status: newStatus });
            toast.success('Cập nhật trạng thái thành công');
            fetchBookings(pagination.current, pagination.pageSize);
        } catch {
            toast.error('Cập nhật trạng thái thất bại');
        }
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            render: (_, __, index) => (
                (pagination.current - 1) * pagination.pageSize + index + 1
            ),
        },
        {
            title: "Người dùng",
            dataIndex: "userId",
            key: "userId",
            render: (id) => {
                const user = users.find(u => u.id === id);
                return user ? `${user.lastname} ${user.firstname}` : '-';
            }
        },
        {
            title: "Tổng tiền",
            dataIndex: "total_price",
            key: "total_price",
            render: (val) => val ? `${val} đ` : '-'
        },
        {
            title: "Ngày đặt",
            dataIndex: "booking_date",
            key: "booking_date",
            render: (val) => val || '-'
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status, record) => {
                const textMap = {
                    pending: 'Chờ xử lý',
                    paid: 'Đã thanh toán',
                    cancelled: 'Đã huỷ',
                    completed: 'Hoàn tất'
                };
                return (
                    <Select
                        value={status}
                        style={{ width: 130 }}
                        onChange={(value) => handleStatusChange(record.id, value)}
                    >
                        {Object.keys(textMap).map(key => (
                            <Select.Option key={key} value={key}>
                                {textMap[key]}
                            </Select.Option>
                        ))}
                    </Select>
                );
            }
        },
        {
            title: "Phương thức thanh toán",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            render: (method) => method === 'cod' ? 'COD' : 'PayPal'
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chi tiết">
                        <Button icon={<EyeOutlined />} shape="circle" onClick={() => onView(record)} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button icon={<EditOutlined />} type="primary" shape="circle" onClick={() => onEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title={`Bạn có chắc chắn xoá booking này không?`}
                            onConfirm={() => onDelete(record.id)}
                        >
                            <Button icon={<DeleteOutlined />} type="primary" shape="circle" danger />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <Table
            rowKey="id"
            dataSource={data}
            columns={columns}
            pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: false,
                onChange: (page, pageSize) => onPageChange(page, pageSize)
            }}
        />
    );
};

export default BookingList;
