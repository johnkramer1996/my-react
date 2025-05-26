import { FiberNode, FiberRootNode } from './fiber'

window.noTimeout = -1

window.NoMode = 0
window.StrictMode = 1 // TODO: Remove BlockingMode and ConcurrentMode by reading from the root
// tag instead

window.BlockingMode = 2
window.ConcurrentMode = 4
window.ProfileMode = 8

window.MAX_SIGNED_31_BIT_INT = 1073741823

window.Sync = MAX_SIGNED_31_BIT_INT
window.Batched = Sync - 1
window.UNIT_SIZE = 10
window.MAGIC_NUMBER_OFFSET = Batched - 1

window.fakeCallbackNode = {}

window.ImmediatePriority = 99
window.UserBlockingPriority$1 = 98
window.NormalPriority = 97
window.LowPriority = 96
window.IdlePriority = 95 // NoPriority is the absence of priority. Also React-only.

window.NoPriority = 90

window.syncQueue = null
window.immediateQueueCallbackNode = null
window.isFlushingSyncQueue = false

window.FunctionComponent = 0
window.ClassComponent = 1
window.IndeterminateComponent = 2 // Before we know whether it is function or class
window.HostRoot = 3 // Root of a host tree. Could be nested inside another node.
window.HostPortal = 4 // A subtree. Could be an entry point to a different renderer.
window.HostComponent = 5
window.HostText = 6
window.Fragment = 7
window.Mode = 8
window.ContextConsumer = 9
window.ContextProvider = 10
window.ForwardRef = 11
window.Profiler = 12
window.SuspenseComponent = 13
window.MemoComponent = 14
window.SimpleMemoComponent = 15
window.LazyComponent = 16
window.IncompleteClassComponent = 17
window.DehydratedFragment = 18
window.SuspenseListComponent = 19
window.FundamentalComponent = 20
window.ScopeComponent = 21
window.Block = 22

window.NoEffect = 0
window.PerformedWork = 1
window.Placement = 2
window.Update = 4
window.PlacementAndUpdate = 6
window.Deletion = 8
window.ContentReset = 16
window.Callback = 32
window.DidCapture = 64
window.Ref = 128
window.Snapshot = 256
window.Passive = 512
window.Hydrating = 1024
window.HydratingAndUpdate = 1028
window.LifecycleEffectMask = 932
window.HostEffectMask = 2047
window.Incomplete = 2048
window.ShouldCapture = 4096

window.NoWork = 0
window.Never = 1
window.Idle = 2
window.ContinuousHydration = 3

window.NoContext = 0
window.BatchedContext = 1
window.EventContext = 2
window.DiscreteEventContext = 4
window.LegacyUnbatchedContext = 8
window.RenderContext = 16
window.CommitContext = 32
window.RootIncomplete = 0
window.RootFatalErrored = 1
window.RootErrored = 2
window.RootSuspended = 3
window.RootSuspendedWithDelay = 4
window.RootCompleted = 5
window.executionContext = NoContext

window.workInProgressRoot = null
window.workInProgress = null
window.renderExpirationTime$1 = NoWork

window.globalMostRecentFallbackTime = 0
window.FALLBACK_THROTTLE_MS = 500
window.nextEffect = null
window.hasUncaughtError = false
window.firstUncaughtError = null
window.legacyErrorBoundariesThatAlreadyFailed = null
window.rootDoesHavePassiveEffects = false
window.rootWithPendingPassiveEffects = null
window.pendingPassiveEffectsRenderPriority = NoPriority
window.pendingPassiveEffectsExpirationTime = NoWork
window.rootsWithPendingDiscreteUpdates = null

window.spawnedWorkDuringRender = null

window.currentEventTime = NoWork

window.LegacyRoot = 0
window.BlockingRoot = 1
window.ConcurrentRoot = 2

window.DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML'
window.SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning'
window.SUPPRESS_HYDRATION_WARNING = 'suppressHydrationWarning'
window.AUTOFOCUS = 'autoFocus'
window.CHILDREN = 'children'
window.STYLE = 'style'
window.HTML$1 = '__html'

window.ELEMENT_NODE = 1
window.TEXT_NODE = 3
window.COMMENT_NODE = 8
window.DOCUMENT_NODE = 9
window.DOCUMENT_FRAGMENT_NODE = 11

window.UpdateState = 0
window.ReplaceState = 1
window.ForceUpdate = 2
window.CaptureUpdate = 3
window.hasForceUpdate = false
window.currentlyProcessingQueue = null // ??

window.HasEffect = 1
window.Layout = 2
window.Passive$1 = 4

window.renderExpirationTime = NoWork
window.currentlyRenderingFiber$1 = null
window.ReactCurrentDispatcher = { current: null }
window.currentHook = null
window.workInProgressHook = null

declare global {
  var noTimeout: any

  var NoMode: any
  var StrictMode: any

  var BlockingMode: any
  var ConcurrentMode: any
  var ProfileMode: any

  var MAX_SIGNED_31_BIT_INT: any

  var Sync: any
  var Batched: any
  var UNIT_SIZE: any
  var MAGIC_NUMBER_OFFSET: any

  var fakeCallbackNode: {}

  var ImmediatePriority: any
  var UserBlockingPriority$1: any
  var NormalPriority: any
  var LowPriority: any
  var IdlePriority: any // NoPriority is the absence of priority. Also React-on:yany

  var NoPriority: any

  var syncQueue: any
  var immediateQueueCallbackNode: any
  var isFlushingSyncQueue: any

  var FunctionComponent: any
  var ClassComponent: any
  var IndeterminateComponent: any // Before we know whether it is function o: any
  var HostRoot: any // Root of a host tree. Could be nested inside another no:eany
  var HostPortal: any // A subtree. Could be an entry point to a different render:rany
  var HostComponent: any
  var HostText: any
  var Fragment: any
  var Mode: any
  var ContextConsumer: any
  var ContextProvider: any
  var ForwardRef: any
  var Profiler: any
  var SuspenseComponent: any
  var MemoComponent: any
  var SimpleMemoComponent: any
  var LazyComponent: any
  var IncompleteClassComponent: any
  var DehydratedFragment: any
  var SuspenseListComponent: any
  var FundamentalComponent: any
  var ScopeComponent: any
  var Block: any

  var NoEffect: any
  var PerformedWork: any
  var Placement: any
  var Update: any
  var PlacementAndUpdate: any
  var Deletion: any
  var ContentReset: any
  var Callback: any
  var DidCapture: any
  var Ref: any
  var Snapshot: any
  var Passive: any
  var Hydrating: any
  var HydratingAndUpdate: any
  var LifecycleEffectMask: any
  var HostEffectMask: any
  var Incomplete: any
  var ShouldCapture: any

  var NoWork: any
  var Never: any
  var Idle: any
  var ContinuousHydration: any

  var NoContext: any
  var BatchedContext: any
  var EventContext: any
  var DiscreteEventContext: any
  var LegacyUnbatchedContext: any
  var RenderContext: any
  var CommitContext: any
  var RootIncomplete: any
  var RootFatalErrored: any
  var RootErrored: any
  var RootSuspended: any
  var RootSuspendedWithDelay: any
  var RootCompleted: any
  var executionContext: number

  var workInProgressRoot: FiberRootNode | null
  var workInProgress: FiberNode | null
  var renderExpirationTime$1: any

  var globalMostRecentFallbackTime: any
  var FALLBACK_THROTTLE_MS: any
  var nextEffect: FiberNode | null
  var hasUncaughtError: any
  var firstUncaughtError: any
  var legacyErrorBoundariesThatAlreadyFailed: any
  var rootDoesHavePassiveEffects: any
  var rootWithPendingPassiveEffects: FiberRootNode | null
  var pendingPassiveEffectsRenderPriority: any
  var pendingPassiveEffectsExpirationTime: any
  var rootsWithPendingDiscreteUpdates: any

  var spawnedWorkDuringRender: any

  var currentEventTime: any

  var LegacyRoot: any
  var BlockingRoot: any
  var ConcurrentRoot: any

  var DANGEROUSLY_SET_INNER_HTML: any
  var SUPPRESS_CONTENT_EDITABLE_WARNING: any
  var SUPPRESS_HYDRATION_WARNING: any
  var AUTOFOCUS: any
  var CHILDREN: any
  var STYLE: any
  var HTML$1: any

  var ELEMENT_NODE: any
  var TEXT_NODE: any
  var COMMENT_NODE: any
  var DOCUMENT_NODE: any
  var DOCUMENT_FRAGMENT_NODE: any

  var UpdateState: any
  var ReplaceState: any
  var ForceUpdate: any
  var CaptureUpdate: any
  var hasForceUpdate: any
  var currentlyProcessingQueue: any

  var HasEffect: any
  var Layout: any
  var Passive$1: any

  var renderExpirationTime: any
  var currentlyRenderingFiber$1: any
  var ReactCurrentDispatcher: any
  var currentHook: any
  var workInProgressHook: any
}

export {}
