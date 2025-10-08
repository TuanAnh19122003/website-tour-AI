import React from 'react';
import { Form, Input, Button, Space, InputNumber, Select, DatePicker } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const BookingForm = ({ initialValues, onSubmit, onCancel, users = [] }) => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        onSubmit({
            ...values,
            booking_date: values.booking_date ? values.booking_date.format('YYYY-MM-DD') : null
        });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                ...(initialValues || {}),
                total_price: initialValues?.total_price ? Number(initialValues.total_price) : undefined,
                booking_date: initialValues?.booking_date ? dayjs(initialValues.booking_date) : null
            }}
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
                name="total_price"
                label="Tổng tiền"
                rules={[{ required: true, message: 'Vui lòng nhập tổng tiền!' }]}
            >
                <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="booking_date"
                label="Ngày đặt"
                rules={[{ required: true, message: 'Vui lòng chọn ngày đặt!' }]}
            >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="status"
                label="Trạng thái"
            >
                <Select>
                    <Select.Option value="pending">Chờ xử lý</Select.Option>
                    <Select.Option value="paid">Đã thanh toán</Select.Option>
                    <Select.Option value="cancelled">Đã huỷ</Select.Option>
                    <Select.Option value="completed">Hoàn tất</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="paymentMethod"
                label="Phương thức thanh toán"
            >
                <Select>
                    <Select.Option value="cod">COD</Select.Option>
                    <Select.Option value="paypal">PayPal</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="paypal_order_id"
                label="PayPal Order ID"
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="note"
                label="Ghi chú"
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

export default BookingForm;
