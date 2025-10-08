import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Typography, Spin, message, Button } from "antd";
import axios from "axios";

const { Title } = Typography;

const Destinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchDestinations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/tours/destinations`);
            console.log(res.data.data);
            
            setDestinations(res.data.data || []);
        } catch (error) {
            console.error(error);
            message.error("Lấy danh sách điểm đến thất bại");
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchDestinations();
    }, [fetchDestinations]);

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
                Điểm đến nổi bật
            </Title>

            {loading ? (
                <div style={{ textAlign: "center", padding: 50 }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Row gutter={[24, 24]}>
                    {destinations.map((destination) => (
                        <Col xs={24} sm={12} md={8} key={destination.location}>
                            <Card
                                hoverable
                                cover={
                                    <img
                                        alt={`Điểm đến: ${destination.location}`}
                                        src={`http://localhost:5000/${destination.image}`}
                                        style={{
                                            height: 220,
                                            objectFit: "cover",
                                            borderTopLeftRadius: 8,
                                            borderTopRightRadius: 8,
                                        }}
                                    />
                                }
                                style={{ borderRadius: 8 }}
                            >
                                <Title level={4}>{destination.location}</Title>
                                <Button
                                    type="primary"
                                    block
                                    onClick={() => navigate(`/tours/${destination.slug}`)}
                                >
                                    Xem tour
                                </Button>

                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default Destinations;
