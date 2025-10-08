import React, { useState, useEffect } from "react";
import {
    Form,
    Input,
    Button,
    Typography,
    Checkbox,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const { Title, Text } = Typography;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const savedLogin = localStorage.getItem("rememberedLogin");
        if (savedLogin) {
            const parsed = JSON.parse(savedLogin);
            form.setFieldsValue({
                email: parsed.email,
                password: parsed.password,
                remember: true,
            });
        }
    }, [form]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const { email, password } = values;

            const response = await axios.post(
                `${apiUrl}/auth/login`,
                { email, password },
                { headers: { "Content-Type": "application/json" } }
            );

            const { success, message: msg, token, user } = response.data;

            if (!success) {
                toast.error(msg || "Đăng nhập thất bại!");
                return;
            }

            toast.success(msg || "Đăng nhập thành công!");
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            if (values.remember) {
                localStorage.setItem(
                    "rememberedLogin",
                    JSON.stringify({ email, password })
                );
            } else {
                localStorage.removeItem("rememberedLogin");
            }

            setTimeout(() => {
                if (user.role?.code?.toLowerCase() === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            }, 800);
        } catch (error) {
            const errMsg =
                error?.response?.data?.message || "Đăng nhập thất bại!";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "60px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <Toaster position="top-center" reverseOrder={false} />

            <Title
                level={2}
                style={{ textAlign: "center", color: "#0072ff", marginBottom: 24 }}
            >
                Đăng nhập
            </Title>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Email hoặc tên đăng nhập"
                    name="email"
                    rules={[{ required: true, message: "Vui lòng nhập email hoặc tên đăng nhập" }]}
                >
                    <Input placeholder="Nhập email hoặc username" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                >
                    <Input.Password placeholder="••••••••" />
                </Form.Item>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 12,
                    }}
                >
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Nhớ mật khẩu</Checkbox>
                    </Form.Item>
                    <Link to="/auth/forgot-password">Quên mật khẩu?</Link>
                </div>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                        style={{
                            height: 40,
                            borderRadius: 8,
                            background: "linear-gradient(90deg,#00c6ff,#0072ff)",
                            border: "none",
                        }}
                    >
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: "center", marginTop: 12 }}>
                <Text>Bạn chưa có tài khoản? </Text>
                <Link to="/auth/register" style={{ color: "#0072ff", fontWeight: 500 }}>
                    Đăng ký ngay
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
