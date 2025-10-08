import React from 'react';
import { Table, Button, Popconfirm, Space, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const TourList = ({ data, discounts = [], onEdit, onDelete, onView, pagination, onPageChange }) => {
    const columns = [
        {
            title: "STT",
            key: "index",
            render: (_, __, index) => (
                <span>{(pagination.current - 1) * pagination.pageSize + index + 1}</span>
            ),
        },
        {
            title: "Ảnh đại diện",
            dataIndex: "image",
            key: "image",
            render: (filename) =>
                filename ? (
                    <img
                        src={`http://localhost:5000/${filename}`}
                        alt="avatar"
                        style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10, border: "1px solid #ccc" }}
                    />
                ) : (
                    <div
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: 10,
                            backgroundColor: "#d9d9d9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            color: "#555",
                            border: "1px solid #ccc",
                        }}
                    >
                        Không có
                    </div>
                ),
        },
        { title: "Tên Tour", dataIndex: "name", key: "name" },
        { title: "Mã Tour", dataIndex: "code", key: "code" },
        { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date" },
        { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date" },
        {
            title: "Discount",
            dataIndex: "discountId",
            key: "discountId",
            render: (discountId) => discounts.find(d => d.id === discountId)?.name || "-"
        },
        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            render: (active) =>
                active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>
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
                            title={`Bạn có chắc chắn xoá tour "${record.name}" không?`}
                            onConfirm={() => onDelete(record.id)}
                        >
                            <Button icon={<DeleteOutlined />} type="primary" shape="circle" danger />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        },
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

export default TourList;
