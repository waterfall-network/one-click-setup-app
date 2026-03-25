/*
 * Copyright 2026   Digital Clever Solution Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { Modal as AntdModal } from 'antd'
import { keyframes, styled } from 'styled-components'

const modalReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

const maskReveal = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export const Modal = styled(AntdModal)`
  .ant-modal {
    animation: ${modalReveal} 200ms cubic-bezier(0.22, 0.61, 0.36, 1);
    transform-origin: 50% 20%;
    will-change: transform, opacity;
  }

  .ant-modal-content {
    transition: box-shadow 180ms ease;
  }

  .ant-modal-mask {
    animation: ${maskReveal} 180ms ease-out;
  }

  .ant-modal-header {
    border-bottom: 1px solid ${({ theme }) => theme.palette.semantic.form.actionsBorder};
    margin-bottom: 14px;
    padding-bottom: 10px;
  }

  .ant-modal-title {
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  @media (prefers-reduced-motion: reduce) {
    .ant-modal,
    .ant-modal-mask {
      animation: none !important;
    }

    .ant-modal-content,
    .ant-modal {
      transition: none !important;
      transform: none !important;
      opacity: 1 !important;
    }
  }
`
