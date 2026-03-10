/*
 * Copyright 2026   Blue Wave Inc.
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
import { NodeAddForm } from '@renderer/components/Node/AddNode/Form'
import { useAddNode } from '@renderer/hooks/node'
import {
  AddNodeFields,
  NewNode,
  CheckPorts,
  DownloadStatus,
  Type,
  PortsNodeFields
} from '@renderer/types/node'
import {
  NodeNetworkInput,
  NodeDataFolderInput,
  NodeSnapshotInput,
  NodeNameInput,
  NodeTypeInput,
  NodePortInput,
  NodePreview
} from '@renderer/components/Node/AddNode/Inputs'
import { StepsWithActiveContent } from '@renderer/ui-kit/Steps'
import { Snapshot } from '../../types/node'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchKeys } from '@renderer/constants/navigation'
import { routes } from '@renderer/constants/navigation'
import { addParams } from '@renderer/helpers/navigation'
import { AddNodeStepKeys, getAddNodeSteps } from '@renderer/helpers/node'
import { styled } from 'styled-components'
import { Alert } from '@renderer/ui-kit/Alert'

export const AddNode: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const step = searchParams.get(SearchKeys.step) ? Number(searchParams.get(SearchKeys.step)) : 0
  const type = (searchParams.get(SearchKeys.type) as Type.local | Type.provider) || Type.local
  const network = searchParams.get(SearchKeys.network)
  const {
    handleChange,
    values,
    onAdd,
    onSelectDirectory,
    checkPorts,
    onCheckPorts,
    isLoading,
    snapshot,
    onSelectSnapshot
  } = useAddNode(type, network)

  const { steps, stepsWithKeys } = getAddNodeSteps(type)

  const onChangeStep = (step: number) =>
    navigate(
      addParams(routes.nodes.create, {
        [SearchKeys.type]: type || values[AddNodeFields.type],
        [SearchKeys.network]: network || values[AddNodeFields.network],
        [SearchKeys.step]: step.toString()
      })
    )
  const goNextStep = () => onChangeStep(step + 1 <= steps.length ? step + 1 : step)
  const goPrevStep = () => onChangeStep(step - 1 >= 0 ? step - 1 : step)
  const StepComponent = {
    [AddNodeStepKeys.type]: (
      <NodeTypeSelection
        value={values[AddNodeFields.type]}
        values={values}
        handleChange={handleChange(AddNodeFields.type)}
        field={AddNodeFields.type}
        goNextStep={goNextStep}
        goPrevStep={goPrevStep}
      />
    ),
    [AddNodeStepKeys.network]: (
      <NetworkSelection
        value={values[AddNodeFields.network]}
        values={values}
        handleChange={handleChange(AddNodeFields.network)}
        field={AddNodeFields.network}
        goNextStep={goNextStep}
        goPrevStep={goPrevStep}
      />
    ),
    [AddNodeStepKeys.location]: (
      <FolderSelection
        value={values[AddNodeFields.locationDir]}
        values={values}
        handleChange={handleChange(AddNodeFields.locationDir)}
        field={AddNodeFields.locationDir}
        onSelectDirectory={onSelectDirectory}
        isSnapshot={values[AddNodeFields.downloadStatus] === DownloadStatus.downloading}
        snapshot={snapshot}
        onSelectSnapshot={onSelectSnapshot}
        goNextStep={goNextStep}
        goPrevStep={goPrevStep}
      />
    ),
    [AddNodeStepKeys.ports]: (
      <PortsSelection
        values={values}
        checkPorts={checkPorts}
        onCheckPorts={onCheckPorts}
        handleChange={handleChange}
        goNextStep={goNextStep}
        goPrevStep={goPrevStep}
      />
    ),
    [AddNodeStepKeys.providerName]: (
      <ProviderNameSelection
        value={values[AddNodeFields.locationDir]}
        values={values}
        handleChange={handleChange(AddNodeFields.locationDir)}
        field={AddNodeFields.locationDir}
        goNextStep={goNextStep}
        goPrevStep={goPrevStep}
      />
    ),
    [AddNodeStepKeys.name]: (
      <NameSelection
        value={values[AddNodeFields.name]}
        values={values}
        handleChange={handleChange(AddNodeFields.name)}
        field={AddNodeFields.name}
        goNextStep={goNextStep}
        goPrevStep={goPrevStep}
      />
    ),
    [AddNodeStepKeys.preview]: (
      <Preview values={values} goNextStep={onAdd} goPrevStep={goPrevStep} isLoading={isLoading} />
    )
  }
  const stepsWithComponents = steps.map((el, index) => {
    const currentKey = stepsWithKeys?.[index].key
    const activeStep = index === step
    return {
      title: el?.title,
      content: activeStep ? currentKey && StepComponent[currentKey] : null
    }
  })

  return (
    <StepsWithActiveContent
      orientation="vertical"
      current={step}
      onChange={onChangeStep}
      items={stepsWithComponents}
    />
  )
}

const NodeTypeSelection: React.FC<SelectionBasePropsT> = ({ value, handleChange, goNextStep }) => {
  return (
    <NodeAddForm title="Select a Node type" goNext={goNextStep} canGoNext={!!value}>
      <NodeTypeInput value={value} handleChange={handleChange} />
    </NodeAddForm>
  )
}

const NetworkSelection: React.FC<SelectionBasePropsT> = ({
  value,
  handleChange,
  goNextStep,
  goPrevStep
}) => {
  return (
    <NodeAddForm
      title="Select a network"
      goNext={goNextStep}
      goPrev={goPrevStep}
      canGoNext={!!value}
    >
      <NodeNetworkInput value={value} handleChange={handleChange} />
    </NodeAddForm>
  )
}

const FolderSelection: React.FC<
  SelectionBasePropsT & {
    onSelectDirectory: () => void
    snapshot?: Snapshot | null
    isSnapshot: boolean
    onSelectSnapshot: () => void
  }
> = ({
  value,
  handleChange,
  onSelectDirectory,
  goNextStep,
  goPrevStep,
  snapshot,
  isSnapshot,
  onSelectSnapshot
}) => {
  return (
    <NodeAddForm
      title="Select a data folder"
      goNext={goNextStep}
      goPrev={goPrevStep}
      canGoNext={!!value}
    >
      <NodeDataFolderInput
        value={value}
        handleChange={handleChange}
        onSelectDirectory={onSelectDirectory}
        // error={'The directory and network does not match'}
      />
      {snapshot && (
        <SnapshotBlock>
          <NodeSnapshotInput
            value={isSnapshot}
            handleChange={onSelectSnapshot}
            snapshot={snapshot}
          />
        </SnapshotBlock>
      )}
    </NodeAddForm>
  )
}

const PortsSelection: React.FC<PortsSelectionT> = ({
  values,
  checkPorts,
  onCheckPorts,
  handleChange,
  goNextStep,
  goPrevStep
}) => {
  const hasBusyPorts = Boolean(
    checkPorts &&
    Object.values(PortsNodeFields).some((field) => checkPorts[field as PortsNodeFields] === false)
  )

  return (
    <NodeAddForm
      title="Select ports"
      goNext={goNextStep}
      goPrev={goPrevStep}
      canGoNext={!hasBusyPorts}
    >
      <NodePortInput
        label="Coordinator P2P Tcp"
        handleChange={handleChange(AddNodeFields.coordinatorP2PTcpPort)}
        value={Number(values[AddNodeFields.coordinatorP2PTcpPort])}
        isCheck={checkPorts ? !!checkPorts[AddNodeFields.coordinatorP2PTcpPort] : true}
        onCheck={onCheckPorts}
      />
      <NodePortInput
        label="Coordinator P2P Udp"
        handleChange={handleChange(AddNodeFields.coordinatorP2PUdpPort)}
        value={Number(values[AddNodeFields.coordinatorP2PUdpPort])}
        isCheck={checkPorts ? !!checkPorts[AddNodeFields.coordinatorP2PUdpPort] : true}
        onCheck={onCheckPorts}
      />
      <NodePortInput
        label="Coordinator HTTP api"
        handleChange={handleChange(AddNodeFields.coordinatorHttpValidatorApiPort)}
        value={Number(values[AddNodeFields.coordinatorHttpValidatorApiPort])}
        isCheck={checkPorts ? !!checkPorts[AddNodeFields.coordinatorHttpValidatorApiPort] : true}
        onCheck={onCheckPorts}
      />
      <NodePortInput
        label="HTTP api"
        handleChange={handleChange(AddNodeFields.coordinatorHttpApiPort)}
        value={Number(values[AddNodeFields.coordinatorHttpApiPort])}
        isCheck={checkPorts ? !!checkPorts[AddNodeFields.coordinatorHttpApiPort] : true}
        onCheck={onCheckPorts}
      />
      <NodePortInput
        label="Verifier P2P"
        handleChange={handleChange(AddNodeFields.validatorP2PPort)}
        value={Number(values[AddNodeFields.validatorP2PPort])}
        isCheck={checkPorts ? !!checkPorts[AddNodeFields.validatorP2PPort] : true}
        onCheck={onCheckPorts}
      />
      <NodePortInput
        label="Verifier HTTP api"
        handleChange={handleChange(AddNodeFields.validatorHttpApiPort)}
        value={Number(values[AddNodeFields.validatorHttpApiPort])}
        isCheck={checkPorts ? !!checkPorts[AddNodeFields.validatorHttpApiPort] : true}
        onCheck={onCheckPorts}
      />
      <NodePortInput
        label="Verifier WS api"
        handleChange={handleChange(AddNodeFields.validatorWsApiPort)}
        value={Number(values[AddNodeFields.validatorWsApiPort])}
        isCheck={checkPorts ? !!checkPorts[AddNodeFields.validatorWsApiPort] : true}
        onCheck={onCheckPorts}
      />
      {hasBusyPorts && (
        <Alert
          type="warning"
          title="One or more selected ports are already in use. Update ports or stop conflicting services."
        />
      )}
    </NodeAddForm>
  )
}

const NameSelection: React.FC<SelectionBasePropsT> = ({
  value,
  handleChange,
  goNextStep,
  goPrevStep
}) => {
  return (
    <NodeAddForm title="Name your node" goNext={goNextStep} goPrev={goPrevStep} canGoNext={!!value}>
      <NodeNameInput handleChange={handleChange} value={value} />
    </NodeAddForm>
  )
}

const ProviderNameSelection: React.FC<SelectionBasePropsT> = ({
  value,
  handleChange,
  goNextStep,
  goPrevStep
}) => {
  return (
    <NodeAddForm
      title="Name your provider"
      goNext={goNextStep}
      goPrev={goPrevStep}
      canGoNext={!!value}
    >
      <NodeNameInput handleChange={handleChange} value={value} />
    </NodeAddForm>
  )
}

const Preview: React.FC<PreviewPropsT> = ({ values, goNextStep, goPrevStep, isLoading }) => {
  const canGoNext =
    !!values[AddNodeFields.type] &&
    !!values[AddNodeFields.network] &&
    !!values[AddNodeFields.name] &&
    !!values[AddNodeFields.locationDir]

  return (
    <NodeAddForm
      title="Preview"
      goNext={goNextStep}
      goNextTitle="Add"
      goPrev={goPrevStep}
      canGoNext={canGoNext}
      isLoading={isLoading}
      showActionsDivider={false}
    >
      <NodePreview values={values} />
    </NodeAddForm>
  )
}

type PreviewPropsT = {
  values: NewNode
  isLoading?: boolean
  //steps
  goNextStep: () => void | Promise<void>
  goPrevStep: () => void
}

type PortsSelectionT = {
  values: NewNode
  checkPorts?: CheckPorts
  onCheckPorts: () => void

  handleChange: (field: AddNodeFields) => (value: number | null) => void
  //steps
  goNextStep: () => void | Promise<void>
  goPrevStep: () => void
}

type SelectionBasePropsT = {
  value: string
  values: NewNode
  field: AddNodeFields
  handleChange: (value?: string | number) => void

  //steps
  goNextStep: () => void | Promise<void>
  goPrevStep: () => void
}

const SnapshotBlock = styled.div`
  margin-top: 14px;
`
