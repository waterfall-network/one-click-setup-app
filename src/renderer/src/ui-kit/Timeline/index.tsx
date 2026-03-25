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
import React from 'react'
import { Timeline as AntdTimeline, type TimelineProps } from 'antd'
import { keyframes, styled } from 'styled-components'

export { type TimelineProps }

export const Timeline: React.FC<TimelineProps> = (props) => <StyledTimeline {...props} />

const timelineItemReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const StyledTimeline = styled(AntdTimeline)`
  .ant-timeline-item {
    animation: ${timelineItemReveal} 220ms ease-out both;
  }

  .ant-timeline-item:nth-child(1) {
    animation-delay: 0ms;
  }
  .ant-timeline-item:nth-child(2) {
    animation-delay: 35ms;
  }
  .ant-timeline-item:nth-child(3) {
    animation-delay: 70ms;
  }
  .ant-timeline-item:nth-child(4) {
    animation-delay: 105ms;
  }
  .ant-timeline-item:nth-child(5) {
    animation-delay: 140ms;
  }
  .ant-timeline-item:nth-child(6) {
    animation-delay: 175ms;
  }
  .ant-timeline-item:nth-child(7) {
    animation-delay: 210ms;
  }
  .ant-timeline-item:nth-child(8) {
    animation-delay: 245ms;
  }

  @media (prefers-reduced-motion: reduce) {
    .ant-timeline-item {
      animation: none;
    }
  }
`
