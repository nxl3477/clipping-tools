import React, { Component, useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal, Select } from 'antd'
import styles from '../../homePage.scss'
const $modalNode = document.getElementById('modal')
const { Option } = Select;




export default function ShowSettingModal(props) {
  const { visible, item, closeSettingModal, shortCutmap, confirmSettingModal } = props
  const shortCutList = shortCutmap === null ? [] : Object.keys(shortCutmap).map(key => {
    return {
      disabled: shortCutmap[key] !== null,
      value: key
    }
  })

  let selectValue = (item && item.shortcut) ? item.shortcut : null

  return (
    <Modal
      visible={visible}
      destroyOnClose={true}
      title="快捷键设置"
      onOk={() => confirmSettingModal(item, selectValue)}
      onCancel={() => closeSettingModal(item)}
    >
      <div>
        Control + Alt + &nbsp; <Select placeholder="请选择" defaultValue={selectValue} style={{ width: 120 }} onChange={(val) => selectValue = val}>
          <Option value={null} >无</Option>
          {
            shortCutList.map(i => <Option value={i.value} disabled={i.disabled} key={i.value}>{i.value}</Option>)
          }
        </Select>
      </div>
    </Modal>
  )
}