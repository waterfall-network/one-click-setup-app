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
import React from 'react'
import { Flex, Input, Select, StepsProps } from 'antd'
import { ImportWorkersStepKeys } from '@renderer/helpers/workers'
import { useImportWorker } from '@renderer/hooks/workers'
import { StepsWithActiveContent } from '@renderer/ui-kit/Steps/Steps'
import { AddWorkerForm } from '@renderer/components/Workers/AddWorker/AddWorkerForm'
import {
  DisplayKeysFields,
  ImportWorkerFields,
  WorkerTransactionTableFields
} from '@renderer/types/workers'
import { Text } from '@renderer/ui-kit/Typography'
import { WorkerKeysTable } from '@renderer/components/Workers/AddWorker/WorkerKeysTable'
import { WorkerTransactionTable } from '@renderer/components/Workers/AddWorker/WorkerTransactionTable'
import { MnemonicInput } from '@renderer/ui-kit/Mnemonic/MnemonicInput'

type StepItem = NonNullable<StepsProps['items']>[number]
type ImportWorkerPropsT = {
  steps: Partial<StepItem>[]
  stepsWithKeys: Partial<StepItem & { key: string }>[]
  step: number
  onChangeStep: (value: number) => void
  goNextStep: () => void
  goPrevStep: () => void
}

export const ImportWorkers: React.FC<ImportWorkerPropsT> = ({
  steps,
  stepsWithKeys,
  step,
  onChangeStep,
  goNextStep,
  goPrevStep
}) => {
  const { values, handleChange } = useImportWorker()

  const StepComponent = {
    [ImportWorkersStepKeys.node]: (
      <NodeSelect
        value={values[ImportWorkerFields.node]}
        onChange={handleChange(ImportWorkerFields.node)}
        goNext={goNextStep}
        goPrev={goPrevStep}
      />
    ),
    [ImportWorkersStepKeys.mnemonic]: (
      <VerifyMnemonicPhrase
        value={values[ImportWorkerFields.mnemonic]}
        onChange={handleChange(ImportWorkerFields.mnemonic)}
        goNext={goNextStep}
        goPrev={goPrevStep}
      />
    ),
    [ImportWorkersStepKeys.displayWorkers]: (
      <DisplayFoundedWorkers foundedCount={23} goNext={goNextStep} goPrev={goPrevStep} />
    ),
    [ImportWorkersStepKeys.withdrawalAddress]: (
      <WithdrawalAddress
        value={values[ImportWorkerFields.withdrawalAddress]}
        onChange={handleChange(ImportWorkerFields.withdrawalAddress)}
        goNext={goNextStep}
        goPrev={goPrevStep}
      />
    ),
    [ImportWorkersStepKeys.displayKeys]: <DisplayKeys goNext={goNextStep} goPrev={goPrevStep} />,
    [ImportWorkersStepKeys.sendTransaction]: (
      <SendTransactionTable goNext={goNextStep} goPrev={goPrevStep} />
    )
  }

  const stepsWithContent = steps.map((el, index) => {
    const currentKey = stepsWithKeys?.[index].key
    const activeStep = index === step
    return {
      title: el?.title,
      content: activeStep ? currentKey && StepComponent[currentKey] : null
    }
  })
  return (
    <>
      <StepsWithActiveContent
        orientation="vertical"
        current={step}
        onChange={onChangeStep}
        items={stepsWithContent}
      />
    </>
  )
}

type BasePropsT = {
  goNext: () => void
  goPrev: () => void
}

const NodeSelect: React.FC<
  BasePropsT & {
    value?: string
    onChange?: (val?: string) => void
  }
> = ({ value, onChange, goNext }) => {
  const options = [{ label: 'Test Node 1', value: '1' }]
  return (
    <AddWorkerForm title="Select a Node" goNext={goNext} canGoNext={!!value}>
      <Select options={options} onChange={onChange} value={value} style={{ width: '200px' }} />
    </AddWorkerForm>
  )
}

const VerifyMnemonicPhrase: React.FC<
  BasePropsT & {
    phrase?: string[]
    value: Record<number, string>
    onChange: (value: Record<number, string>) => void
  }
> = ({ goNext, goPrev, value, onChange }) => {
  // const isValid = phrase.join('') === Object.values(value).join('')
  const isValid = Object.values(value).filter((el) => el).length === 24

  return (
    <AddWorkerForm
      title="Verify a mnemonic phrase. Select the words in correct order"
      goNext={goNext}
      goPrev={goPrev}
      canGoNext={isValid}
    >
      <MnemonicInput value={value} onChange={onChange} />
    </AddWorkerForm>
  )
}

const DisplayFoundedWorkers: React.FC<
  BasePropsT & {
    foundedCount?: number
  }
> = ({ goNext, goPrev, foundedCount }) => {
  const isValid = !!foundedCount

  return (
    <AddWorkerForm
      title="Display # Validators and confirm import"
      goNext={goNext}
      goPrev={goPrev}
      canGoNext={isValid}
    >
      <Flex>
        <Text>
          {foundedCount ? `${foundedCount} Validators were found.` : 'Validators were not found.'}
        </Text>
      </Flex>
    </AddWorkerForm>
  )
}

const WithdrawalAddress: React.FC<
  BasePropsT & { value?: string; onChange: (value?: string) => void }
> = ({ goNext, goPrev, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)
  return (
    <AddWorkerForm
      title="Enter your withdrawal address"
      goNext={goNext}
      goPrev={goPrev}
      canGoNext={!!value}
    >
      <Input value={value} onChange={handleChange} style={{ maxWidth: '400px' }} />
    </AddWorkerForm>
  )
}

const DisplayKeys: React.FC<BasePropsT> = ({ goNext, goPrev }) => {
  const data = [
    {
      key: '1',
      [DisplayKeysFields.id]: '1',
      [DisplayKeysFields.coordinatorKey]: '3kj3kj3kj34l4kl4l3k4l',
      [DisplayKeysFields.validatorKey]: '5dj3463kj34l4kl4l3k4l',
      [DisplayKeysFields.withdrawalAddress]: '0xDccA352601a464e8d629A2E8CFBa9C1a27612751'
    }
  ]
  return (
    <AddWorkerForm goNext={goNext} goPrev={goPrev} canGoNext={true}>
      <WorkerKeysTable data={data} />
    </AddWorkerForm>
  )
}

const SendTransactionTable: React.FC<BasePropsT> = ({ goNext, goPrev }) => {
  const data = [
    {
      key: '1',
      [WorkerTransactionTableFields.id]: '1',
      [WorkerTransactionTableFields.depositAddress]: '0xDccA352601a464e8d629A2E8CFBa9C1a27612751',
      [WorkerTransactionTableFields.hexData]: '1',
      [WorkerTransactionTableFields.value]: '320',
      [WorkerTransactionTableFields.qr]: ''
    },
    {
      key: '2',
      [WorkerTransactionTableFields.id]: '2',
      [WorkerTransactionTableFields.depositAddress]: '0xDccA352601a464e8d629A2E8CFBa9C1a27612751',
      [WorkerTransactionTableFields.hexData]: '1',
      [WorkerTransactionTableFields.value]: '320',
      [WorkerTransactionTableFields.qr]: 'test'
    }
  ]
  return (
    <AddWorkerForm
      goNext={goNext}
      goPrev={goPrev}
      canGoNext={true}
      nextText="I have sent the deposits"
    >
      <WorkerTransactionTable data={data} />
    </AddWorkerForm>
  )
}
