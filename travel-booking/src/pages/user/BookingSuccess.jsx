import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button, Spin, message } from "antd";
import axios from "axios";

const BookingSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const bookingId = searchParams.get("bookingId");

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!bookingId) {
            setErrorMsg("Booking không tồn tại");
            setLoading(false);
            return;
        }

        const capturePayment = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/paypal/capture?bookingId=${bookingId}`
                );


                if (res.data.success) {
                    setSuccess(true);
                    message.success("Thanh toán thành công!");
                } else {
                    setSuccess(false);
                    setErrorMsg(res.data.message || "Xác nhận thanh toán thất bại");
                    message.error(res.data.message || "Xác nhận thất bại");
                }
            } catch (err) {
                setSuccess(false);
                setErrorMsg(err.response?.data?.message || "Xác nhận thất bại");
                message.error(err.response?.data?.message || "Xác nhận thất bại");
            } finally {
                setLoading(false);
            }
        };

        capturePayment();
    }, [bookingId]);

    if (loading)
        return <div style={{ textAlign: "center", padding: 50 }}><Spin tip="Đang xác nhận thanh toán..." /></div>;

    return success ? (
        <Result
            status="success"
            title="Thanh toán thành công!"
            subTitle={`Cảm ơn bạn đã đặt tour. Mã booking: ${bookingId}`}
            extra={[
                <Button type="primary" onClick={() => navigate("/")}>Về trang chủ</Button>,
                <Button onClick={() => navigate("/booking-history")}>Xem booking của tôi</Button>
            ]}
        />
    ) : (
        <Result
            status="error"
            title="Thanh toán thất bại"
            subTitle={errorMsg}
            extra={[
                <Button type="primary" onClick={() => window.location.reload()}>Thử lại</Button>,
                <Button onClick={() => navigate("/")}>Về trang chủ</Button>
            ]}
        />
    );
};

export default BookingSuccess;
