import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Result, Button, Card, List, Image, message, Tag } from "antd";
import axios from "axios";
import { formatCurrency, formatDate } from "../../utils/helpers";

const CheckinPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [checkinSuccess, setCheckinSuccess] = useState(false);

    const API_URL = "http://192.168.1.8:5000/api";

    // Lấy chi tiết booking
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/checkin/${bookingId}`);
                if (res.data.success) {
                    setBooking(res.data.data);
                } else {
                    message.error(res.data.message || "Lấy thông tin booking thất bại");
                }
            } catch (err) {
                console.error(err);
                message.error("Lấy thông tin booking thất bại");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    // Xử lý check-in
    const handleCheckin = async () => {
        try {
            const res = await axios.post(`${API_URL}/checkin/${bookingId}/checkin`);
            if (res.data.success) {
                setCheckinSuccess(true);
                message.success("Check-in thành công!");
            } else {
                message.error(res.data.message || "Check-in thất bại");
            }
        } catch (err) {
            console.error(err);
            message.error(err.response?.data?.message || "Check-in thất bại");
        }
    };

    // Tag trạng thái
    const getStatusTag = (status) => {
        switch (status) {
            case "pending":
                return <Tag color="orange">Chờ thanh toán</Tag>;
            case "paid":
                return <Tag color="blue">Đã thanh toán</Tag>;
            case "completed":
                return <Tag color="green">Hoàn thành</Tag>;
            case "cancelled":
                return <Tag color="red">Đã hủy</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    if (loading)
        return (
            <div style={{ textAlign: "center", padding: 50 }}>
                <Spin tip="Đang tải thông tin booking..." />
            </div>
        );

    if (!booking)
        return (
            <Result
                status="error"
                title="Booking không tồn tại"
                extra={<Button onClick={() => navigate("/")}>Về trang chủ</Button>}
            />
        );

    return (
        <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
            {!checkinSuccess ? (
                <Card
                    title={`Booking ID: ${booking.id}`}
                    bordered
                    extra={getStatusTag(booking.status)}
                    style={{ width: "100%" }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            marginBottom: 16,
                        }}
                    >
                        <p><strong>Ngày đặt:</strong> {formatDate(booking.booking_date)}</p>
                        <p><strong>Phương thức thanh toán:</strong> {booking.paymentMethod.toUpperCase()}</p>
                        <p><strong>Ghi chú:</strong> {booking.note || "-"}</p>
                    </div>

                    <List
                        header={<strong>Chi tiết tour</strong>}
                        dataSource={booking.items}
                        renderItem={(item) => (
                            <List.Item style={{ flexDirection: "column", alignItems: "flex-start", padding: "10px 0" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        gap: 12,
                                        width: "100%",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {item.tour.image && (
                                        <Image
                                            src={`http://192.168.1.8:5000/${item.tour.image}`}
                                            alt={item.tour.name}
                                            width={120}
                                            height={80}
                                            style={{ objectFit: "cover", borderRadius: 4 }}
                                        />
                                    )}
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <p><strong>{item.tour.name}</strong></p>
                                        <p>Vị trí: {item.tour.location}</p>
                                        <p>Số lượng: {item.quantity}</p>
                                        <p>Giá: {formatCurrency(Number(item.price))}</p>
                                        <p>Thành tiền: {formatCurrency(Number(item.price * item.quantity))}</p>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />

                    <h3 style={{ textAlign: "right", marginTop: 10 }}>
                        Tổng: {formatCurrency(Number(booking.total_price))}
                    </h3>

                    {booking.qrCode && (
                        <div style={{ textAlign: "center", marginTop: 20 }}>
                            <h4>QR code check-in</h4>
                            <Image
                                width={200}
                                src={booking.qrCode}
                                alt={`QR code booking #${booking.id}`}
                            />
                        </div>
                    )}

                    {booking.status === "paid" && !checkinSuccess && (
                        <div style={{ textAlign: "center", marginTop: 20 }}>
                            <Button type="primary" onClick={handleCheckin}>
                                Check-in
                            </Button>
                        </div>
                    )}
                </Card>
            ) : (
                <Result
                    status="success"
                    title="Check-in thành công!"
                    subTitle={`Booking ID: ${booking.id}`}
                    extra={[
                        <Button type="primary" onClick={() => navigate("/")}>
                            Về trang chủ
                        </Button>,
                        <Button onClick={() => navigate("/booking-history")}>
                            Xem booking của tôi
                        </Button>,
                    ]}
                />
            )}
        </div>
    );
};

export default CheckinPage;
