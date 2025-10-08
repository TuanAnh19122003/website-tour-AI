import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Spin, Descriptions, Input, Space, Rate  } from 'antd';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const ReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState([]);
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [viewingReview, setViewingReview] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchReviews = useCallback(async (page = 1, pageSize = 5, keyword = search) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/reviews`, { params: { page, pageSize, search: keyword || null } });
            const { data, total } = res.data;
            setReviews(data);
            setPagination({ current: page, pageSize, total });
        } catch {
            toast.error('Lỗi khi tải đánh giá');
        } finally {
            setLoading(false);
        }
    }, [API_URL, search]);

    const fetchUsersAndTours = useCallback(async () => {
        try {
            const [userRes, tourRes] = await Promise.all([
                axios.get(`${API_URL}/users`),
                axios.get(`${API_URL}/tours`)
            ]);
            setUsers(userRes.data.data);
            setTours(tourRes.data.data);
        } catch {
            toast.error('Lỗi khi tải người dùng hoặc tour');
        }
    }, [API_URL]);

    useEffect(() => {
        fetchReviews();
        fetchUsersAndTours();
    }, [fetchReviews, fetchUsersAndTours]);

    const handleAdd = () => {
        setEditingReview(null);
        setOpen(true);
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setOpen(true);
    };

    const handleView = (review) => {
        setViewingReview(review);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/reviews/${id}`);
            toast.success('Xóa thành công');
            const remainingItems = reviews.length - 1;
            const isLastItemOnPage = remainingItems === 0 && pagination.current > 1;
            const newPage = isLastItemOnPage ? pagination.current - 1 : pagination.current;
            fetchReviews(newPage, pagination.pageSize);
        } catch {
            toast.error('Thao tác thất bại');
        }
    };

    const handleSubmit = async (review) => {
        try {
            let res;
            if (editingReview) {
                res = await axios.put(`${API_URL}/reviews/${editingReview.id}`, review);
            } else {
                res = await axios.post(`${API_URL}/reviews`, review);
            }
            if (res.data.success) {
                toast.success(res.data.message || (editingReview ? 'Cập nhật thành công' : 'Thêm thành công'));
                fetchReviews(pagination.current, pagination.pageSize);
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
                <h2>Danh sách liên hệ</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                        placeholder="Tìm kiếm liên hệ..."
                        value={search}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearch(value);
                            fetchReviews(1, pagination.pageSize, value);
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
                <ReviewList
                    data={reviews}
                    users={users}
                    tours={tours}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    pagination={pagination}
                    onPageChange={fetchReviews}
                />
            </Spin>

            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                destroyOnClose
                title={editingReview ? 'Cập nhật đánh giá' : 'Thêm đánh giá'}
            >
                <ReviewForm
                    initialValues={editingReview}
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                    users={users}
                    tours={tours}
                />
            </Modal>

            <Modal
                open={!!viewingReview}
                onCancel={() => setViewingReview(null)}
                centered
                footer={null}
                title="Chi tiết đánh giá"
            >
                {viewingReview && (
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="ID">{viewingReview.id}</Descriptions.Item>
                        <Descriptions.Item label="Người dùng">
                            {users.find(u => u.id === viewingReview.userId)?.lastname + ' ' + users.find(u => u.id === viewingReview.userId)?.firstname || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tour">
                            {tours.find(t => t.id === viewingReview.tourId)?.name || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Điểm đánh giá">
                            <Rate disabled allowHalf defaultValue={viewingReview.rating} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Bình luận">{viewingReview.comment || '-'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default ReviewPage;
