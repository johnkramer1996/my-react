import { beginWork } from './beginWork'
import { commitRoot, flushPassiveEffects } from './commit'
import { completeUnitOfWork } from './completeWork'
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber'

export function scheduleWork(fiber: FiberNode, expirationTime: number) {
  const root = markUpdateTimeFromFiberToRoot(fiber, expirationTime)

  if (expirationTime === Sync) {
    if (
      (executionContext & LegacyUnbatchedContext) !== NoContext &&
      (executionContext & (RenderContext | CommitContext)) === NoContext
    ) {
      performSyncWorkOnRoot(root)
    } else {
      ensureRootIsScheduled(root)
      if (executionContext === NoContext) flushSyncCallbackQueue()
    }
  } else {
    ensureRootIsScheduled(root)
  }
}

export function ensureRootIsScheduled(root: FiberRootNode) {
  const lastExpiredTime = root.lastExpiredTime

  if (lastExpiredTime !== NoWork) {
    root.callbackExpirationTime = Sync
    root.callbackPriority = ImmediatePriority
    root.callbackNode = requestIdleCallback(
      performSyncWorkOnRoot.bind(null, root),
    )
    return
  }

  var expirationTime = Sync
  var existingCallbackNode = root.callbackNode
  if (expirationTime === NoWork) {
    if (existingCallbackNode !== null) {
      root.callbackNode = null
      root.callbackExpirationTime = NoWork
      root.callbackPriority = NoPriority
    }
    return
  }

  if (root.callbackNode !== null) return
  root.callbackExpirationTime = expirationTime
  root.callbackNode = scheduleSyncCallback(
    performSyncWorkOnRoot.bind(null, root),
  )
}

function performSyncWorkOnRoot(root: FiberRootNode) {
  const lastExpiredTime = root.lastExpiredTime
  let expirationTime = lastExpiredTime !== NoWork ? lastExpiredTime : Sync

  flushPassiveEffects()
  if (
    root !== workInProgressRoot ||
    expirationTime !== renderExpirationTime$1
  ) {
    prepareFreshStack(root, expirationTime)
  }

  if (workInProgress !== null) {
    const prevExecutionContext = executionContext
    executionContext |= RenderContext
    workLoopSync()
    executionContext = prevExecutionContext
    root.finishedWork = root.current!.alternate
    root.finishedExpirationTime = expirationTime
    finishSyncRender(root)
  }
  return null
}

function prepareFreshStack(root: FiberRootNode, expirationTime: number) {
  root.finishedWork = null
  workInProgressRoot = root
  workInProgress = createWorkInProgress(
    root.current!,
    root.current!.pendingProps,
  )
  renderExpirationTime$1 = expirationTime
}

function workLoopSync() {
  while (workInProgress !== null)
    workInProgress = performUnitOfWork(workInProgress)
}

function performUnitOfWork(workInProgress: FiberNode) {
  const current = workInProgress.alternate
  var next = beginWork(current!, workInProgress, renderExpirationTime$1)
  workInProgress.memoizedProps = workInProgress.pendingProps

  if (next === null) next = completeUnitOfWork(workInProgress)
  return next
}

function finishSyncRender(root: FiberRootNode) {
  workInProgressRoot = null
  commitRoot(root)
}

function markUpdateTimeFromFiberToRoot(
  fiber: FiberNode,
  expirationTime: number,
): FiberRootNode {
  if (fiber.expirationTime < expirationTime) {
    fiber.expirationTime = expirationTime
  }

  var alternate = fiber.alternate

  if (alternate !== null && alternate.expirationTime < expirationTime) {
    alternate.expirationTime = expirationTime
  }

  var node = fiber.return
  var root: FiberRootNode | null = null

  if (node === null && fiber.tag === HostRoot) {
    root = fiber.stateNode as FiberRootNode
  } else {
    while (node !== null) {
      alternate = node.alternate

      if (node.childExpirationTime < expirationTime) {
        node.childExpirationTime = expirationTime

        if (
          alternate !== null &&
          alternate.childExpirationTime < expirationTime
        ) {
          alternate.childExpirationTime = expirationTime
        }
      } else if (
        alternate !== null &&
        alternate.childExpirationTime < expirationTime
      ) {
        alternate.childExpirationTime = expirationTime
      }

      if (node.return === null && node.tag === HostRoot) {
        root = node.stateNode as FiberRootNode
        break
      }

      node = node.return
    }
  }

  return root as FiberRootNode
}

function scheduleSyncCallback(callback: Function) {
  ;(syncQueue ||= []).push(callback)
  return fakeCallbackNode
}

export function flushSyncCallbackQueue() {
  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true

    try {
      var _isSync = true
      var queue = syncQueue
      for (var i = 0; i < queue.length; i++) {
        var callback = queue[i]

        do {
          callback = callback(_isSync)
        } while (callback !== null)
      }
      syncQueue = null
    } finally {
      isFlushingSyncQueue = false
    }
  }
}
