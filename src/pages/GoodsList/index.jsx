import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Input, Drawer, Image, Upload, Form } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormTextArea, ProFormUploadButton, ProFormSelect } from '@ant-design/pro-form';
import ProDescriptions from '@ant-design/pro-descriptions';
import { queryRule, updateRule, addRule, removeRule, onShelves, outShelves, getBlockList, exportRule } from './service';
/**
 * 添加节点
 *
 * @param fields
 */

const handleAdd = async (fields) => {
  const hide = message.loading('正在添加');

  try {
    await addRule({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};
/**
 * 更新节点
 *
 * @param fields
 */

const handleUpdate = async (fields) => {
  const hide = message.loading('正在配置');

  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();
    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};
/**
 * 删除节点
 *
 * @param selectedRows
 */

const handleRemove = async (selectedRows) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const handleExport = async () => {
  const hide = message.loading('正在导出');

  try {
    const resp = await exportRule();
    const a = document.createElement('a');
    a.download = '仓储管理系统商品.xlsx';
    a.href = `https://${resp.result}`;
    a.click();
    hide();
    message.success('导出成功');
    return true;
  } catch (error) {
    console.log('err', error)
    hide();
    message.error('导出失败请重试！');
    return false;
  }
};

const TableList = () => {
  /** 新建窗口的弹窗 */
  const [createModalVisible, handleModalVisible] = useState(false);
  /** 分布更新窗口的弹窗 */

  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const actionRef = useRef();
  const [form] = Form.useForm();
  const [currentRow, setCurrentRow] = useState();
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [list, setList] = useState([]);
  /** 国际化配置 */

  useEffect(() => {
    async function getList() {
      const data = await getBlockList();
      const options = data.result.map(item => ({ label: item.name, value: item.id, key: item.name }));
      setList(options);
    };
    getList();
  }, []);

  const intl = useIntl();
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
    },
    {
      title: '商品名称',
      dataIndex: 'name',
    },
    {
      title: '商品价格',
      dataIndex: 'price',
      search: false,
      render: (v, record) => (
        <span style={{ color: 'red' }}>{(record.price / 100).toFixed(2)}</span>
      ),
    },
    {
      title: '商品图片',
      dataIndex: 'picture',
      search: false,
      render: (v, record) => (
        <Image
          width={96}
          src={`https://${record.picture}`}
      />
      )
    },
    {
      title: '商品库存',
      dataIndex: 'number',
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      search: false,
    },
    {
      title: '分区',
      dataIndex: 'bizId',
      valueEnum: () => {
        let data = {};
        list.forEach(item => data[item.value] = {
         text: item.label,
        });
        return data;
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="状态" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: '下架',
          status: 'Error',
        },
        1: {
          text: '上架',
          status: 'Success',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => {
        if (+record.status === 1) return [ 
          <a
            key="config"
            onClick={async () => {
              await outShelves({ id: record.id });
              message.success('下架成功');
              actionRef.current?.reloadAndRest?.();
            }}
          >
            下架
          </a>,
           <a
           key="config"
           onClick={async () => {
             setCurrentRow(record);
             handleModalVisible(true);
           }}
         >
           编辑
         </a>,
        ]
        return [
          <a
            key="config"
            onClick={async () => {
              await onShelves({ id: record.id });
              message.success('上架成功');
              actionRef.current?.reloadAndRest?.();
            }}
          >
            上架
          </a>,
          <a
          key="config"
          onClick={async () => {
            setCurrentRow(record);
            handleModalVisible(true);
          }}
        >
          编辑
        </a>,
        ]
      }
    },
  ];
  return (
    <PageContainer>
      <ProTable
        headerTitle="商品列表"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={handleExport}
        >
          <PlusOutlined /> 导出商品
        </Button>,
        ]}
        request={({ current: offset, pageSize: limit, ...reset }, sorter, filter) =>
          queryRule({
            offset,
            limit,
            ...reset,
          })
        }
        columns={columns}
      />
      <ModalForm
        title={createModalVisible ? "编辑商品" : "新建商品"}
        width="600px"
        form={form}
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const { file, price, bizId } = value;
          const success = await handleAdd({
            ...value,
            price: price * 100,
            picture: file[0]?.response,
            bizName: list.find(item => item.value === bizId)?.label,
          });

          if (success) {
            handleModalVisible(false);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: '商品名称为必填项',
            },
          ]}
          width="lg"
          name="name"
          label="商品名称"
          fieldProps={{
            size: 'large',
          }}
        />
        <ProFormUploadButton
          width="lg"
          listType="picture"
          action='/admin/upload/file'
          name="file"
          label="商品图片"
          fieldProps={{
            size: 'large',
            name: "file"
          }}
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: '商品价格为必填项',
            },
          ]}
          width="lg"
          name="price"
          label="商品价格"
          fieldProps={{
            size: 'large',
          }}
        />
         <ProFormText
          rules={[
            {
              required: true,
              message: '商品库存为必填项',
            },
          ]}
          width="lg"
          name="number"
          label="商品库存"
          fieldProps={{
            size: 'large',
          }}
        />
         <ProFormSelect
          options={list}
          name="bizId"
          label="商品分区"
        />
      </ModalForm>
      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
