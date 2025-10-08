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
    const [qrCode, setQrCode] = useState("");

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
                    setQrCode(res.data.data.qrCode);
                    message.success("Thanh toán thành công!");
                } else {
                    setSuccess(false);
                    setErrorMsg(res.data.message || "Xác nhận thất bại");
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
        return (
            <div style={{ textAlign: "center", padding: 50 }}>
                <Spin tip="Đang xác nhận thanh toán..." />
            </div>
        );

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            {success ? (
                <>
                    <Result
                        status="success"
                        title="Thanh toán thành công!"
                        subTitle={`Mã booking: ${bookingId}`}
                        extra={[
                            <Button type="primary" onClick={() => navigate("/")}>
                                Về trang chủ
                            </Button>,
                            <Button onClick={() => navigate("/booking-history")}>
                                Xem booking của tôi
                            </Button>,
                        ]}
                    />
                    {qrCode && (
                        <div style={{ marginTop: 20 }}>
                            <h3>Quét QR để check-in</h3>
                            <img
                                src={qrCode}
                                alt="Booking QR Code"
                                style={{
                                    maxWidth: 300,
                                    border: "2px solid #1677ff",
                                    borderRadius: 8,
                                }}
                            />
                        </div>
                    )}
                </>
            ) : (
                <Result
                    status="error"
                    title="Thanh toán thất bại"
                    subTitle={errorMsg}
                    extra={[
                        <Button type="primary" onClick={() => window.location.reload()}>
                            Thử lại
                        </Button>,
                        <Button onClick={() => navigate("/")}>Về trang chủ</Button>,
                    ]}
                />
            )}
        </div>
    );
};

export default BookingSuccess;
