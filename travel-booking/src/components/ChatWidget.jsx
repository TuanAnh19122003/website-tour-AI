import React, { useState } from "react";
import ChatAI from "./ChatAI";
import { Button } from "antd";
import {
    UpOutlined,
    DownOutlined,
    CloseOutlined,
    MessageOutlined,
} from "@ant-design/icons";

function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);

    const handleToggle = () => {
        if (open && !minimized) setMinimized(true);
        else if (open && minimized) setMinimized(false);
        else {
            setOpen(true);
            setMinimized(false);
        }
    };

    return (
        <>
            {/* Nút bong bóng mở chat */}
            {!open && (
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<MessageOutlined />}
                    onClick={handleToggle}
                    style={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        zIndex: 1000,
                        fontSize: 22,
                        boxShadow: "0 4px 10px rgba(0,191,166,0.4)",
                        backgroundColor: "#00bfa6",
                        border: "none",
                    }}
                />
            )}

            {/* Cửa sổ chat */}
            {open && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 20,
                        right: 20,
                        width: minimized ? 70 : 360,
                        height: minimized ? 70 : 500,
                        borderRadius: 16,
                        boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                        backgroundColor: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        zIndex: 1000,
                        transition: "all 0.3s ease",
                        border: "1px solid #d6f5ef",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            flex: "0 0 auto",
                            background: "linear-gradient(90deg, #00bfa6, #00d4c7)",
                            color: "#fff",
                            padding: "10px 16px",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        {!minimized && "Trợ lý du lịch ảo"}
                        <div style={{ display: "flex", gap: 8 }}>
                            <Button
                                type="text"
                                icon={minimized ? <UpOutlined /> : <DownOutlined />}
                                onClick={handleToggle}
                                style={{ color: "#fff", fontSize: 16 }}
                                title={minimized ? "Mở chat" : "Thu gọn"}
                            />
                            {!minimized && (
                                <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    onClick={() => setOpen(false)}
                                    style={{ color: "#fff", fontSize: 16 }}
                                    title="Đóng"
                                />
                            )}
                        </div>
                    </div>

                    {/* Nội dung chat */}
                    {!minimized && (
                        <div
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                backgroundColor: "#fdfefe",
                            }}
                        >
                            <ChatAI />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default ChatWidget;
