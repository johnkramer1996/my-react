import { shallowEqual } from './React'
import { bailoutOnAlreadyFinishedWork } from './beginWork'
import { reconcileChildren } from './reconcileChildren'
import { scheduleWork } from './scheduleWork'
import { cloneUpdateQueue, createUpdate, enqueueUpdate, initializeUpdateQueue, processUpdateQueue } from './update'

var emptyContextObject = {}

function get(key) {
  return key._reactInternalFiber
}
function has(key) {
  return key._reactInternalFiber !== undefined
}
function set(key, value) {
  key._reactInternalFiber = value
}

export function constructClassInstance(workInProgress, ctor, props) {
  var context = emptyContextObject
  var instance = new ctor(props, context)
  workInProgress.memoizedState = instance.state !== null && instance.state !== undefined ? instance.state : null
  adoptClassInstance(workInProgress, instance)

  return instance
}

export function updateClassInstance(current, workInProgress, ctor, newProps, renderExpirationTime) {
  var instance = workInProgress.stateNode
  cloneUpdateQueue(current, workInProgress)
  var oldProps = workInProgress.memoizedProps
  instance.props = oldProps

  var oldContext = instance.context
  var nextContext = emptyContextObject

  if (
    typeof instance.UNSAFE_componentWillReceiveProps === 'function' ||
    typeof instance.componentWillReceiveProps === 'function'
  ) {
    if (oldProps !== newProps || oldContext !== nextContext) {
      callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext)
    }
  }

  var oldState = workInProgress.memoizedState
  var newState = (instance.state = oldState)
  processUpdateQueue(workInProgress, newProps, instance, renderExpirationTime)
  newState = workInProgress.memoizedState

  if (oldProps === newProps && oldState === newState) {
    if (typeof instance.componentDidUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= Update
      }
    }

    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= Snapshot
      }
    }

    return false
  }

  var shouldUpdate = checkShouldComponentUpdate(
    workInProgress,
    ctor,
    oldProps,
    newProps,
    oldState,
    newState,
    nextContext,
  )

  if (shouldUpdate) {
    if (
      typeof instance.UNSAFE_componentWillUpdate === 'function' ||
      typeof instance.componentWillUpdate === 'function'
    ) {
      if (typeof instance.componentWillUpdate === 'function')
        instance.componentWillUpdate(newProps, newState, nextContext)

      if (typeof instance.UNSAFE_componentWillUpdate === 'function')
        instance.UNSAFE_componentWillUpdate(newProps, newState, nextContext)
    }
  }

  if (typeof instance.componentDidUpdate === 'function') workInProgress.effectTag |= Update
  if (typeof instance.getSnapshotBeforeUpdate === 'function') workInProgress.effectTag |= Snapshot

  if (!shouldUpdate) {
    workInProgress.memoizedProps = newProps
    workInProgress.memoizedState = newState
  }

  instance.props = newProps
  instance.state = newState
  instance.context = nextContext
  return shouldUpdate
}

export function mountClassInstance(workInProgress, ctor, newProps, renderExpirationTime) {
  var instance = workInProgress.stateNode
  instance.props = newProps
  instance.state = workInProgress.memoizedState
  initializeUpdateQueue(workInProgress)

  processUpdateQueue(workInProgress, newProps, instance, renderExpirationTime)
  instance.state = workInProgress.memoizedState

  if (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function') {
    callComponentWillMount(workInProgress, instance)

    processUpdateQueue(workInProgress, newProps, instance, renderExpirationTime)
    instance.state = workInProgress.memoizedState
  }

  if (typeof instance.componentDidMount === 'function') {
    workInProgress.effectTag |= Update
  }
}

export function finishClassComponent(
  current,
  workInProgress,
  Component,
  shouldUpdate,
  hasContext,
  renderExpirationTime,
) {
  markRef(current, workInProgress)
  if (!shouldUpdate) return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)

  var instance = workInProgress.stateNode
  var nextChildren = instance.render()

  workInProgress.effectTag |= PerformedWork
  reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime)
  workInProgress.memoizedState = instance.state

  return workInProgress.child
}

function adoptClassInstance(workInProgress, instance) {
  instance.updater = classComponentUpdater
  workInProgress.stateNode = instance

  set(instance, workInProgress)
}

function checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext) {
  var instance = workInProgress.stateNode

  if (typeof instance.shouldComponentUpdate === 'function')
    return instance.shouldComponentUpdate(newProps, newState, nextContext)

  if (ctor.prototype && ctor.prototype.isPureReactComponent)
    return !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)

  return true
}

function markRef(current, workInProgress) {
  var ref = workInProgress.ref

  if ((current === null && ref !== null) || (current !== null && current.ref !== ref)) {
    // Schedule a Ref effect
    workInProgress.effectTag |= Ref
  }
}

function callComponentWillMount(workInProgress, instance) {
  if (typeof instance.componentWillMount === 'function') {
    instance.componentWillMount()
  }
  if (typeof instance.UNSAFE_componentWillMount === 'function') {
    instance.UNSAFE_componentWillMount()
  }
}

function callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext) {
  if (typeof instance.componentWillReceiveProps === 'function') {
    instance.componentWillReceiveProps(newProps, nextContext)
  }

  if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
    instance.UNSAFE_componentWillReceiveProps(newProps, nextContext)
  }
}

var classComponentUpdater = {
  isMounted: () => true,
  enqueueSetState: function (inst, payload, callback) {
    var fiber = get(inst)
    var expirationTime = Sync
    var update = createUpdate(expirationTime)
    update.payload = payload
    update.callback = callback !== undefined && callback !== null ? callback : null

    enqueueUpdate(fiber, update)
    scheduleWork(fiber, expirationTime)
  },
  enqueueReplaceState: function (inst, payload, callback) {
    var fiber = get(inst)
    var expirationTime = Sync
    var update = createUpdate(expirationTime)
    update.tag = ReplaceState
    update.payload = payload
    update.callback = callback !== undefined && callback !== null ? callback : null

    enqueueUpdate(fiber, update)
    scheduleWork(fiber, expirationTime)
  },
  enqueueForceUpdate: function (inst, callback) {
    var fiber = get(inst)
    var expirationTime = Sync
    var update = createUpdate(expirationTime)
    update.tag = ForceUpdate
    update.callback = callback !== undefined && callback !== null ? callback : null

    enqueueUpdate(fiber, update)
    scheduleWork(fiber, expirationTime)
  },
}
