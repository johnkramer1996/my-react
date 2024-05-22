import { shallowEqual } from './React'
import { constructClassInstance, finishClassComponent, mountClassInstance, updateClassInstance } from './classComponent'
import { createFiberFromTypeAndProps, createWorkInProgress, isSimpleFunctionComponent } from './fiber'
import { reconcileChildren } from './reconcileChildren'
import { readContext, renderWithHooks } from './renderWithHooks'
import { cloneUpdateQueue, processUpdateQueue } from './update'

export function beginWork(current, workInProgress, renderExpirationTime) {
  var updateExpirationTime = workInProgress.expirationTime

  if (current !== null) {
    var oldProps = current.memoizedProps
    var newProps = workInProgress.pendingProps

    if (oldProps !== newProps || workInProgress.type !== current.type);
    else if (updateExpirationTime < renderExpirationTime) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)
    }
  }

  workInProgress.expirationTime = NoWork
  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      return mountIndeterminateComponent(current, workInProgress, workInProgress.type, renderExpirationTime)
    }
    case FunctionComponent: {
      return updateFunctionComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderExpirationTime,
      )
    }
    case ClassComponent: {
      return updateClassComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderExpirationTime,
      )
    }

    case ForwardRef: {
      return updateForwardRef(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderExpirationTime,
      )
    }
    case MemoComponent: {
      return updateMemoComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        updateExpirationTime,
        renderExpirationTime,
      )
    }
    case SimpleMemoComponent: {
      return updateSimpleMemoComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        updateExpirationTime,
        renderExpirationTime,
      )
    }

    case HostRoot:
      return updateHostRoot(current, workInProgress, renderExpirationTime)
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderExpirationTime)
    case HostText:
      return updateHostText(current, workInProgress, renderExpirationTime)
    case Fragment:
      return updateFragment(current, workInProgress, renderExpirationTime)
    case ContextProvider:
      return updateContextProvider(current, workInProgress, renderExpirationTime)
    case ContextConsumer:
      return updateContextConsumer(current, workInProgress, renderExpirationTime)
  }
  return null
}

function mountIndeterminateComponent(current, workInProgress, Component, renderExpirationTime) {
  var props = workInProgress.pendingProps
  const nextChildren = renderWithHooks(current, workInProgress, Component, props, null, renderExpirationTime)

  workInProgress.tag = FunctionComponent
  workInProgress.effectTag |= PerformedWork

  reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime)
  return workInProgress.child
}

function updateFunctionComponent(current, workInProgress, Component, nextProps, renderExpirationTime) {
  const nextChildren = renderWithHooks(current, workInProgress, Component, nextProps, null, renderExpirationTime)

  workInProgress.effectTag |= PerformedWork
  reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime)
  return workInProgress.child
}

function updateClassComponent(current, workInProgress, Component, nextProps, renderExpirationTime) {
  var instance = workInProgress.stateNode
  var shouldUpdate

  if (instance === null) {
    if (current !== null) {
      current.alternate = null
      workInProgress.alternate = null
      //TODO: CLASS ALWAYS PLACEMENT???
      workInProgress.effectTag |= Placement
    }
    constructClassInstance(workInProgress, Component, nextProps)
    mountClassInstance(workInProgress, Component, nextProps, renderExpirationTime)
    shouldUpdate = true
  } else {
    shouldUpdate = updateClassInstance(current, workInProgress, Component, nextProps, renderExpirationTime)
  }

  var nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
    false,
    renderExpirationTime,
  )

  return nextUnitOfWork
}

function updateForwardRef(current, workInProgress, Component, nextProps) {
  const nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component.render,
    nextProps,
    workInProgress.ref,
    renderExpirationTime,
  )

  workInProgress.effectTag |= PerformedWork
  return reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime)
}

//! can be class or func
function updateMemoComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  updateExpirationTime,
  renderExpirationTime,
) {
  if (current === null) {
    var type = Component.type

    if (isSimpleFunctionComponent(type) && Component.compare === null && Component.defaultProps === undefined) {
      workInProgress.tag = SimpleMemoComponent
      workInProgress.type = type

      return updateSimpleMemoComponent(
        current,
        workInProgress,
        type,
        nextProps,
        updateExpirationTime,
        renderExpirationTime,
      )
    }
    var child = createFiberFromTypeAndProps(Component.type, null, nextProps, workInProgress, workInProgress.mode)
    child.ref = workInProgress.ref
    child.return = workInProgress
    workInProgress.child = child
    return child
  }

  var currentChild = current.child
  var prevProps = currentChild.memoizedProps
  var compare = Component.compare
  compare = compare !== null ? compare : shallowEqual

  if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
    return bailoutOnAlreadyFinishedWork(current, workInProgress)
  }

  workInProgress.flags |= PerformedWork
  var newChild = createWorkInProgress(currentChild, nextProps)
  newChild.ref = workInProgress.ref
  newChild.return = workInProgress
  workInProgress.child = newChild
  return newChild
}

//! if simple = Component = function
function updateSimpleMemoComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  updateExpirationTime,
  renderExpirationTime,
) {
  if (current !== null) {
    var prevProps = current.memoizedProps

    if (
      shallowEqual(prevProps, nextProps) &&
      current.ref === workInProgress.ref &&
      workInProgress.type === current.type
    ) {
      if (updateExpirationTime < renderExpirationTime) {
        workInProgress.expirationTime = current.expirationTime
        return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)
      }
    }
  }

  return updateFunctionComponent(current, workInProgress, Component, nextProps)
}

function updateFragment(current, workInProgress, renderExpirationTime) {
  return reconcileChildren(current, workInProgress, workInProgress.pendingProps, renderExpirationTime)
}

function updateContextProvider(current, workInProgress, renderExpirationTime) {
  var providerType = workInProgress.type
  var context = providerType._context
  var newProps = workInProgress.pendingProps
  var oldProps = workInProgress.memoizedProps
  var newValue = newProps.value

  context._currentValue = newValue

  var newChildren = newProps.children
  reconcileChildren(current, workInProgress, newChildren, renderExpirationTime)
  return workInProgress.child
}

function updateContextConsumer(current, workInProgress, renderExpirationTime) {
  var context = workInProgress.type
  var newProps = workInProgress.pendingProps
  var render = newProps.children

  var newValue = readContext(context)
  var newChildren = render(newValue)

  workInProgress.flags |= PerformedWork
  reconcileChildren(current, workInProgress, newChildren, renderExpirationTime)
  return workInProgress.child
}

function updateHostComponent(current, workInProgress, renderExpirationTime) {
  return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderExpirationTime)
}

function updateHostText(current, workInProgress, renderExpirationTime) {
  return null
}

function updateHostRoot(current, workInProgress, renderExpirationTime) {
  var nextProps = workInProgress.pendingProps
  var prevState = workInProgress.memoizedState
  var prevChildren = prevState !== null ? prevState.element : null
  cloneUpdateQueue(current, workInProgress)
  processUpdateQueue(workInProgress, nextProps, null, renderExpirationTime)

  var nextState = workInProgress.memoizedState
  var nextChildren = nextState.element
  // TODO:
  if (nextChildren === prevChildren) return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)

  reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime)
  return workInProgress.child
}

export function bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime) {
  if (workInProgress.childExpirationTime < renderExpirationTime) return null
  return cloneChildFibers(current, workInProgress)
}

function cloneChildFibers(current, workInProgress) {
  if (workInProgress.child === null) return

  var currentChild = workInProgress.child
  var newChild = createWorkInProgress(currentChild, currentChild.pendingProps)
  workInProgress.child = newChild
  newChild.return = workInProgress

  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling
    newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps)
    newChild.return = workInProgress
  }

  newChild.sibling = null

  return workInProgress.child
}
