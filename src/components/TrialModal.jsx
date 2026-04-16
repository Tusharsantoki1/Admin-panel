import React from 'react';
import { Modal, Form, InputNumber, Table, Typography, Divider, Space, Tag } from 'antd';
import { ClockCircleOutlined, HistoryOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const TrialModal = ({ visible, onCancel, onOk, user, historyData, isLoadingHistory, loadingSubmit }) => {
    const [form] = Form.useForm();

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Days',
            dataIndex: 'days',
            key: 'days',
            render: (days) => <Tag color="blue">+{days} Days</Tag>,
        },
        {
            title: 'Brokers',
            dataIndex: 'brokers',
            key: 'brokers',
        },
        {
            title: 'By (ID)',
            dataIndex: 'createdById',
            key: 'createdById',
            render: (id) => <Text type="secondary">{id}</Text>
        }
    ];

    return (
        <Modal
            open={visible}
            title={
                <Space>
                    <ClockCircleOutlined />
                    <span>Trial Management: {user?.first_name} ({user?.email})</span>
                </Space>
            }
            okText="Extend Trial"
            confirmLoading={loadingSubmit}
            onCancel={onCancel}
            onOk={() => {
                form.validateFields().then(values => {
                    onOk(values);
                    form.resetFields();
                });
            }}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ days: 15, brokers: 1 }}
                style={{ marginTop: 20 }}
            >
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        label="Days to Add"
                        name="days"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <InputNumber min={1} max={31} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="Brokers"
                        name="brokers"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <InputNumber min={1} max={10} style={{ width: "100%" }} />
                    </Form.Item>
                </div>
            </Form>

            <Divider orientation="left">
                <Space><Text strong>Activation History</Text></Space>
            </Divider>

            <Table
                dataSource={historyData}
                columns={columns}
                rowKey="id"
                size="small"
                loading={isLoadingHistory}
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: 'No previous trial extensions found' }}
            />
        </Modal>
    );
};