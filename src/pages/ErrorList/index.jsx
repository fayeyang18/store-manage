import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Button, message, Drawer, Form } from 'antd';
import React, { useState, useRef } from 'react';
import { FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import ProDescriptions from '@ant-design/pro-descriptions';
import { queryRule, updateRule, exportRule } from './service';

const handleExport = async () => {
  const hide = message.loading('正在导出');

  try {
    const resp = await exportRule();
    const a = document.createElement('a');
    a.download = '仓储管理系统异常订单.xlsx';
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

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      width: 100,
    },
    {
      title: '相关id',
      dataIndex: 'bizId',
      width: 100,
    },
    {
      title: '相关名称',
      dataIndex: 'bizName',
      width: 200,
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      width: 200,
    },
    {
      title: '错误原因',
      dataIndex: 'error',
    },
  ];
  return (
    <PageContainer>
      <ProTable
        headerTitle="分区列表"
        actionRef={actionRef}
        rowKey="key"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={handleExport}
        >
          <PlusOutlined /> 导出异常订单
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
    </PageContainer>
  );
};

export default TableList;
