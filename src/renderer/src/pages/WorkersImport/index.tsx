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
import { useState } from 'react'
import { SearchKeys } from '@renderer/constants/navigation'
import { useSearchParams } from 'react-router-dom'
import { getImportWorkersSteps } from '@renderer/helpers/workers'
import { Flex } from '@renderer/ui-kit/Flex'
import { Layout } from '@renderer/ui-kit/Layout'
import { PageHeader } from '@renderer/components/Page/Header'
import { ArrowedButton } from '@renderer/ui-kit/Button'
import { PageBody } from '@renderer/components/Page/Body'
import { ImportWorkers } from '@renderer/containers/Workers/ImportWorkers'

export const ImportWorkerPage = () => {
  const [searchParams] = useSearchParams()
  const fromNode = searchParams.get(SearchKeys.node)

  const { steps, stepsWithKeys } = getImportWorkersSteps(fromNode)
  const [step, setStep] = useState<number>(0)
  const onStepsChange = (value: number) => setStep(value)
  const goNext = () => setStep((prev) => (prev + 1 < steps.length ? prev + 1 : prev))
  const goPrev = () => setStep((prev) => (prev - 1 >= 0 ? prev - 1 : prev))

  return (
    <Layout>
      <PageHeader
        title="Import Validator"
        actions={
          <Flex align="center" gap={4}>
            {step > 0 && <ArrowedButton direction="back" onClick={goPrev} />}
            {step < 3 && <ArrowedButton direction="forward" onClick={goNext} />}
          </Flex>
        }
      />
      <PageBody>
        <ImportWorkers
          step={step}
          steps={steps}
          stepsWithKeys={stepsWithKeys}
          onChangeStep={onStepsChange}
          goNextStep={goNext}
          goPrevStep={goPrev}
        />
      </PageBody>
    </Layout>
  )
}
