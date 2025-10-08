import React from "react";
import { Table, Button, Popconfirm, Space, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

const ContactList = ({ data, onEdit, onDelete, onView, pagination, onPageChange }) => {
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            render: (_, __, index) => (
                <span>{(pagination.current - 1) * pagination.pageSize + index + 1}</span>
            )
        },
        { title: "Họ tên người gửi", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
        { title: "Tiêu đề", dataIndex: "subject", key: "subject" },
        { title: "Nội dung", dataIndex: "message", key: "message" },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            shape="circle"
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            type="primary"
                            shape="circle"
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title={`Bạn có chắc chắn xoá danh mục "${record.name}" không?`}
                            onConfirm={() => onDelete(record.id)}
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                type="primary"
                                shape="circle"
                                danger
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
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
    )
}

export default ContactList