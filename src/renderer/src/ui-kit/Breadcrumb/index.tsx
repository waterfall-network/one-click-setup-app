/*
 * Copyright 2026 Digital Clever Solution Inc.
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
import { Breadcrumb as AntBreadcrumb } from 'antd'
import React from 'react'
import { styled } from 'styled-components'
import { Link } from '../Link'
import { Text } from '../Typography'

export type Item = {
  title: string
  link?: string
}
type BreadcrumbProps = {
  items: Item[]
}
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <StyledBreadcrumb
      separator={<CrumbSeparator>/</CrumbSeparator>}
      items={items.map(({ title, link }) => ({
        title: link ? (
          <StyledLink to={link}>
            <CrumbText>{title}</CrumbText>
          </StyledLink>
        ) : (
          <CrumbText>{title}</CrumbText>
        )
      }))}
    />
  )
}

const StyledBreadcrumb = styled(AntBreadcrumb)`
  display: flex;
  align-items: center;
  line-height: 1;

  .ant-breadcrumb-link {
    display: inline-flex;
    align-items: center;
  }

  .ant-breadcrumb-separator {
    display: inline-flex;
    align-items: center;
    margin-inline: 10px !important;
  }
`

const StyledLink = styled(Link)`
  text-decoration: none !important;
  user-select: none !important;
  height: auto !important;
  display: inline-flex;
  align-items: center;
  &:hover {
    background-color: inherit !important;
  }
`

const CrumbText = styled(Text)`
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.3;
  color: ${({ theme }) => theme.palette.semantic.pageHeader.crumb} !important;
`

const CrumbSeparator = styled.span`
  font-size: 16px;
  line-height: 1;
  color: ${({ theme }) => theme.palette.semantic.pageHeader.crumbSeparator};
`
