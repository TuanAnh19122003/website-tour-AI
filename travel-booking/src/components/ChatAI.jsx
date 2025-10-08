import React, { useState, useRef, useEffect } from "react";
import { Input, Button, List, Typography, Spin } from "antd";

const { TextArea } = Input;

function ChatAI() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleSend = async (text = prompt) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
        setPrompt("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/ai`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: trimmed }),
            });

            const data = await res.json();
            const botText =
                res.ok && data.response
                    ? data.response
                    : "Mình chưa hiểu rõ lắm, bạn có thể nói lại không?";

            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: botText },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Có lỗi mạng, vui lòng thử lại sau nhé!" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Danh sách tin nhắn */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: 12,
                    backgroundImage:
                        "linear-gradient(180deg, #f7fcff 0%, #ffffff 100%)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <List
                    dataSource={messages}
                    renderItem={(msg, idx) => (
                        <List.Item
                            key={idx}
                            style={{
                                justifyContent:
                                    msg.sender === "user" ? "flex-end" : "flex-start",
                                border: "none",
                                padding: 0,
                                marginBottom: 10,
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor:
                                        msg.sender === "user"
                                            ? "#00bfa6"
                                            : "#e6f7ff",
                                    color: msg.sender === "user" ? "#fff" : "#333",
                                    padding: "10px 14px",
                                    borderRadius: 16,
                                    maxWidth: "75%",
                                    wordBreak: "break-word",
                                    boxShadow:
                                        msg.sender === "user"
                                            ? "0 2px 6px rgba(0,191,166,0.3)"
                                            : "0 2px 6px rgba(0,0,0,0.1)",
                                }}
                            >
                                <Typography.Text>{msg.text}</Typography.Text>
                            </div>
                        </List.Item>
                    )}
                />
                {loading && (
                    <Spin size="small" style={{ alignSelf: "center", margin: 8 }} />
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Ô nhập tin nhắn */}
            <div
                style={{
                    margin: 8,
                    display: "flex",
                    gap: 8,
                    padding: 8,
                    borderTop: "1px solid #e0f2f1",
                    backgroundColor: "#f9fffd",
                    borderRadius: 8,
                }}
            >
                <TextArea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    placeholder="Hỏi tôi về tour, địa điểm, hoặc lịch trình nhé..."
                    style={{
                        flex: 1,
                        borderRadius: 8,
                        backgroundColor: "#fff",
                        border: "1px solid #d9f2ee",
                    }}
                />
                <Button
                    type="primary"
                    onClick={() => handleSend()}
                    disabled={loading}
                    style={{
                        backgroundColor: "#00bfa6",
                        border: "none",
                        borderRadius: 8,
                    }}
                >
                    Gửi
                </Button>
            </div>
        </div>
    );
}

export default ChatAI;
