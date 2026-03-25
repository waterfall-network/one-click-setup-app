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
import React, { useEffect, useState } from 'react'
import { Flex } from '@renderer/ui-kit/Flex'
import { AddWorkerStepKeys } from '@renderer/helpers/workers'
import { isAddress } from '../../helpers/common'
import { useAddWorker } from '@renderer/hooks/workers'
import { AddWorkerForm } from '@renderer/components/Workers/AddWorker/AddWorkerForm'
import { AddWorkerPreview } from '@renderer/components/Workers/AddWorker/AddWorkerPreview'
import { AddWorkerFields, AddWorkerFormValuesT, DelegateRulesT } from '@renderer/types/workers'
import { Type as NodeType } from '@renderer/types/node'
import { ButtonPrimary, ButtonTextPrimary } from '@renderer/ui-kit/Button'
import { StepsWithActiveContent } from '@renderer/ui-kit/Steps'
import { GenerateMnemonic, VerifyMnemonic, MnemonicInput } from '@renderer/ui-kit/Mnemonic'
import { Node } from '@renderer/types/node'
import { verifyMnemonic } from '../../helpers/workers'
import { getAddWorkerSteps } from '@renderer/helpers/workers'
import { routes } from '@renderer/constants/navigation'
import { addParams } from '@renderer/helpers/navigation'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchKeys } from '@renderer/constants/navigation'
import { useGetAll, useGetById } from '@renderer/hooks/node'
import { DataFile } from '@renderer/ui-kit/DataFile'
import { Text } from '@renderer/ui-kit/Typography'
import { Input, InputNumber } from '@renderer/ui-kit/Input'
import { Select } from '@renderer/ui-kit/Select'
import { DelegateRules as DelegateRulesComponent } from '../../components/DelegateRules'

type AddWorkerPropsT = {
  mode: 'add' | 'import'
  nodeId?: string
}

export const AddWorker: React.FC<AddWorkerPropsT> = ({ mode }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const fromNode = searchParams.get(SearchKeys.node)
  const fromStep = searchParams.get(SearchKeys.step)

  const step = fromStep ? Number(fromStep) : 0

  const { data } = useGetAll()
  const nodes = mode === 'import' ? data?.filter((node) => node.workersCount === 0) : data

  const nodeId = fromNode
    ? fromNode
    : nodes && nodes.length > 0
      ? nodes[0].id.toString()
      : undefined
  // const nodeId = searchParams.get(SearchKeys.node)

  const { data: node } = useGetById(nodeId || undefined)

  const {
    values,
    handleChange,
    handleSaveMnemonic,
    onSelectFile,
    deposit,
    onAdd,
    handleChangeNode,
    isLoading,
    error
  } = useAddWorker(node, mode)

  const { steps, stepsWithKeys } = getAddWorkerSteps(node, mode)

  const onChangeStep = (step: number) =>
    navigate(
      addParams(routes.workers.add, {
        [SearchKeys.mode]: mode,
        [SearchKeys.node]: nodeId ? nodeId.toString() : '',
        [SearchKeys.step]: step.toString()
      })
    )
  const goNextStep = () => onChangeStep(step + 1 <= steps.length ? step + 1 : step)
  const goPrevStep = () => onChangeStep(step - 1 >= 0 ? step - 1 : step)

  useEffect(() => {
    if (fromNode === null && fromStep === null && nodes && nodes.length > 0) {
      onChangeStep(0)
    }
  }, [fromStep, nodes, fromNode, mode])

  const StepComponent = {
    [AddWorkerStepKeys.node]: (
      <NodeSelect
        data={nodes}
        value={node && node.id.toString()}
        onChange={handleChangeNode}
        goNext={goNextStep}
        goPrev={goPrevStep}
      />
    ),
    [AddWorkerStepKeys.saveMnemonic]: (
      <SaveMnemonic
        goNext={goNextStep}
        goPrev={goPrevStep}
        phrase={values[AddWorkerFields.mnemonic]}
        onSaveFile={handleSaveMnemonic}
      />
    ),
    [AddWorkerStepKeys.verifyMnemonic]: (
      <VerifyMnemonicPhrase
        goNext={goNextStep}
        goPrev={goPrevStep}
        phrase={values[AddWorkerFields.mnemonic]}
        onChange={handleChange(AddWorkerFields.mnemonicVerify)}
        value={values[AddWorkerFields.mnemonicVerify]}
      />
    ),
    [AddWorkerStepKeys.getMnemonic]: (
      <GetMnemonicPhrase
        goNext={goNextStep}
        goPrev={goPrevStep}
        memoHash={node?.memoHash}
        isValidationMemoHash={true}
        value={values[AddWorkerFields.mnemonicVerify]}
        onChange={handleChange(AddWorkerFields.mnemonicVerify)}
      />
    ),
    [AddWorkerStepKeys.importMnemonic]: (
      <GetMnemonicPhrase
        goNext={goNextStep}
        goPrev={goPrevStep}
        value={values[AddWorkerFields.mnemonicVerify]}
        onChange={handleChange(AddWorkerFields.mnemonicVerify)}
      />
    ),
    [AddWorkerStepKeys.workersAmount]: (
      <WorkersAmount
        goNext={goNextStep}
        goPrev={goPrevStep}
        onChange={handleChange(AddWorkerFields.amount)}
        value={values[AddWorkerFields.amount]}
      />
    ),
    [AddWorkerStepKeys.withdrawalAddress]: (
      <WithdrawalAddress
        goNext={goNextStep}
        goPrev={goPrevStep}
        onChange={handleChange(AddWorkerFields.withdrawalAddress)}
        value={values[AddWorkerFields.withdrawalAddress]}
      />
    ),
    [AddWorkerStepKeys.depositData]: (
      <DepositData
        goNext={goNextStep}
        goPrev={goPrevStep}
        onChange={handleChange(AddWorkerFields.depositData)}
        onSelectFile={onSelectFile(AddWorkerFields.depositData)}
        value={values[AddWorkerFields.depositData]}
        depositDataCount={deposit.depositDataCount}
      />
    ),
    [AddWorkerStepKeys.delegateRules]: (
      <DelegateRules
        goNext={goNextStep}
        goPrev={goPrevStep}
        onChange={handleChange(AddWorkerFields.delegateRules)}
        onSelectFile={onSelectFile(AddWorkerFields.delegateRules)}
        value={values[AddWorkerFields.delegateRules]}
        delegateRules={deposit.delegateRules}
      />
    ),
    [AddWorkerStepKeys.preview]: (
      <Preview
        values={values}
        node={node}
        mode={mode}
        goNext={onAdd}
        goPrev={goPrevStep}
        isLoading={isLoading}
        error={error}
        deposit={deposit}
      />
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
  isLoading?: boolean
  error?: string
}

const NodeSelect: React.FC<
  BasePropsT & {
    value?: string
    onChange?: (val?: string) => void
    data?: Node[]
  }
> = ({ value, onChange, goNext, data }) => {
  const options = data?.map((node) => ({ label: node.name, value: node.id.toString() }))
  const canGoNext = data && value && data.find((node) => node.id === parseInt(value))
  return (
    <AddWorkerForm title="Select a Node" goNext={goNext} canGoNext={!!canGoNext}>
      <Select options={options} onChange={onChange} value={value} style={{ width: '200px' }} />
    </AddWorkerForm>
  )
}

const SaveMnemonic: React.FC<BasePropsT & { phrase: string[]; onSaveFile: () => void }> = ({
  goNext,
  goPrev,
  phrase,
  onSaveFile
}) => {
  const [copy, setCopy] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(phrase.join(' '))
    setCopy(true)
  }
  useEffect(() => {
    if (copy) setTimeout(() => setCopy(false), 2500)
  }, [copy])
  return (
    <AddWorkerForm
      title="Save next phrases to restore keys in future:"
      extra={
        <Flex gap={10}>
          <ButtonTextPrimary ghost onClick={handleCopy}>
            {copy ? 'Copied' : 'Copy'}
          </ButtonTextPrimary>
          <ButtonPrimary onClick={() => onSaveFile()}>Save in a file</ButtonPrimary>
        </Flex>
      }
      goNext={goNext}
      goPrev={goPrev}
    >
      <GenerateMnemonic phrase={phrase} />
    </AddWorkerForm>
  )
}

const VerifyMnemonicPhrase: React.FC<
  BasePropsT & {
    phrase: string[]
    value: Record<number, string>
    onChange: (value: Record<number, string>) => void
  }
> = ({ goNext, goPrev, phrase, value, onChange }) => {
  const isValid = phrase.join('') === Object.values(value).join('')

  return (
    <AddWorkerForm
      title="Verify a mnemonic phrase. Select the words in correct order"
      goNext={goNext}
      goPrev={goPrev}
      canGoNext={isValid}
    >
      <VerifyMnemonic phrase={phrase} value={value} handleChange={onChange} />
    </AddWorkerForm>
  )
}

const GetMnemonicPhrase: React.FC<
  BasePropsT & {
    memoHash?: string
    isValidationMemoHash?: boolean
    value: Record<number, string>
    onChange: (value: Record<number, string>) => void
  }
> = ({ goNext, goPrev, memoHash, isValidationMemoHash = false, value, onChange }) => {
  let isValid = Object.values(value).filter((el) => el).length === 24
  if (isValidationMemoHash) {
    isValid = isValid && !!memoHash
    if (isValid && memoHash) {
      isValid = verifyMnemonic(Object.values(value).join(' '), memoHash)
    }
  }

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

const WorkersAmount: React.FC<
  BasePropsT & { value: number | null; onChange: (value: number | null) => void }
> = ({ goNext, goPrev, value, onChange }) => {
  return (
    <AddWorkerForm
      title="Select the number of Validators that you want to add"
      goNext={goNext}
      goPrev={goPrev}
      canGoNext={!!value}
    >
      <InputNumber min={1} max={100} value={value} onChange={onChange} />
    </AddWorkerForm>
  )
}

const WithdrawalAddress: React.FC<
  BasePropsT & { value?: string; onChange: (value?: string) => void }
> = ({ goNext, goPrev, value, onChange }) => {
  const [status, setStatus] = useState<'' | 'error'>('')
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)

  useEffect(() => {
    setStatus(value && !isAddress(value) ? 'error' : '')
  }, [value])

  return (
    <AddWorkerForm
      title="Enter your withdrawal address"
      goNext={goNext}
      goPrev={goPrev}
      canGoNext={!!value}
    >
      <Input status={status} value={value} onChange={handleChange} style={{ maxWidth: '400px' }} />
    </AddWorkerForm>
  )
}

const DepositData: React.FC<
  BasePropsT & {
    value?: string
    onChange: (value?: string) => void
    onSelectFile: () => void
    depositDataCount: number
  }
> = ({ goNext, goPrev, value, onChange, onSelectFile, depositDataCount }) => {
  return (
    <AddWorkerForm title="Select Deposit Data" goNext={goNext} goPrev={goPrev} canGoNext={!!value}>
      <DataFile
        placeholder="Select Deposit Data"
        value={value}
        handleChange={onChange}
        onSelectFile={onSelectFile}
        // errorMessage={error}
      />
      <Text size="sm">Validators count: {depositDataCount}</Text>
    </AddWorkerForm>
  )
}

const DelegateRules: React.FC<
  BasePropsT & {
    value?: string
    onChange: (value?: string) => void
    onSelectFile: () => void
    delegateRules?: DelegateRulesT
  }
> = ({ goNext, goPrev, value, onChange, onSelectFile, delegateRules }) => {
  return (
    <AddWorkerForm
      title="Select Delegate Rules"
      goNext={goNext}
      goPrev={goPrev}
      canGoNext={!!value}
    >
      <DataFile
        placeholder="Select Delegate Rules"
        value={value}
        handleChange={onChange}
        onSelectFile={onSelectFile}
        // errorMessage={error}
      />
      <DelegateRulesComponent delegateRules={delegateRules} />
    </AddWorkerForm>
  )
}

const Preview: React.FC<
  BasePropsT & {
    values: AddWorkerFormValuesT
    node?: Node
    mode: 'add' | 'import'
    deposit: { depositDataCount: number; delegateRules?: DelegateRulesT }
  }
> = ({ goNext, goPrev, values, node, mode, isLoading, error, deposit }) => {
  let canGoNext = !!node

  if (canGoNext) {
    if (node && node.type === NodeType.provider) {
      canGoNext = !!values[AddWorkerFields.depositData] && !!values[AddWorkerFields.delegateRules]
    } else {
      canGoNext =
        !!values[AddWorkerFields.mnemonicVerify] &&
        !!values[AddWorkerFields.amount] &&
        !!values[AddWorkerFields.withdrawalAddress]
    }

    if (canGoNext) {
      if (node && node.memoHash) {
        canGoNext = verifyMnemonic(
          Object.values(values[AddWorkerFields.mnemonicVerify]).join(' '),
          node.memoHash
        )
      } else if (mode === 'add') {
        canGoNext =
          values[AddWorkerFields.mnemonic].join('') ===
          Object.values(values[AddWorkerFields.mnemonicVerify]).join('')
      }
    }
  }

  return (
    <AddWorkerForm
      goNext={goNext}
      goPrev={goPrev}
      canGoNext={canGoNext}
      nextText={mode === 'import' ? 'Import' : 'Add'}
      isLoading={isLoading}
      error={error}
      showActionsDivider={false}
    >
      <AddWorkerPreview data={values} node={node} deposit={deposit} />
    </AddWorkerForm>
  )
}
