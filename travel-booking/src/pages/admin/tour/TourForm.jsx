import React from 'react';
import { Form, Input, Button, Space, Upload, InputNumber, Checkbox, Select, DatePicker } from 'antd';
import { CheckOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const TourForm = ({ initialValues, onSubmit, onCancel, discounts = [], discountLoading }) => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        onSubmit({
            ...values,
            start_date: values.start_date.format('YYYY-MM-DD'),
            end_date: values.end_date.format('YYYY-MM-DD'),
            image: values.image,
        });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                ...initialValues,
                start_date: initialValues?.start_date ? dayjs(initialValues.start_date) : null,
                end_date: initialValues?.end_date ? dayjs(initialValues.end_date) : null,
            }}
            onFinish={handleFinish}
        >
            <Form.Item
                name="code"
                label="Mã Tour"
                rules={[{ required: true, message: 'Vui lòng nhập mã tour!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="name"
                label="Tên Tour"
                rules={[{ required: true, message: 'Vui lòng nhập tên tour!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
                name="price"
                label="Giá"
                rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
            >
                <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="start_date"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
            >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="end_date"
                label="Ngày kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
            >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="duration_days"
                label="Số ngày"
                rules={[{ required: true, message: 'Vui lòng nhập số ngày!' }]}
            >
                <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="location"
                label="Địa điểm"
                rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item name="departure" label="Điểm xuất phát">
                <Input />
            </Form.Item>

            <Form.Item
                name="max_people"
                label="Số lượng tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng tối đa!' }]}
            >
                <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="available_people"
                label="Số lượng hiện có"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng hiện có!' }]}
            >
                <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="image"
                label="Ảnh tour"
                valuePropName="file"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            >
                <Upload
                    name="image"
                    listType="picture"
                    beforeUpload={() => false}
                    maxCount={1}
                >
                    <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                </Upload>
            </Form.Item>

            <Form.Item name="discountId" label="Discount">
                <Select placeholder="Chọn giảm giá" loading={discountLoading} allowClear>
                    {discounts.map(discount => (
                        <Select.Option key={discount.id} value={discount.id}>
                            {discount.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name="is_active" valuePropName="checked">
                <Checkbox>Tour đang hoạt động</Checkbox>
            </Form.Item>

            <Form.Item name="is_featured" valuePropName="checked">
                <Checkbox>Tour nổi bật</Checkbox>
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

export default TourForm;
