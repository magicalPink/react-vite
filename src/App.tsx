import React, { useState } from 'react';
import { Button, Flex, Space, Table, Radio, Modal, Form, Input } from 'antd';
import type { ColumnsType, TableProps, FormProps } from 'antd';
import './App.css';

type IColumnType = 'CUSTOMIZE' | 'FIXED' | 'REMARK' | 'USER_FILL';

interface Column {
    children: Column[] | null;
    id: string;
    level: number;
    name: string | null;
    parentId: string;
    title: string | null;
    type: IColumnType;
}

const disableEnum: Record<IColumnType, string> = {
    'CUSTOMIZE': '自定义逻辑',
    'FIXED': '系统默认',
    'REMARK': '备注列',
    'USER_FILL': '用户手填列',
};

const initialDataSource: Column[] = [
    { id: "code", parentId: "-1", children: null, name: null, level: 0, title: "编号", type: "FIXED" },
    { id: "name", parentId: "-1", children: null, name: null, level: 0, title: "名称", type: "FIXED" },
    { id: "remark", parentId: "-1", children: null, name: null, level: 0, title: "工料概要说明", type: "FIXED" },
];

const App: React.FC = () => {
    const columns: ColumnsType<Column> = [
        {
            title: '表头名称',
            dataIndex: 'title',
            key: 'title',
            width: 200,
        },
        {
            title: '列类型',
            dataIndex: 'type',
            key: 'id',
            render: (_, record) => <span>{disableEnum[record.type]}</span>,
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button onClick={() => addChildren(record)} disabled={record.type === "FIXED"} type="link">新建子级</Button>
                    <Button onClick={() => edit(record)} disabled={record.type === "FIXED"} type="link">编辑</Button>
                    <Button onClick={() => remove(record)} disabled={record.type === "FIXED"} danger type="link">删除</Button>
                </Space>
            ),
        },
    ];

    /**
     * 数据内容
     */
    const [dataSource, setDataSource] = useState<Column[]>(initialDataSource);

    const [modalVo, setModalVo] = useState<{ show: boolean, title: string }>({
        show: false,
        title: '新建',
    });

    const [form] = Form.useForm();

    const [editData, setEditData] = useState<Column | null>(null);

    /**
     * ## 新增编辑模态框
     * @param title 新建or编辑
     *
     */
    const showModal = (title: string) => {
        form.resetFields();
        setModalVo({ title, show: true });
    };

    const handleCancel = () => {
        setModalVo({ ...modalVo, show: false });
    };

    const onFinish: FormProps<Column>['onFinish'] = (values) => {
        if (modalVo.title === '新建') {
            const lastData = dataSource.pop()
            setDataSource([...dataSource, { level: 1, parentId: '-1', id: Math.random().toString(36).substring(2, 15), ...values }, lastData]);
        } else if (modalVo.title === '编辑') {
            const editChild = (data: Column[], id: string): Column[] => {
                return data.map(item => {
                    if (item.id === id) {
                        return { ...item, ...values };
                    }
                    if (item.children) {
                        return { ...item, children: editChild(item.children, id) };
                    }
                    return item;
                });
            };
            setDataSource(editChild(dataSource, editData!.id));
        } else if (modalVo.title === '新建子级') {
            const addChild = (data: Column[], parentId: string): Column[] => {
                return data.map(item => {
                    if (item.id === parentId) {
                        const newChild: Column = { ...values, level: item.level + 1, parentId: item.id, id: Math.random().toString(36).substring(2, 15) };
                        const children = item.children ? [...item.children, newChild] : [newChild];
                        return { ...item, children };
                    }
                    if (item.children) {
                        return { ...item, children: addChild(item.children, parentId) };
                    }
                    return item;
                });
            };
            setDataSource(addChild(dataSource, editData!.id));
        }
        handleCancel();
    };

    /**
     * #添加子级
     * @param record
     */
    const addChildren = (record: Column) => {
        setEditData({ ...record });
        showModal('新建子级');
    };

    /**
     * 修改
     * @param record
     */
    const edit = (record: Column) => {
        setEditData({ ...record });
        showModal('编辑');
    };

    /**
     * 删除
     * @param record
     */
    const remove = (record: Column) => {
        const removeChild = (data: Column[], id: string): Column[] => {
            return data.filter(item => {
                if (item.id === id) {
                    return false;
                }
                if (item.children) {
                    item.children = removeChild(item.children, id);
                }
                return true;
            });
        };
        setDataSource(removeChild(dataSource, record.id));
    };

    return (
        <div className={'p50'}>
            <Flex className={'mb5'} gap="middle" justify="flex-end">
                <Button>排序</Button>
                <Button onClick={() => showModal('新建')}>新建</Button>
            </Flex>
            <Table
                pagination={false}
                rowKey={record => record.id}
                dataSource={dataSource}
                columns={columns}
                rowClassName={record => record.type === 'FIXED' ? 'grayRow' : ''}
            />
            <Modal title={modalVo.title} open={modalVo.show} footer={[
                <Button key="back" onClick={handleCancel}>
                    取消
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    确定
                </Button>
            ]}>
                <Form
                    form={form}
                    name="control-hooks"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="类型"
                        name="type"
                        rules={[{ required: true, message: '请选择类型!' }]}
                        initialValue={'CUSTOMIZE'}
                    >
                        <Radio.Group>
                            {(['CUSTOMIZE', 'REMARK', 'USER_FILL'] as IColumnType[]).map((item) => (
                                <Radio key={item} value={item}>
                                    {disableEnum[item]}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        label="名称"
                        name="title"
                        rules={[{ required: true, message: '请输入名称!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default App;