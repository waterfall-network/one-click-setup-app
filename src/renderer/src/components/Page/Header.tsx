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
import { ArrowedButton } from '@renderer/ui-kit/Button'
import { Title } from '@renderer/ui-kit/Typography'
import { Breadcrumb, Item as BreadcrumbItem } from '@renderer/ui-kit/Breadcrumb'
import React from 'react'
import { keyframes, styled } from 'styled-components'

type PageHeaderPropsT = {
  title?: string
  subtitle?: string
  goBack?: () => void
  breadcrumb?: BreadcrumbItem[]
  actions?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderPropsT> = ({
  title,
  subtitle,
  breadcrumb,
  goBack,
  actions
}) => {
  const hasBreadcrumb = Boolean(breadcrumb && breadcrumb.length > 0)
  const breadcrumbPath = hasBreadcrumb
    ? (breadcrumb?.length || 0) > 1
      ? breadcrumb?.slice(0, -1)
      : []
    : []
  const resolvedTitle = hasBreadcrumb ? breadcrumb?.[breadcrumb.length - 1]?.title : title

  return (
    <Wrapper>
      <HeaderShell>
        <LeftPart>
          {goBack && (
            <GoBack>
              <ArrowedButton direction="back" onClick={goBack} />
            </GoBack>
          )}
          <TitleBlock>
            {breadcrumbPath && breadcrumbPath.length > 0 && <Breadcrumb items={breadcrumbPath} />}
            <PageTitle level={3}>{resolvedTitle}</PageTitle>
            {!hasBreadcrumb && subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
          </TitleBlock>
        </LeftPart>
        {actions && <Actions>{actions}</Actions>}
      </HeaderShell>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 12px 40px 18px;
  position: relative;
  z-index: 3;
`

const headerReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const actionReveal = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const HeaderShell = styled.div`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.palette.semantic.pageHeader.shellBorder};
  background: transparent;
  box-shadow: ${({ theme }) => theme.palette.semantic.pageHeader.shellShadow};
  backdrop-filter: blur(10px) saturate(140%);
  animation: ${headerReveal} 170ms ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.palette.semantic.pageHeader.shellBackground};
    box-shadow: inset 0 1px 0 ${({ theme }) => theme.palette.semantic.pageHeader.shellHighlight};
    backdrop-filter: blur(14px) saturate(155%);
    -webkit-backdrop-filter: blur(14px) saturate(155%);
    z-index: 0;
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`

const LeftPart = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
`

const TitleBlock = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const GoBack = styled.div`
  width: 44px;
  flex-shrink: 0;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;

  > * {
    animation: ${actionReveal} 190ms ease-out both;
  }

  > *:nth-child(1) {
    animation-delay: 0ms;
  }
  > *:nth-child(2) {
    animation-delay: 70ms;
  }
  > *:nth-child(3) {
    animation-delay: 140ms;
  }
  > *:nth-child(4) {
    animation-delay: 210ms;
  }

  @media (prefers-reduced-motion: reduce) {
    > * {
      animation: none;
    }
  }
`

const PageTitle = styled(Title)`
  margin: 0 !important;
  padding: 0 !important;
  font-weight: 600 !important;
  letter-spacing: -0.01em;
  line-height: 1.2 !important;
  color: ${({ theme }) => theme.palette.semantic.pageHeader.title} !important;
`

const PageSubtitle = styled.span`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: ${({ theme }) => theme.palette.semantic.pageHeader.crumb};
`
