import { detachFiber, FiberNode, FiberRootNode } from './fiber'
import {
  appendChild,
  appendPlacementNode,
  getHostParentFiber,
  getPublicInstance,
  removeChild,
  resetTextContent,
  updateFiberProps,
  updateProperties,
} from './instance'
import { ReactType } from './React'
import { ensureRootIsScheduled, flushSyncCallbackQueue } from './scheduleWork'

export function commitRoot(root: FiberRootNode) {
  var finishedWork = root.finishedWork
  var expirationTime = root.finishedExpirationTime
  if (finishedWork === null) return null

  root.finishedWork = null
  root.finishedExpirationTime = NoWork
  root.callbackNode = null

  if (root === workInProgressRoot) {
    workInProgressRoot = null
    workInProgress = null
    renderExpirationTime$1 = NoWork
  }

  let firstEffect: FiberNode | null = null
  // ! если в рута есть еффекты то добавить
  if (finishedWork.effectTag > PerformedWork) {
    // ! если есль другие еффекты добавить в конец
    if (finishedWork.lastEffect !== null) {
      finishedWork.lastEffect.nextEffect = finishedWork
      firstEffect = finishedWork.firstEffect
    } else {
      // ! если других нет то рут - эдинственный эффект
      firstEffect = finishedWork
    }
  } else {
    // ! если в рута нет эффектов то пропускаем рут
    firstEffect = finishedWork.firstEffect
  }

  if (firstEffect !== null) {
    var prevExecutionContext = executionContext
    executionContext |= CommitContext

    nextEffect = firstEffect
    commitBeforeMutationEffects()
    nextEffect = firstEffect
    commitMutationEffects()
    nextEffect = firstEffect
    commitLayoutEffects()

    root.current = finishedWork
    nextEffect = null
    executionContext = prevExecutionContext
  } else {
    root.current = finishedWork
  }

  if (rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = false
    rootWithPendingPassiveEffects = root
  } else {
    nextEffect = firstEffect

    while (nextEffect !== null) {
      var nextNextEffect = nextEffect.nextEffect
      nextEffect.nextEffect = null
      nextEffect = nextNextEffect
    }
  }

  //ensureRootIsScheduled(root)
  flushSyncCallbackQueue()
  return null
}

function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    var effectTag = nextEffect.effectTag

    if ((effectTag & Passive) !== NoEffect) {
      if (!rootDoesHavePassiveEffects) {
        rootDoesHavePassiveEffects = true
        requestIdleCallback(flushPassiveEffects)
      }
    }

    nextEffect = nextEffect.nextEffect
  }
}

function commitMutationEffects() {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag

    if (effectTag & ContentReset) commitResetTextContent(nextEffect)
    if (effectTag & Ref) {
      const current = nextEffect.alternate

      if (current !== null) commitDetachRef(current)
    }

    var primaryEffectTag = effectTag & (Placement | Update | Deletion)
    switch (primaryEffectTag) {
      case Placement: {
        commitPlacement(nextEffect)
        nextEffect.effectTag &= ~Placement
        break
      }

      case PlacementAndUpdate: {
        commitPlacement(nextEffect)
        nextEffect.effectTag &= ~Placement

        const current = nextEffect.alternate
        commitWork(current, nextEffect)
        break
      }

      case Update: {
        var current = nextEffect.alternate
        commitWork(current, nextEffect)
        break
      }

      case Deletion: {
        commitDeletion(nextEffect)
        break
      }
    }

    nextEffect = nextEffect.nextEffect
  }
}

function commitPlacement(finishedWork: FiberNode) {
  var parentFiber = getHostParentFiber(finishedWork)

  var parentStateNode = parentFiber.stateNode
  var parent =
    parentFiber.tag === HostRoot
      ? // @ts-ignore
        parentStateNode.containerInfo
      : parentStateNode

  appendPlacementNode(finishedWork, parent, appendChild)
}

function commitWork(current: FiberNode | null, workInProgress: FiberNode) {
  switch (workInProgress.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent: {
      commitHookEffectListUnmount(Layout | HasEffect, workInProgress)
      return
    }

    case ClassComponent: {
      return
    }

    case HostComponent: {
      var instance = workInProgress.stateNode

      if (instance != null) {
        var newProps = workInProgress.memoizedProps
        var oldProps = current !== null ? current.memoizedProps : newProps
        var type = workInProgress.type
        var updatePayload = workInProgress.updateQueue
        workInProgress.updateQueue = null

        if (updatePayload !== null) {
          commitUpdate(instance, updatePayload, type, oldProps, newProps)
        }
      }

      return
    }

    case HostText: {
      const textInstance = workInProgress.stateNode as Element
      var newText = workInProgress.memoizedProps
      commitTextUpdate(textInstance, newText)
      return
    }

    case HostRoot:
      return
  }
}

function commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
  updateFiberProps(domElement, newProps)
  updateProperties(domElement, updatePayload, type, oldProps, newProps)
}

function commitDeletion(current) {
  unmountHostComponents(current)
  detachFiber(current)
}

function unmountHostComponents(current) {
  var node = current
  var currentParentIsValid = false
  var currentParent
  var currentParentIsContainer
  while (true) {
    if (!currentParentIsValid) {
      var parent = node.return
      findParent: while (true) {
        var parentStateNode = parent.stateNode

        switch (parent.tag) {
          case HostComponent:
            currentParent = parentStateNode
            currentParentIsContainer = false
            break findParent

          case HostRoot:
            currentParent = parentStateNode.containerInfo
            currentParentIsContainer = true
            break findParent
        }

        parent = parent.return
      }

      currentParentIsValid = true
    }

    if (node.tag === HostComponent || node.tag === HostText) {
      removeChild(currentParent, node.stateNode)
    } else {
      commitUnmount(node)
      if (node.child !== null) {
        node.child.return = node
        node = node.child
        continue
      }
    }
    if (node === current) return

    while (node.sibling === null) {
      if (node.return === null || node.return === current) return
      node = node.return
    }

    node = node.sibling
  }
}

function commitLayoutEffects() {
  while (nextEffect !== null) {
    var effectTag = nextEffect.effectTag
    if (effectTag & (Update | Callback)) {
      var current = nextEffect.alternate
      commitLifeCycles(current, nextEffect)
    }

    if (effectTag & Ref) {
      commitAttachRef(nextEffect)
    }

    nextEffect = nextEffect.nextEffect
  }
}

function commitLifeCycles(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      commitHookEffectListMount(Layout | HasEffect, finishedWork)
      return
    }

    case ClassComponent: {
      var instance = finishedWork.stateNode

      if (finishedWork.effectTag & Update) {
        if (current === null) {
          //!!first render
          instance.componentDidMount()
        } else {
          var prevProps = current.memoizedProps
          var prevState = current.memoizedState

          instance.componentDidUpdate(prevProps, prevState)
        }
      }

      var updateQueue = finishedWork.updateQueue

      if (updateQueue !== null) {
        //!! TODO: ??
        commitUpdateQueue(finishedWork, updateQueue, instance)
      }

      return
    }

    case HostRoot: {
      var _updateQueue = finishedWork.updateQueue

      if (_updateQueue !== null) {
        var _instance = null

        if (finishedWork.child !== null) {
          switch (finishedWork.child.tag) {
            case HostComponent:
              _instance = getPublicInstance(finishedWork.child.stateNode)
              break

            case ClassComponent:
              _instance = finishedWork.child.stateNode
              break
          }
        }

        commitUpdateQueue(finishedWork, _updateQueue, _instance)
      }

      return
    }

    case HostComponent: {
      var _instance2 = finishedWork.stateNode

      if (current === null && finishedWork.effectTag & Update) {
        var type = finishedWork.type
        var props = finishedWork.memoizedProps
        commitMount(_instance2, type, props)
      }
      return
    }
  }
}

function commitPassiveHookEffects(finishedWork: FiberNode) {
  if ((finishedWork.effectTag & Passive) !== NoEffect) {
    switch (finishedWork.tag) {
      case FunctionComponent:
      case ForwardRef:
      case SimpleMemoComponent: {
        commitHookEffectListUnmount(Passive$1 | HasEffect, finishedWork)
        commitHookEffectListMount(Passive$1 | HasEffect, finishedWork)
        break
      }
    }
  }
}

function commitHookEffectListUnmount(tag: number, finishedWork: FiberNode) {
  var updateQueue = finishedWork.updateQueue
  var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null

  if (lastEffect !== null) {
    var firstEffect = lastEffect.next
    var effect = firstEffect

    do {
      if ((effect.tag & tag) === tag) {
        var destroy = effect.destroy
        effect.destroy = undefined
        if (destroy !== undefined) destroy()
      }

      effect = effect.next
    } while (effect !== firstEffect)
  }
}

function commitHookEffectListMount(tag: number, finishedWork: FiberNode) {
  var updateQueue = finishedWork.updateQueue
  var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null

  if (lastEffect !== null) {
    var firstEffect = lastEffect.next
    var effect = firstEffect

    do {
      if ((effect.tag & tag) === tag) {
        var create = effect.create
        effect.destroy = create()
      }

      effect = effect.next
    } while (effect !== firstEffect)
  }
}

function commitUpdateQueue(finishedWork, finishedQueue, instance) {
  var effects = finishedQueue.effects
  finishedQueue.effects = null

  if (effects !== null) {
    for (var i = 0; i < effects.length; i++) {
      var effect = effects[i]
      var callback = effect.callback

      if (callback !== null) {
        effect.callback = null
        //!! TODO callback???
        debugger
        // callCallback(callback, instance)
      }
    }
  }
}

function commitMount(
  domElement: Element,
  type: ReactType,
  newProps: Record<string, any>,
) {}

function commitAttachRef(finishedWork: FiberNode) {
  var ref = finishedWork.ref
  if (ref == null) return
  let instance = finishedWork.stateNode
  let instanceToUse: FiberRootNode | Element | null = null
  switch (finishedWork.tag) {
    case HostComponent:
      instanceToUse = getPublicInstance(instance)
      break
    default:
      instanceToUse = instance
  }
  if (typeof ref === 'function') ref(instanceToUse)
  else ref.current = instanceToUse
}

function commitDetachRef(current: FiberNode) {
  var currentRef = current.ref
  if (currentRef === null) return
  if (typeof currentRef === 'function') currentRef(null)
  else currentRef.current = null
}

function commitTextUpdate(textInstance: Element, newText: string) {
  textInstance.nodeValue = newText
}

function commitResetTextContent(current: FiberNode) {
  resetTextContent(current.stateNode)
}

export function flushPassiveEffects() {
  if (rootWithPendingPassiveEffects === null) {
    return false
  }

  const root = rootWithPendingPassiveEffects
  rootWithPendingPassiveEffects = null

  const prevExecutionContext = executionContext
  executionContext |= CommitContext

  let effect = root.current!.firstEffect

  while (effect !== null) {
    commitPassiveHookEffects(effect)

    const nextNextEffect = effect.nextEffect

    effect.nextEffect = null
    effect = nextNextEffect
  }

  executionContext = prevExecutionContext
  flushSyncCallbackQueue()
  return true
}

function commitUnmount(currentFiber: FiberNode) {
  switch (currentFiber.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent: {
      var updateQueue = currentFiber.updateQueue
      if (updateQueue !== null) {
        var lastEffect = updateQueue.lastEffect
        if (lastEffect !== null) {
          var firstEffect = lastEffect.next
          var effect = firstEffect
          do {
            var destroy = effect.destroy
            if (destroy !== undefined) {
              destroy()
            }
            effect = effect.next
          } while (effect !== firstEffect)
        }
      }
      break
    }
    case ClassComponent: {
      // safelyDetachRef(current$$1)
      return
    }
    case HostComponent: {
      // safelyDetachRef(current$$1)
      return
    }
  }
}
