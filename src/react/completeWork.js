import { getRootHostContainer } from './ReactDom'
import {
  appendAllChildren,
  createInstance,
  createTextInstance,
  finalizeInitialChildren,
  prepareUpdate,
} from './instance'

//!! completeUnitOfWork
//!! 1. completeWork - update host props and mark if props changes
//!! 2. added effect(fiber) children to returnFiber and wornInProgress(if has PerformedWork). first effect will be nested children first children
//!! 3. pass to subling if has or pass returnFiber(parent)

export function completeUnitOfWork(workInProgress) {
  do {
    var current = workInProgress.alternate
    var returnFiber = workInProgress.return

    var next = completeWork(current, workInProgress)
    if (next !== null) return next

    if (returnFiber !== null) {
      if (returnFiber.firstEffect === null) returnFiber.firstEffect = workInProgress.firstEffect
      if (workInProgress.lastEffect !== null) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = workInProgress.firstEffect
        }
        returnFiber.lastEffect = workInProgress.lastEffect
      }

      if (workInProgress.effectTag > PerformedWork) {
        if (returnFiber.lastEffect !== null) returnFiber.lastEffect.nextEffect = workInProgress
        else returnFiber.firstEffect = workInProgress
        returnFiber.lastEffect = workInProgress
      }
    }
    var siblingFiber = workInProgress.sibling
    if (siblingFiber !== null) return siblingFiber
    workInProgress = returnFiber
  } while (workInProgress !== null) // We've reached the root.

  return null
}

//!! 1. check if need update props hostComponent and markUpdate if props changes. updated in commitWork->commitUpdate->updateProperties
//!! 2. or create Node(document.createElement) and add all children
function completeWork(current, workInProgress) {
  var newProps = workInProgress.pendingProps
  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case ContextConsumer:
    case ClassComponent:
    case HostRoot:
    case MemoComponent:
    case ContextProvider:
      return null

    case HostComponent: {
      var rootContainerInstance = getRootHostContainer()
      var type = workInProgress.type

      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent$1(current, workInProgress, type, newProps, rootContainerInstance)
        if (current.ref !== workInProgress.ref) markRef$1(workInProgress)
      } else {
        if (!newProps) return null
        var instance = createInstance(type, newProps, rootContainerInstance, workInProgress)
        appendAllChildren(instance, workInProgress)
        workInProgress.stateNode = instance
        finalizeInitialChildren(instance, type, newProps, rootContainerInstance)
      }
      if (workInProgress.ref !== null) markRef$1(workInProgress)
      return null
    }

    case HostText: {
      var rootContainerInstance = getRootHostContainer()
      var newText = newProps

      if (current !== null && workInProgress.stateNode != null)
        updateHostText$1(current, workInProgress, current.memoizedProps, newText)
      else workInProgress.stateNode = createTextInstance(newText, rootContainerInstance, workInProgress)
      return null
    }
  }

  return null
}

//!! check if props changes
function updateHostComponent$1(current, workInProgress, type, newProps, rootContainerInstance) {
  var oldProps = current.memoizedProps
  if (oldProps === newProps) return

  var instance = workInProgress.stateNode
  var updatePayload = prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance)

  workInProgress.updateQueue = updatePayload

  if (updatePayload) {
    markUpdate(workInProgress)
  }
}

//!! mark update if text changes
function updateHostText$1(current, workInProgress, oldText, newText) {
  if (oldText !== newText) markUpdate(workInProgress)
}

function markUpdate(workInProgress) {
  workInProgress.effectTag |= Update
}

function markRef$1(workInProgress) {
  workInProgress.effectTag |= Ref
}
