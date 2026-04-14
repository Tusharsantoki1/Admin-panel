import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Space,
  Spin,
  Table,
  Typography,
  theme,
} from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/Badge";
import BASE_URL from "../api/config";

const { Title, Text } = Typography;

function StatCard({
  label,
  value,
  subtitle,
  icon,
  accent,
  surface,
  borderColor,
}) {
  return (
    <Card
      bordered={false}
      style={{
        height: "100%",
        borderRadius: 6,
        background: surface,
        border: "1px solid #E5E7EB",
      }}
      bodyStyle={{ padding: 22 }}
    >
      <Flex justify="space-between" align="flex-start" gap={16}>
        <div>
          <Text
            style={{
              fontSize: 12,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: "#5E6782",
              fontWeight: 600,
            }}
          >
            {label}
          </Text>
          <div
            style={{
              marginTop: 12,
              fontSize: 30,
              lineHeight: 1,
              fontWeight: 700,
              color: "#16213E",
            }}
          >
            {value}
          </div>
          <Text style={{ display: "block", marginTop: 10, color: "#6B7280" }}>
            {subtitle}
          </Text>
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color: accent,
            background: borderColor,
            border: `1px solid ${accent}22`,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </Flex>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    today: 0,
  });
  const [loading, setLoading] = useState(false);

  const tableColumns = [
    {
      title: "User",
      dataIndex: "first_name",
      key: "user",
      render: (_, user) => (
        <Flex align="center" gap={12}>
          <Avatar
            style={{
              backgroundColor: "#E8F0FF",
              color: token.colorPrimary,
              fontWeight: 700,
            }}
          >
            {`${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: "#16213E" }}>
              {user.first_name} {user.last_name}
            </div>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>{user.email}</Text>
          </div>
        </Flex>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => <Badge label={value} />,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (value) => <Badge label={value} />,
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
    },
    {
      title: "Joined",
      dataIndex: "created_at",
      key: "created_at",
      render: (value) => <Text style={{ color: "#6B7280" }}>{value}</Text>,
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 50px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        background:
          "linear-gradient(180deg, rgba(243,245,254,0.9) 0%, #fdfdfd 35%, #ffffff 100%)",
        minHeight: "calc(100vh - 50px)",
      }}
    >
      <Card
        bordered={false}
        style={{
          marginBottom: 24,
          borderRadius: 6,
          background:
            "linear-gradient(135deg, #0F2D7A 0%, #1A48D3 55%, #77B6FF 100%)",
        }}
        bodyStyle={{ padding: 28 }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={10}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.78)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Overview
              </Text>
              <Title level={2} style={{ margin: 0, color: "#fff" }}>
                Dashboard
              </Title>
              <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.84)" }}>
                Track customer growth, active usage, and the newest signups from
                one place.
              </Text>
            </Space>
          </Col>

          <Col xs={24} lg={8}>
            <Flex justify="flex-end" align="center">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/users")}
                style={{
                  borderRadius: 6,
                  height: 44,
                  paddingInline: 18,
                  background: "#fff",
                  color: token.colorPrimary,
                  fontWeight: 600,
                  boxShadow: "none",
                }}
              >
                Open users
                <ArrowRightOutlined />
              </Button>
            </Flex>
          </Col>
        </Row>
      </Card>

      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12} xl={8}>
          <StatCard
            label="Total Users"
            value={stats.total.toLocaleString()}
            subtitle="All registered customers"
            icon={<TeamOutlined />}
            accent={token.colorPrimary}
            surface="#FFFFFF"
            borderColor="#E8F0FF"
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <StatCard
            label="Active Users"
            value={stats.active.toLocaleString()}
            subtitle="Currently active accounts"
            icon={<CheckCircleOutlined />}
            accent={token.colorSuccess}
            surface="#FFFFFF"
            borderColor="#E8F7EF"
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <StatCard
            label="Today's Registrations"
            value={stats.today.toLocaleString()}
            subtitle="New users added today"
            icon={<UserAddOutlined />}
            accent={token.colorWarning}
            surface="#FFFFFF"
            borderColor="#FFF3E2"
          />
        </Col>
      </Row>

      <Card
        bordered={false}
        title={
          <div>
            <div style={{ fontWeight: 700, color: "#16213E" }}>Recent Users</div>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              Latest registrations across the platform
            </Text>
          </div>
        }
        extra={
          <Button type="link" onClick={() => navigate("/users")}>
            View all
          </Button>
        }
        style={{
          borderRadius: 6,
          border: "1px solid #E5E7EB",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {users.length ? (
          <Table
            columns={tableColumns}
            dataSource={users.slice(0, 8)}
            rowKey="id"
            pagination={false}
            scroll={{ x: 760 }}
            style={{ borderRadius: 6, overflow: "hidden" }}
          />
        ) : (
          <div style={{ padding: 40 }}>
            <Empty description="No recent users found" />
          </div>
        )}
      </Card>
    </div>
  );
}
