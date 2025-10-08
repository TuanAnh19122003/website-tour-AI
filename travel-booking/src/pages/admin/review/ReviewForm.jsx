import React from 'react';
import { Form, Input, Button, Space, Select, Rate } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const ReviewForm = ({ initialValues, onSubmit, onCancel, users = [], tours = [] }) => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        onSubmit(values);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues || {}}
            onFinish={handleFinish}
        >
            <Form.Item
                name="userId"
                label="Người dùng"
                rules={[{ required: true, message: 'Vui lòng chọn người dùng!' }]}
            >
                <Select placeholder="Chọn người dùng">
                    {users.map(user => (
                        <Select.Option key={user.id} value={user.id}>
                            {user.lastname} {user.firstname}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="tourId"
                label="Tour"
                rules={[{ required: true, message: 'Vui lòng chọn tour!' }]}
            >
                <Select placeholder="Chọn tour">
                    {tours.map(tour => (
                        <Select.Option key={tour.id} value={tour.id}>
                            {tour.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="rating"
                label="Đánh giá"
                rules={[{ required: true, message: 'Vui lòng chọn đánh giá!' }]}
            >
                <Rate allowHalf />
            </Form.Item>

            <Form.Item
                name="comment"
                label="Bình luận"
            >
                <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
                        Lưu
                    </Button>
                    <Button onClick={onCancel} icon={<CloseOutlined />}>
                        Hủy
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default ReviewForm;
