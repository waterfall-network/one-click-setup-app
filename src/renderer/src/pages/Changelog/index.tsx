/*
 * Copyright 2024 Blue Wave Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { PageHeader } from '@renderer/components/Page/Header'
import { PageBody } from '@renderer/components/Page/Body'
import { Layout } from '@renderer/ui-kit/Layout'
import { Timeline } from '@renderer/ui-kit/Timeline'
import React from 'react'
import { styled } from 'styled-components'

enum ChangeType {
  New = 'New',
  Fix = 'Fix',
  Update = 'Update',
  Improve = 'Improve'
}

interface ChangelogEntry {
  type: ChangeType
  description: string
}

interface ChangelogVersion {
  version: string
  date: string
  changes: ChangelogEntry[]
}

const breadcrumb = [
  {
    title: 'Changelog'
  }
]

const changelogData: ChangelogVersion[] = [
  {
    version: '0.6.0 beta',
    date: '15.02.2026',
    changes: [
      {
        type: ChangeType.New,
        description:
          'Added Settings page, startup options, backup tools, and import/export progress'
      },
      {
        type: ChangeType.Improve,
        description: 'Added Light/Dark/System themes and refreshed app visuals'
      },
      {
        type: ChangeType.Improve,
        description: 'Added smoother animations across key interface elements'
      },
      {
        type: ChangeType.Improve,
        description: 'Improved scrolling, detail tab alignment, and bulk modal UX'
      },
      {
        type: ChangeType.Improve,
        description: 'Optimized table loading, polling, and bulk operation batching'
      },
      {
        type: ChangeType.Improve,
        description: 'Refined startup flow and pre-launch progress window'
      },
      {
        type: ChangeType.Fix,
        description: 'Improved node monitoring stability and fixed loader clipping'
      },
      {
        type: ChangeType.Fix,
        description: 'Fixed bulk withdraw/deactivate checks and activation warning'
      },
      {
        type: ChangeType.New,
        description: 'Added configurable log level and option to export main.log from Settings'
      }
    ]
  },
  {
    version: '0.5.1 beta',
    date: '14.01.2026',
    changes: [
      { type: ChangeType.Update, description: 'Updated node to the latest version' },
      {
        type: ChangeType.Fix,
        description: 'Added transaction pool check before sending mass transactions'
      },
      { type: ChangeType.Fix, description: 'Fixed macOS build issues' }
    ]
  },
  {
    version: '0.5.0 beta',
    date: '02.01.2026',
    changes: [
      { type: ChangeType.Improve, description: 'Optimized validator list page performance' },
      { type: ChangeType.Update, description: 'Added balance filter to validator list' }
    ]
  },
  {
    version: '0.4.10 beta',
    date: '12.09.2025',
    changes: [{ type: ChangeType.Update, description: 'Updated node to the latest version' }]
  },
  {
    version: '0.4.9 beta',
    date: '06.03.2025',
    changes: [
      { type: ChangeType.Update, description: 'Updated node to the latest version' },
      { type: ChangeType.Fix, description: 'Fixed balance display issues' }
    ]
  },
  {
    version: '0.4.8 beta',
    date: '17.02.2025',
    changes: [{ type: ChangeType.Update, description: 'Updated node to the latest version' }]
  },
  {
    version: '0.4.7 beta',
    date: '05.02.2025',
    changes: [
      { type: ChangeType.Update, description: 'Updated node to the latest version' },
      { type: ChangeType.Fix, description: 'Fixed monitoring system issues' },
      { type: ChangeType.Fix, description: 'Fixed node status monitoring' }
    ]
  },
  {
    version: '0.4.6 beta',
    date: '28.01.2025',
    changes: [
      { type: ChangeType.New, description: 'Added filtering options for validators' },
      { type: ChangeType.Update, description: 'Updated node to the latest version' },
      { type: ChangeType.Fix, description: 'Fixed local node status checking' },
      { type: ChangeType.Fix, description: 'Fixed gas price calculation per transaction' },
      { type: ChangeType.Fix, description: 'Fixed monitoring system' }
    ]
  },
  {
    version: '0.4.5 beta',
    date: '27.12.2024',
    changes: [{ type: ChangeType.Fix, description: 'Fixed bulk validator status retrieval' }]
  },
  {
    version: '0.4.4 beta',
    date: '24.12.2024',
    changes: [{ type: ChangeType.Update, description: 'Updated node to the latest version' }]
  },
  {
    version: '0.4.3 beta',
    date: '14.11.2024',
    changes: [
      { type: ChangeType.New, description: 'Added support for testnet9' },
      { type: ChangeType.Fix, description: 'Fixed MetaMask data generation with delegate rules' },
      { type: ChangeType.Update, description: 'Updated node to the latest version' }
    ]
  },
  {
    version: '0.4.2 beta',
    date: '20.09.2024',
    changes: [
      { type: ChangeType.New, description: 'Added global validator index display' },
      { type: ChangeType.New, description: 'Added rewards amount display' },
      { type: ChangeType.New, description: 'Added total rewards sum to validators table' },
      { type: ChangeType.Improve, description: 'Optimized monitoring system performance' },
      { type: ChangeType.Improve, description: 'Switched to native application close button' },
      {
        type: ChangeType.Fix,
        description: 'Prevented multiple application instances from launching'
      },
      { type: ChangeType.Update, description: 'Updated node to the latest version' }
    ]
  },
  {
    version: '0.4.1 beta',
    date: '12.08.2024',
    changes: [
      { type: ChangeType.New, description: 'Added support for delegate rules' },
      { type: ChangeType.New, description: 'Added support for provider nodes' },
      { type: ChangeType.Fix, description: 'Fixed local validators handling' },
      {
        type: ChangeType.Improve,
        description: 'Improved water amount display precision (2 decimal places)'
      }
    ]
  },
  {
    version: '0.4.0 beta',
    date: '24.07.2024',
    changes: [
      { type: ChangeType.New, description: 'Added mainnet support' },
      {
        type: ChangeType.Improve,
        description: 'Renamed terminology: Worker → Validator, Validator → Verifier'
      }
    ]
  },
  {
    version: '0.3.2 beta',
    date: '20.05.2024',
    changes: [
      { type: ChangeType.New, description: 'Added automatic update on application start' },
      { type: ChangeType.Improve, description: 'Improved optimistic consensus implementation' }
    ]
  },
  {
    version: '0.3.1 beta',
    date: '13.05.2024',
    changes: [
      {
        type: ChangeType.New,
        description: 'Automatic snapshot download when adding a new node'
      },
      {
        type: ChangeType.New,
        description: 'Snapshot download controls: pause, resume, and remove'
      },
      {
        type: ChangeType.New,
        description: 'Worker import functionality'
      },
      {
        type: ChangeType.New,
        description: 'Worker and node removal functionality'
      },
      { type: ChangeType.New, description: 'Ability to add workers when node is stopped' },
      { type: ChangeType.New, description: 'Node restart functionality' },
      { type: ChangeType.New, description: 'Date parameter selection for snapshots' },
      { type: ChangeType.Improve, description: 'Display node path when removing a node' },
      {
        type: ChangeType.Improve,
        description: 'Disabled worker action buttons when node is stopped'
      },
      { type: ChangeType.Improve, description: 'Added monitoring data to application logs' },
      {
        type: ChangeType.Fix,
        description: 'Added validation for invalid mnemonic phrases during worker import'
      },
      {
        type: ChangeType.Fix,
        description: 'Fixed withdrawal form fields being cleared when switching windows'
      },
      { type: ChangeType.Fix, description: 'Fixed coordinator and validator peers connection' },
      { type: ChangeType.Fix, description: 'Fixed worker addition process' },
      { type: ChangeType.Update, description: 'Added P2P host IP configuration option' }
    ]
  },
  {
    version: '0.3.0 beta',
    date: '22.04.2024',
    changes: [
      { type: ChangeType.New, description: 'Windows application code signing' },
      { type: ChangeType.New, description: 'macOS application code signing' },
      { type: ChangeType.New, description: 'Updated application logo and icons' },
      { type: ChangeType.New, description: 'Added changelog page' },
      { type: ChangeType.New, description: 'Automatic update feature' },
      {
        type: ChangeType.New,
        description: 'Application version display in status bar'
      },
      { type: ChangeType.New, description: 'NAT traversal support' },
      { type: ChangeType.Improve, description: 'Reduced application bundle size' },
      { type: ChangeType.Fix, description: 'Fixed adding additional workers' },
      { type: ChangeType.Fix, description: 'Fixed validator addition process' }
    ]
  },
  {
    version: '0.2.1 beta',
    date: '10.04.2024',
    changes: [
      {
        type: ChangeType.Improve,
        description: 'All errors are now saved to log file without alerts'
      },
      { type: ChangeType.Fix, description: 'Fixed validator status retrieval' }
    ]
  },
  {
    version: '0.2.0 beta',
    date: '05.04.2024',
    changes: [{ type: ChangeType.New, description: 'Initial public release' }]
  }
]

const sortChangesByType = (changes: ChangelogEntry[]): ChangelogEntry[] => {
  const typeOrder = [ChangeType.New, ChangeType.Improve, ChangeType.Update, ChangeType.Fix]
  return [...changes].sort((a, b) => {
    const indexA = typeOrder.indexOf(a.type)
    const indexB = typeOrder.indexOf(b.type)
    return indexA - indexB
  })
}

const formatChangeEntry = (entry: ChangelogEntry): React.ReactNode => {
  const prefix = entry.type
  return (
    <ChangeLine key={`${entry.type}-${entry.description}`}>
      <ChangePrefix $type={entry.type}>{prefix}</ChangePrefix>
      <span>{entry.description}</span>
    </ChangeLine>
  )
}

export const ChangelogPage = () => {
  const items = changelogData.map((version) => ({
    content: (
      <ReleaseBlock>
        <ReleaseHeader>
          <VersionText>{version.version}</VersionText>
          <DateText>{version.date}</DateText>
        </ReleaseHeader>
        {sortChangesByType(version.changes).map(formatChangeEntry)}
      </ReleaseBlock>
    )
  }))

  return (
    <Layout>
      <PageHeader breadcrumb={breadcrumb} />
      <PageBody>
        <TimelineWrap>
          <Timeline items={items} mode="start" />
        </TimelineWrap>
      </PageBody>
    </Layout>
  )
}

const TimelineWrap = styled.div`
  width: 100%;
  max-width: 1120px;

  .ant-timeline-item-content {
    max-width: 980px;
    padding-bottom: 22px;
  }
`

const ReleaseBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ReleaseHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 2px;
`

const VersionText = styled.span`
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.002em;
  line-height: 1.25;
`

const DateText = styled.span`
  font-size: 15px;
  font-weight: 500;
  opacity: 0.68;
`

const ChangeLine = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.45;
  letter-spacing: 0.002em;
`

const ChangePrefix = styled.span<{ $type: ChangeType }>`
  display: inline-block;
  min-width: 88px;
  margin-right: 2px;
  font-weight: 600;
  color: ${({ $type, theme }) => {
    if ($type === ChangeType.New) return theme.palette.semantic.changelog.new
    if ($type === ChangeType.Improve) return theme.palette.semantic.changelog.improve
    if ($type === ChangeType.Update) return theme.palette.semantic.changelog.update
    return theme.palette.semantic.changelog.fix
  }};
`
