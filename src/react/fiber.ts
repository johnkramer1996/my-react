import {
  REACT_CONTEXT_TYPE,
  REACT_FORWARD_REF_TYPE,
  REACT_FRAGMENT_TYPE,
  REACT_MEMO_TYPE,
  REACT_PROVIDER_TYPE,
  ReactElement,
  ReactType,
} from './React'
import { initializeUpdateQueue } from './update'

export function createFiberRoot(containerInfo: Element) {
  const fiberRootNode = new FiberRootNode(containerInfo)
  const fiberNode = (fiberRootNode.current = createHostRootFiber())
  fiberNode.stateNode = fiberRootNode
  initializeUpdateQueue(fiberNode)
  return fiberRootNode
}

export function createHostRootFiber() {
  return createFiber(
    HostRoot,
    null,
    null,
    ConcurrentMode | BlockingMode | StrictMode,
  )
}

//! copy fiber or created new if current = null
export function createWorkInProgress(current: FiberNode, pendingProps: any) {
  var workInProgress = current.alternate
  if (workInProgress === null) {
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    )
    workInProgress.elementType = current.elementType
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    workInProgress.pendingProps = pendingProps
    workInProgress.effectTag = NoEffect
    workInProgress.nextEffect = null
    workInProgress.firstEffect = null
    workInProgress.lastEffect = null
  }

  workInProgress.childExpirationTime = current.childExpirationTime
  workInProgress.expirationTime = current.expirationTime
  workInProgress.child = current.child
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue

  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  workInProgress.ref = current.ref

  return workInProgress
}

export function createFiberFromText(
  content: string | number,
  mode: number,
  expirationTime: number,
) {
  var fiber = new FiberNode(HostText, content, null, mode)
  fiber.expirationTime = expirationTime
  return fiber
}

export function createFiberFromElement(
  element: ReactElement,
  mode: number,
  expirationTime: number,
) {
  var type = element.type
  var key = element.key
  var pendingProps = element.props

  return createFiberFromTypeAndProps(
    type,
    key,
    pendingProps,
    mode,
    expirationTime,
  )
}

export function createFiberFromFragment(elements, mode, expirationTime, key) {
  var fiber = createFiber(Fragment, elements, key, mode)
  fiber.expirationTime = expirationTime
  return fiber
}

export function createFiberFromTypeAndProps(
  type: ReactElement | ReactType,
  key: string | null,
  pendingProps: any,
  mode: number,
  expirationTime: number,
) {
  var fiberTag: number = IndeterminateComponent

  if (typeof type === 'function') {
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent
    } else;
  } else if (typeof type === 'string') {
    fiberTag = HostComponent
  } else {
    getTag: switch (type) {
      case REACT_FRAGMENT_TYPE:
        return createFiberFromFragment(
          pendingProps.children,
          mode,
          expirationTime,
          key,
        )
      default: {
        if (typeof type === 'object' && type !== null) {
          switch (type.$$typeof) {
            case REACT_PROVIDER_TYPE:
              fiberTag = ContextProvider
              break getTag

            case REACT_CONTEXT_TYPE:
              // This is a consumer
              fiberTag = ContextConsumer
              break getTag

            case REACT_FORWARD_REF_TYPE:
              fiberTag = ForwardRef
              break getTag

            case REACT_MEMO_TYPE:
              fiberTag = MemoComponent
              break getTag
          }
        }
      }
    }
  }

  var fiber = new FiberNode(fiberTag, pendingProps, key, mode)
  fiber.elementType = type
  fiber.type = type
  fiber.expirationTime = expirationTime
  return fiber
}

export function detachFiber(current: FiberNode) {
  var alternate = current.alternate
  current.return = null
  current.child = null
  current.memoizedState = null
  current.updateQueue = null
  current.alternate = null
  current.firstEffect = null
  current.lastEffect = null
  current.pendingProps = null
  current.memoizedProps = null
  current.stateNode = null
  if (alternate !== null) detachFiber(alternate)
}

function createFiber(
  tag: number,
  pendingProps: any,
  key: string | null,
  mode: number,
) {
  return new FiberNode(tag, pendingProps, key, mode)
}

export class FiberRootNode {
  current: FiberNode | null
  containerInfo: Element
  context: any
  pendingContext: any
  finishedExpirationTime: number
  finishedWork: FiberNode | null
  callbackNode: {} | null
  lastExpiredTime: number

  callbackExpirationTime: number = 0
  callbackPriority: number = 0

  constructor(containerInfo: Element) {
    this.current = null
    this.containerInfo = containerInfo
    this.context = null
    this.pendingContext = null
    this.finishedExpirationTime = NoWork
    this.finishedWork = null
    this.callbackNode = null
    this.lastExpiredTime = NoWork
  }
}

export class FiberNode {
  tag: number // ! FunctionComponent=0/ClassComponent=1/IndeterminateComponent=2/HostRoot=3/HostComponent=6/HostText=6/Fragment=7/ForwardRef=11
  key: string | null
  elementType: any
  type: any
  stateNode: FiberRootNode | Element | null
  return: FiberNode | null
  child: FiberNode | null // ! first child
  sibling: FiberNode | null
  index: number
  ref: any
  pendingProps: any
  memoizedProps: any
  updateQueue: any
  memoizedState: any
  mode: number
  flags: number = 0
  // Effects
  effectTag: number
  nextEffect: FiberNode | null
  firstEffect: FiberNode | null
  lastEffect: FiberNode | null

  expirationTime: number
  childExpirationTime: number
  alternate: FiberNode | null

  constructor(tag: number, pendingProps: any, key: string | null, mode: any) {
    this.tag = tag
    this.key = key // ! unique key
    this.elementType = null // ! for default props FuncC and ClasC
    this.type = null // ! div, button, func -> first arg createElement
    this.stateNode = null // ! node for HostComponent and HostText and HostRoot->Root(only one)

    this.return = null // ! parent
    this.child = null
    this.sibling = null // ! сосед
    this.index = 0 // ! для сравнения
    this.ref = null //  ! ссылка на дом
    this.pendingProps = pendingProps // ! пропсы
    this.memoizedProps = null // ! пропсы записываються после обновления в beginWork
    this.updateQueue = null // ! updateQueue - еффекты
    this.memoizedState = null // !memoizedState - ссылка на первый хук
    this.mode = mode // ! выставляется хостом mode = 7 = NoMode

    this.effectTag = NoEffect // ! биты еффектов
    this.nextEffect = null // ! след. файбер, начинается с конца
    this.firstEffect = null // ! ссылка на начало
    this.lastEffect = null // ! ссылка на конец
    this.expirationTime = NoWork //
    this.childExpirationTime = NoWork
    this.alternate = null
  }
}

function shouldConstruct(Component: any) {
  var prototype = Component.prototype
  return !!(prototype && prototype.isReactComponent)
}

export function isSimpleFunctionComponent(type: any) {
  return (
    typeof type === 'function' &&
    !shouldConstruct(type) &&
    type.defaultProps === undefined
  )
}
