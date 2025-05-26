import { createFiberRoot, FiberNode, FiberRootNode } from './fiber'
import { ReactElement } from './React'
import { flushSyncCallbackQueue, scheduleWork } from './scheduleWork'
import { createUpdate, enqueueUpdate } from './update'

const rootContainerInstance: { current: Element | null } = { current: null }

export function render(children: ReactElement, container: Element) {
  var root = createFiberRoot(container)
  rootContainerInstance.current = container
  unbatchedUpdates(() => updateContainer(children, root))
}

export function getRootHostContainer() {
  return rootContainerInstance.current
}

function unbatchedUpdates(fn: Function) {
  var prevExecutionContext = executionContext

  executionContext &= ~BatchedContext
  executionContext |= LegacyUnbatchedContext

  try {
    return fn()
  } finally {
    executionContext = prevExecutionContext

    if (executionContext === NoContext) flushSyncCallbackQueue()
  }
}

function updateContainer(children: ReactElement, fiberRootNode: FiberRootNode) {
  const fiberNode = fiberRootNode.current as FiberNode
  const expirationTime = Sync
  fiberRootNode.context = null

  const update = createUpdate(expirationTime)
  // @ts-ignore
  update.payload = {
    element: children,
  }

  enqueueUpdate(fiberNode, update)
  scheduleWork(fiberNode, expirationTime)
}
