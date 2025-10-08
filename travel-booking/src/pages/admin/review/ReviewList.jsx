import React from 'react';
import { Table, Button, Popconfirm, Space, Tooltip, Rate } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const ReviewList = ({ data, users = [], tours = [], onEdit, onDelete, onView, pagination, onPageChange }) => {
    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {
            title: 'Người dùng',
            dataIndex: 'userId',
            key: 'userId',
            render: (id) => users.find(u => u.id === id)?.lastname + ' ' + users.find(u => u.id === id)?.firstname || '-'
        },
        {
            title: 'Tour',
            dataIndex: 'tourId',
            key: 'tourId',
            render: (id) => tours.find(t => t.id === id)?.name || '-'
        },
        {
            title: 'Điểm đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (value) => <Rate disabled allowHalf defaultValue={value} />
        },
        {
            title: 'Bình luận',
            dataIndex: 'comment',
            key: 'comment',
            ellipsis: true
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chi tiết">
                        <Button icon={<EyeOutlined />} shape="circle" onClick={() => onView(record)} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button icon={<EditOutlined />} type="primary" shape="circle" onClick={() => onEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm title={`Bạn có chắc chắn xoá đánh giá này không?`} onConfirm={() => onDelete(record.id)}>
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

export default ReviewList;
