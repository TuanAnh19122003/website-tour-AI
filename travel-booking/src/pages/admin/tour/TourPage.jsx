import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Spin, Descriptions, Tag, Input, Divider } from 'antd';
import TourList from './TourList';
import TourForm from './TourForm';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import normalizeFileName from '../../../utils/normalizeFileName';

const TourPage = () => {
    const [tours, setTours] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editingTour, setEditingTour] = useState(null);
    const [viewingTour, setViewingTour] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchData = useCallback(async (page = 1, pageSize = 5, keyword = search) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/tours`, {
                params: { page, pageSize, search: keyword || null },
            });
            const { data, total } = res.data;
            setTours(data);
            setPagination({ current: page, pageSize, total });
        } catch {
            toast.error('Lỗi khi tải danh sách tour');
        } finally {
            setLoading(false);
        }
    }, [API_URL, search]);

    const fetchDiscounts = useCallback(async () => {
        setDiscountLoading(true);
        try {
            const res = await axios.get(`${API_URL}/discounts`);
            setDiscounts(res.data.data);
        } catch {
            toast.error('Lỗi khi tải danh sách discount');
        } finally {
            setDiscountLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchData();
        fetchDiscounts();
    }, [fetchData, fetchDiscounts]);

    const handleAdd = () => { setEditingTour(null); setOpen(true); };
    const handleEdit = (tour) => { setEditingTour(tour); setOpen(true); };
    const handleView = (tour) => { setViewingTour(tour); };
    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${API_URL}/tours/${id}`);
            const { success, message: apiMsg } = res.data;
            if (success) {
                toast.success(apiMsg || 'Xóa thành công');
                const remainingItems = tours.length - 1;
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

    const handleSubmit = async (tour) => {
        try {
            const formData = new FormData();
            Object.keys(tour).forEach(key => {
                if (key === 'image' && Array.isArray(tour.image) && tour.image.length > 0) {
                    const originalFile = tour.image[0].originFileObj;
                    const normalizedName = normalizeFileName(originalFile.name);
                    const newFile = new File([originalFile], normalizedName, { type: originalFile.type });
                    formData.append('image', newFile);
                } else {
                    formData.append(key, tour[key]);
                }
            });

            let res;
            if (editingTour) {
                res = await axios.put(`${API_URL}/tours/${editingTour.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await axios.post(`${API_URL}/tours`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            const { success, message: apiMsg } = res.data;
            if (success) {
                toast.success(apiMsg || (editingTour ? 'Cập nhật thành công' : 'Thêm thành công'));
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
            <Toaster position="top-center" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Danh sách Tour</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                        placeholder="Tìm kiếm tour..."
                        value={search}
                        onChange={(e) => { const value = e.target.value; setSearch(value); fetchData(1, pagination.pageSize, value); }}
                        allowClear
                        style={{ width: 250 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm</Button>
                </div>
            </div>

            <Spin spinning={loading}>
                <TourList
                    data={tours}
                    discounts={discounts}
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
                destroyOnHidden
                title={editingTour ? 'Cập nhật Tour' : 'Thêm Tour'}
            >
                <TourForm
                    initialValues={editingTour}
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                    discounts={discounts}
                    discountLoading={discountLoading}
                />
            </Modal>

            <Modal
                open={!!viewingTour}
                onCancel={() => setViewingTour(null)}
                centered
                footer={null}
                title="Chi tiết Tour"
                width={800}
                bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }} // scroll nội bộ
            >
                {viewingTour && (
                    <>
                        {/* Thông tin cơ bản */}
                        <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                            {/* Ảnh bên trái */}
                            <div style={{ flexShrink: 0 }}>
                                {viewingTour.image ? (
                                    <img
                                        src={`http://localhost:5000/${viewingTour.image}`}
                                        alt="tour"
                                        style={{ width: 200, height: 230, objectFit: 'contain', borderRadius: 5 }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 200, height: 230, backgroundColor: '#d9d9d9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#aaa', borderRadius: 5
                                    }}>
                                        Không có
                                    </div>
                                )}
                            </div>

                            {/* Thông tin bên phải */}
                            <div style={{ flex: 1 }}>
                                <Descriptions bordered column={1} size="middle">
                                    <Descriptions.Item label="ID">{viewingTour.id}</Descriptions.Item>
                                    <Descriptions.Item label="Mã Tour">{viewingTour.code}</Descriptions.Item>
                                    <Descriptions.Item label="Tên">{viewingTour.name}</Descriptions.Item>
                                    <Descriptions.Item label="Mô tả">{viewingTour.description || '-'}</Descriptions.Item>
                                </Descriptions>
                            </div>
                        </div>


                        <Divider />

                        {/* Thời gian & địa điểm */}
                        <Descriptions title="Thời gian & địa điểm" bordered column={2} size="middle">
                            <Descriptions.Item label="Ngày bắt đầu">{viewingTour.start_date}</Descriptions.Item>
                            <Descriptions.Item label="Ngày kết thúc">{viewingTour.end_date}</Descriptions.Item>
                            <Descriptions.Item label="Số ngày">{viewingTour.duration_days}</Descriptions.Item>
                            <Descriptions.Item label="Địa điểm">{viewingTour.location}</Descriptions.Item>
                            <Descriptions.Item label="Điểm xuất phát">{viewingTour.departure || '-'}</Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        {/* Số lượng & Discount */}
                        <Descriptions title="Số lượng & Discount" bordered column={2} size="middle">
                            <Descriptions.Item label="Số lượng tối đa">{viewingTour.max_people}</Descriptions.Item>
                            <Descriptions.Item label="Số lượng hiện có">{viewingTour.available_people}</Descriptions.Item>
                            <Descriptions.Item label="Discount">
                                {discounts.find(d => d.id === viewingTour.discountId)?.name || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {viewingTour.is_active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tour nổi bật">
                                {viewingTour.is_featured ? <Tag color="gold">Nổi bật</Tag> : '-'}
                            </Descriptions.Item>
                        </Descriptions>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default TourPage;
