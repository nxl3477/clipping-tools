import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from 'antd'
import styles from '../../homePage.scss'
const $modalNode = document.getElementById('modal')

export default function ShowDataModal(props) {
  const { visible, item, closeDataModal } = props
  return (
    <Modal
      visible={visible}
      title="查看数据"
      onCancel={() => closeDataModal(item)}
      footer={null}
    >
      { item && (item.type === 'text' ? <pre className={styles.showDataModal}>{item.data}</pre> : <img className={styles.showDataModal} src={item.srcPath} alt="" />)}
    </Modal>
  )
} 