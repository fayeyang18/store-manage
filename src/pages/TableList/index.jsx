import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Drawer } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-form';
import ProDescriptions from '@ant-design/pro-descriptions';
import { queryRule as queryGoods } from '../GoodsList/service';
import { queryRule, updateRule, addRule, removeRule, warehouseOrder, deliveryOrder } from './service';
/**
 * 添加节点
 *
 * @param fields
 */

const handleAdd = async (fields) => {
  const hide = message.loading('正在添加');
  const { orderId, number } = fields;
  const extra = JSON.stringify({ [orderId]: number });
  try {
    await addRule({ ...fields, extra });
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

const TableList = () => {
  /** 新建窗口的弹窗 */
  const [createModalVisible, handleModalVisible] = useState(false);
  /** 分布更新窗口的弹窗 */

  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const actionRef = useRef();
  const [options, setOptions] = useState([]);
  const [currentRow, setCurrentRow] = useState();
  const [selectedRowsState, setSelectedRows] = useState([]);
  /** 国际化配置 */

  const fetchData = async () => {
    if (createModalVisible) {
      const { data = [] } = await queryGoods({ limit: 1000, offset: 1 });
      setOptions(data.map(item => ({ 
        label: item.name,
        value: item.id,
      })));
    }
  }

  useEffect(async () => {
    fetchData();
  }, [createModalVisible])

  const intl = useIntl();
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      search: false,
    },
    {
      title: '订单号',
      dataIndex: 'number',
    },
    {
      title: '订单类型',
      dataIndex: 'type',
      valueEnum: {
        '1': {
          text: '入库单',
        },
        '2': {
          text: '出库单',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      search: false,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="状态" />,
      dataIndex: 'status',
      valueEnum: {
        0: {
          text: '待处理',
          status: 'Error',
        },
        1: {
          text: '入库成功',
          status: 'Success',
        },
        2: {
          text: '出库成功',
          status: 'Success',
        },
        3: {
          text: '处理中',
          status: 'Default',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'type',
      valueType: 'type',
      search: false,
      render: (v, record) => {
        if (!record.status) {
          if (+record.type === 1) return [
            <a
              key="config"
              onClick={async () => {
                const data = await deliveryOrder(record.id);
                if (data.isSuccess) {
                  message.success('出库成功');
                  actionRef.current?.reloadAndRest?.();
                } else message.error(data.message);
              }}
            >
              出库
            </a>,
          ]
          return [
            <a
              key="config"
              onClick={async () => {
                const data = await warehouseOrder(record.id);
                if (data.isSuccess) {
                  message.success('出库成功');
                  actionRef.current?.reloadAndRest?.();
                } else message.error(data.message);
              }}
            >
              入库
            </a>,
          ]
        }
      },
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
        ]}
        request={({ current: offset, pageSize: limit, ...reset }, sorter, filter) =>
          queryRule({
            ...sorter,
            ...filter,
            ...reset,
            offset,
            limit,
          })
        }
        columns={columns}
        // rowSelection={{
        //   onChange: (_, selectedRows) => {
        //     setSelectedRows(selectedRows);
        //   },
        // }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="已选择" />{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="服务调用次数总计"
                />{' '}
                {selectedRowsState.reduce((pre, item) => pre + item.callNo, 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage id="pages.searchTable.batchDeletion" defaultMessage="批量删除" />
          </Button>
          <Button type="primary">
            <FormattedMessage id="pages.searchTable.batchApproval" defaultMessage="批量审批" />
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title='新建订单'
        width="600px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value);

          if (success) {
            handleModalVisible(false);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
      <ProFormSelect
        defaultValue="1"
        required={true}
        options={[{ label: '入库', value: 1 }, { label: '出库', value: 2 }]}
        name="type"
        label="订单类型"
      />
      <ProFormSelect
        required={true}
        options={options}
        name="orderId"
        label="选择商品"
      />
      <ProFormText
          rules={[
            {
              required: true,
              message: '商品数量为必填项',
            },
          ]}
          width="lg"
          name="number"
          label="商品数量"
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
