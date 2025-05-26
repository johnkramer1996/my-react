import { internalEventHandlersKey, internalInstanceKey } from './instance'
import {
  registrationNameDependencies,
  simpleEventPluginEventTypes,
} from './registrationName'
import { flushSyncCallbackQueue } from './scheduleWork'

export function ensureListeningTo(rootContainerElement, registrationName) {
  legacyListenToEvent(registrationName, rootContainerElement)
}

function legacyListenToEvent(registrationName, mountAt) {
  var listenerMap = getListenerMapForElement(mountAt)
  var dependencies = registrationNameDependencies[registrationName] || []

  for (var i = 0; i < dependencies.length; i++) {
    var dependency = dependencies[i]
    legacyListenToTopLevelEvent(dependency, mountAt, listenerMap)
  }
}

var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map; // prettier-ignore
var elementListenerMap = new PossiblyWeakMap()
function getListenerMapForElement(element) {
  var listenerMap = elementListenerMap.get(element)

  if (listenerMap === undefined) {
    listenerMap = new Map()
    elementListenerMap.set(element, listenerMap)
  }

  return listenerMap
}

function legacyListenToTopLevelEvent(topLevelType, mountAt, listenerMap) {
  if (!listenerMap.has(topLevelType)) {
    trapBubbledEvent(topLevelType, mountAt)

    listenerMap.set(topLevelType, null)
  }
}

function trapBubbledEvent(topLevelType, element) {
  trapEventForPluginEventSystem(element, topLevelType, false)
}

function trapEventForPluginEventSystem(container, topLevelType, capture) {
  var listener = dispatchDiscreteEvent.bind(null, topLevelType, 1, container)
  var rawEventName = topLevelType

  if (capture) addEventCaptureListener(container, rawEventName, listener)
  else addEventBubbleListener(container, rawEventName, listener)
}

function addEventBubbleListener(element, eventType, listener) {
  element.addEventListener(eventType, listener, false)
}
function addEventCaptureListener(element, eventType, listener) {
  element.addEventListener(eventType, listener, true)
}

function getEventTarget(nativeEvent) {
  var target = nativeEvent.target || nativeEvent.srcElement || window // Normalize SVG <use> element events #4963

  return target.nodeType === TEXT_NODE ? target.parentNode : target
}

function getClosestInstanceFromNode(targetNode) {
  var targetInst = targetNode[internalInstanceKey]
  if (targetInst) return targetInst

  var parentNode = targetNode.parentNode
  while (parentNode) {
    targetInst =
      parentNode[internalContainerInstanceKey] ||
      parentNode[internalInstanceKey]

    if (targetInst) return targetInst

    targetNode = parentNode
    parentNode = targetNode.parentNode
  }

  return null
}

function dispatchDiscreteEvent(
  topLevelType,
  eventSystemFlags,
  container,
  nativeEvent,
) {
  var nativeEventTarget = getEventTarget(nativeEvent)
  var targetInst = getClosestInstanceFromNode(nativeEventTarget)

  if (!targetInst) {
    return
  }

  var registrationName =
    simpleEventPluginEventTypes[nativeEvent.type].phasedRegistrationNames[
      'bubbled'
    ]

  var listener = getListener(targetInst, registrationName)
  if (!listener) return

  var prevExecutionContext = executionContext
  executionContext |= DiscreteEventContext

  try {
    listener(nativeEvent)
  } finally {
    executionContext = prevExecutionContext

    if (executionContext === NoContext) flushSyncCallbackQueue()
  }
}

function getListener(inst, registrationName) {
  var listener
  var stateNode = inst.stateNode
  if (!stateNode) return null
  var props = getFiberCurrentPropsFromNode(stateNode)
  if (!props) return null

  listener = props[registrationName]

  return listener
}

function getFiberCurrentPropsFromNode(node) {
  return node[internalEventHandlersKey] || null
}
