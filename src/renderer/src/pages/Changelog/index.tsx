/*
 * Copyright 2024   Blue Wave Inc.
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
import { PageHeader } from '@renderer/components/Page/Header'
import { PageBody } from '@renderer/components/Page/Body'
import { Layout, Timeline } from 'antd'
import { Text } from '../../ui-kit/Typography'

const breadcrumb = [
  {
    title: 'Changelog'
  }
]
const items = [
  {
    children: (
      <>
        <Text size="sm">0.4.3 beta - 14.11.2024</Text>
        <p>New: Support testnet9</p>
        <p>Fix: Generate data for Metamask with delegate rules</p>
        <p>Update: Updating the node to the latest version</p>
      </>
    )
  },
  {
    children: (
      <>
        <Text size="sm">0.4.2 beta - 20.09.2024</Text>
        <p>New: Display the global validator index</p>
        <p>New: Display the amount of rewards</p>
        <p>Improve: Monitoring optimization</p>
        <p>Improve: Using the standard app close button</p>
        <p>Fix: Preventing a second instance of the application from starting</p>
        <p>Update: Updating the node to the latest version</p>
      </>
    )
  },
  {
    children: (
      <>
        <Text size="sm">0.4.1 beta - 12.08.2024</Text>
        <p>New: Add support delegate rules</p>
        <p>New: Add support provider node</p>
      </>
    )
  },
  {
    children: (
      <>
        <Text size="sm">0.4.0 beta - 24.07.2024</Text>
        <p>New: Add support mainnet</p>
        <p>Improve: Rename Worker to validator, Validator to Verifier</p>
      </>
    )
  },
  {
    children: (
      <>
        <Text size="sm">0.3.2 beta - 20.05.2024</Text>
        <p>Improve: Optimistic consensus</p>
      </>
    )
  },
  {
    children: (
      <>
        <Text size="sm">0.3.1 beta - 13.05.2024</Text>
        <p>New: #11 Download the last snapshot when adding a new Node</p>
        <p>New: #12 Import workers</p>
        <p>New: #17 Remove workers and nodes</p>
        <p>Improve: Add path when removing a node</p>
        <p>
          Improve: Disable activation/deactivation/withdraw workers buttons if the node is stopped
        </p>
        <p>Fix: #63 Add a check if a user tries to import a worker with an invalid mnemonic</p>
        <p>
          Fix: #36 Withdrawal procedure. When switching to another window, the fields are cleared
        </p>
        <p>Fix: Coordinator/Validators peers</p>
        <p>Fix: Adding workers</p>
      </>
    )
  },
  {
    children: (
      <>
        <Text size="sm">0.3.0 beta - 22.04.2024</Text>
        <p>New: #13 Windows signing app</p>
        <p>New: #44 MacOS signing app</p>
        <p>New: #49 Update logo and icons</p>
        <p>New: #42 Adding a changelog page</p>
        <p>New: #10 Adding an auto update feature</p>
        <p>New: #10 Adding App version to Status Bar</p>
        <p>Improve: #44 reduce app size</p>
        <p>Fix: Adding additional workers</p>
      </>
    )
  },

  {
    children: (
      <>
        <Text size="sm">0.2.1 beta - 10.04.2024</Text>
        <p>Improve: Save all errors to log file without alert</p>
        <p>Fix: Get Validator status</p>
      </>
    )
  },
  {
    children: (
      <>
        <Text size="sm">0.2.0 beta - 05.04.2024</Text>
        <p>New: Initial Public release</p>
      </>
    )
  }
]
export const ChangelogPage = () => {
  return (
    <Layout>
      <PageHeader breadcrumb={breadcrumb} />
      <PageBody>
        <Timeline items={items} mode="left" />
      </PageBody>
    </Layout>
  )
}
