import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Button, message, Drawer, Form } from 'antd';
import React, { useState, useRef } from 'react';
import { FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import ProDescriptions from '@ant-design/pro-descriptions';
import { queryRule, updateRule, addRule, removeRule } from './service';
/**
 * 添加节点
 *
 * @param fields
 */

const handleAdd = async (fields, type) => {
  const hide = message.loading('正在添加');
  const request = type === true ? updateRule: addRule;
  const text = type === true ? '编辑' : '添加;'
  try {
    await request({ ...fields });
    hide();
    message.success(`${text}成功`);
    return true;
  } catch (error) {
    hide();
    message.error(`${text}失败请重试！`);
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
      id: selectedRows.id,
    });
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
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

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
    },
    {
      title: '分类名称',
      dataIndex: 'category',
    },
    {
      title: '分区名称',
      dataIndex: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      search: false,
      render: (v, record) => (
        <span>{moment(record.createAt).format('YYYY-MM-DD')}</span>
      )
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => {
        return [
          <a
            key="config"
            onClick={() => {
              setCurrentRow(record);
              handleModalVisible(true);
            }}
          >
            编辑
          </a>,
           <a
           key="config"
           onClick={async () => {
            await handleRemove(record);
             actionRef.current?.reloadAndRest?.();
           }}
         >
           删除
         </a>
        ]
      }
    },
  ];
  return (
    <PageContainer>
      <ProTable
        headerTitle="分区列表"
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
          console.log('value', value, createModalVisible);
          const success = await handleAdd({ ...(currentRow || {}), ...value }, createModalVisible);

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
              message: '分区名称为必填项',
            },
          ]}
          initialValue={currentRow?.name}
          width="lg"
          name="name"
          label="分区名称"
          fieldProps={{
            size: 'large',
          }}
        />
        <ProFormText
          initialValue={currentRow?.category}
          rules={[
            {
              required: true,
              message: '所属类目为必填项',
            },
          ]}
          width="lg"
          name="category"
          label="所属类目"
          fieldProps={{
            size: 'large',
          }}
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
