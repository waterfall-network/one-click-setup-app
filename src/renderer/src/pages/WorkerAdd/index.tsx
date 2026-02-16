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
import { SearchKeys } from '@renderer/constants/navigation'
import { useSearchParams } from 'react-router-dom'
import { Layout } from '@renderer/ui-kit/Layout'
import { PageHeader } from '@renderer/components/Page/Header'
import { PageBody } from '@renderer/components/Page/Body'
import { AddWorker } from '@renderer/containers/Workers/AddWorker'

export const AddWorkerPage = () => {
  const [searchParams] = useSearchParams()
  const fromMode = searchParams.get(SearchKeys.mode)

  const mode = fromMode === 'import' ? 'import' : 'add'

  return (
    <Layout>
      <PageHeader
        title={mode === 'add' ? 'Add Validator' : 'Import Validator'}
        subtitle={
          mode === 'add'
            ? 'Create validators step-by-step for the selected node'
            : 'Import existing validators from prepared files'
        }
      />
      <PageBody>
        <AddWorker mode={mode} />
      </PageBody>
    </Layout>
  )
}
