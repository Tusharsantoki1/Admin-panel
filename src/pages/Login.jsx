import React from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Space,
  Typography,
  App,
  theme,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useUserLogin } from "../hooks/useLogin";
import { setLocalStorageData } from "../utils/helpers";

const { Title, Text } = Typography;

function getErrorMessage(error) {
  if (!error) return "Unable to sign in. Please try again.";

  if (typeof error === "string") {
    try {
      const parsed = JSON.parse(error);
      return (
        parsed?.errorData?.message ||
        parsed?.message ||
        "Unable to sign in. Please try again."
      );
    } catch {
      return error;
    }
  }

  return "Unable to sign in. Please try again.";
}

export default function Login() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const loginMutation = useUserLogin();

  const handleFinish = async (values) => {
    try {
      const response = await loginMutation.mutateAsync(values);
      const tokenValue =
        response?.access_token ||
        response?.token ||
        response?.data?.access_token ||
        response?.data?.token;
      const emailValue =
        response?.email || response?.data?.email || values.email || "";

      if (!tokenValue) {
        message.error("Login succeeded but no access token was returned.");
        return;
      }

      setLocalStorageData("access_token", tokenValue);
      setLocalStorageData("email", emailValue);
      message.success("Welcome back");
      navigate("/", { replace: true });
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(119,182,255,0.28) 0%, rgba(243,245,254,0.85) 35%, #f7f9fc 70%, #ffffff 100%)",
        padding: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Row
        gutter={[24, 24]}
        style={{ width: "100%", maxWidth: 1160, alignItems: "stretch" }}
      >
        <Col xs={24} lg={13}>
          <Card
            bordered={false}
            style={{
              height: "100%",
              borderRadius: 28,
              background:
                "linear-gradient(145deg, #0F2D7A 0%, #1A48D3 52%, #78B9FF 100%)",
              boxShadow: "0 22px 60px rgba(26, 72, 211, 0.22)",
              overflow: "hidden",
            }}
            bodyStyle={{
              padding: 32,
              minHeight: 620,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 24,
                }}
              >
                <ThunderboltOutlined />
              </div>

              <Space direction="vertical" size={10}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  HedgeX Admin
                </Text>
                <Title
                  level={1}
                  style={{
                    color: "#fff",
                    margin: 0,
                    maxWidth: 420,
                    fontSize: 42,
                    lineHeight: 1.1,
                  }}
                >
                  Manage your platform with clarity and speed.
                </Title>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.82)",
                    fontSize: 16,
                    maxWidth: 440,
                  }}
                >
                  A focused workspace for tracking users, plans, permissions,
                  and day-to-day operations in one place.
                </Text>
              </Space>
            </Space>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              {[
                "Monitor registrations in real time",
                "Review customer activity faster",
                "Keep operational data organized",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    color: "#fff",
                    fontSize: 13,
                    lineHeight: 1.5,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <SafetyCertificateOutlined
                    style={{ marginBottom: 10, fontSize: 16 }}
                  />
                  <div>{item}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={11}>
          <Card
            bordered={false}
            style={{
              height: "100%",
              borderRadius: 28,
              boxShadow: "0 18px 50px rgba(15, 23, 42, 0.10)",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
            }}
            bodyStyle={{
              padding: 32,
              minHeight: 620,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ width: "100%" }}>
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Text
                  style={{
                    color: token.colorPrimary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Sign in
                </Text>
                <Title level={2} style={{ margin: 0, color: "#16213E" }}>
                  Welcome back
                </Title>
                <Text style={{ color: "#5E6782", fontSize: 14 }}>
                  Enter your admin credentials to continue.
                </Text>
              </Space>

              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={handleFinish}
                style={{ marginTop: 28 }}
                initialValues={{ remember: true }}
              >
                <Form.Item
                  label={<span style={{ fontWeight: 600 }}>Email address</span>}
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Enter a valid email address" },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<MailOutlined style={{ color: "#8C97B5" }} />}
                    placeholder="admin@hedgex.com"
                    style={{ height: 46, borderRadius: 12 }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontWeight: 600 }}>Password</span>}
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                  ]}
                  style={{ marginBottom: 14 }}
                >
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined style={{ color: "#8C97B5" }} />}
                    placeholder="Enter your password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    style={{ height: 46, borderRadius: 12 }}
                  />
                </Form.Item>

                {loginMutation.isError ? (
                  <Alert
                    type="error"
                    showIcon
                    message={getErrorMessage(loginMutation.error)}
                    style={{ marginBottom: 18, borderRadius: 12 }}
                  />
                ) : null}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Keep me signed in</Checkbox>
                  </Form.Item>
                  <Button type="link" style={{ padding: 0 }}>
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loginMutation.isPending}
                  block
                  style={{
                    height: 48,
                    borderRadius: 14,
                    fontWeight: 700,
                    boxShadow: "0 12px 24px rgba(26, 72, 211, 0.18)",
                  }}
                >
                  Sign in to dashboard
                </Button>
              </Form>

              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  borderRadius: 16,
                  background: "#F3F7FF",
                  border: "1px solid #E0E9FF",
                }}
              >
                <Text style={{ color: "#5E6782", fontSize: 13 }}>
                  This admin area uses your existing API login flow and stores
                  the returned access token securely for protected routes.
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
