import { FiberNode } from './fiber'
import { ensureListeningTo } from './listener'
import { registrationNameModules } from './registrationName'

export function createTextInstance(
  text,
  rootContainerInstance,
  internalInstanceHandle,
) {
  var textNode = document.createTextNode(text)
  precacheFiberNode(internalInstanceHandle, textNode)
  return textNode
}

//!! completeWork->created node 1
export function createInstance(
  type,
  props,
  rootContainerInstance,
  internalInstanceHandle,
) {
  const domElement = document.createElement(type)
  precacheFiberNode(internalInstanceHandle, domElement)
  updateFiberProps(domElement, props)
  return domElement
}

//!! completeWork->created node 3
export function finalizeInitialChildren(
  domElement: Element,
  type: string,
  props: Record<string, any>,
  rootContainerInstance: Element,
) {
  setInitialProperties(domElement, type, props, rootContainerInstance)
}

export function removeChild(parentInstance: Element, child: Element) {
  parentInstance.removeChild(child)
}

export function appendChild(parentInstance: Element, child: Element) {
  parentInstance.appendChild(child)
}

//!! completeWork->created node 2
export function appendAllChildren(parent: Element, workInProgress: FiberNode) {
  var node = workInProgress.child
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendChild(parent, node.stateNode as Element)
    } else if (node.child !== null) {
      node = node.child
      continue
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) return
      node = node.return
    }
    node = node.sibling
  }
}

//!! completeWork->created node 3
function setInitialProperties(domElement, tag, props, rootContainerElement) {
  setInitialDOMProperties(tag, domElement, rootContainerElement, props)
}

//!! completeWork->created node 3. if created can setTextContent
function setInitialDOMProperties(
  tag,
  domElement,
  rootContainerElement,
  nextProps,
) {
  for (var propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) continue

    var nextProp = nextProps[propKey]

    if (propKey === STYLE) {
      if (nextProp) Object.freeze(nextProp)
      setValueForStyles(domElement, nextProp)
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        var canSetTextContent = tag !== 'textarea' || nextProp !== ''
        if (canSetTextContent) setTextContent(domElement, nextProp)
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp)
      }
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        ensureListeningTo(rootContainerElement, propKey)
      }
    }
  }
}

//!! completeWork->update(updateHostComponent$1)
export function prepareUpdate(
  domElement,
  type,
  oldProps,
  newProps,
  rootContainerInstance,
) {
  return diffProperties(
    domElement,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
  )
}

//!! completeWork->update(updateHostComponent$1)->prepareUpdate
function diffProperties(
  domElement: Element,
  tag: number,
  lastRawProps: Record<string, any>,
  nextRawProps: Record<string, any>,
  rootContainerElement: Element,
) {
  var updatePayload: any[] | null = null
  var lastProps
  var nextProps
  lastProps = lastRawProps
  nextProps = nextRawProps

  var propKey
  var styleName
  var styleUpdates: Record<string, any> | null = null

  for (propKey in lastProps) {
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] == null
    ) {
      continue
    }

    if (propKey === STYLE) {
      var lastStyle = lastProps[propKey]

      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) styleUpdates = {}

          styleUpdates[styleName] = ''
        }
      }
    }
  }
  for (propKey in nextProps) {
    var nextProp = nextProps[propKey]
    var lastProp = lastProps != null ? lastProps[propKey] : undefined

    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp == null && lastProp == null)
    )
      continue

    if (propKey === STYLE) {
      if (nextProp) Object.freeze(nextProp)

      if (lastProp) {
        for (styleName in lastProp) {
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) styleUpdates = {}

            styleUpdates[styleName] = ''
          }
        }

        for (styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) styleUpdates = {}

            styleUpdates[styleName] = nextProp[styleName]
          }
        }
      } else {
        if (!styleUpdates) {
          if (!updatePayload) updatePayload = []

          updatePayload.push(propKey, styleUpdates)
        }

        styleUpdates = nextProp
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string' || typeof nextProp === 'number') {
        ;(updatePayload = updatePayload || []).push(propKey, '' + nextProp)
      }
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        ensureListeningTo(rootContainerElement, propKey)
      }

      if (!updatePayload && lastProp !== nextProp) {
        updatePayload = []
      }
    }
  }
  if (styleUpdates) {
    ;(updatePayload = updatePayload || []).push(STYLE, styleUpdates)
  }
  return updatePayload
}

//!! commit->commitMutationEffects->commitWort(only HostComponent)
export function updateProperties(
  domElement,
  updatePayload,
  type,
  oldProps,
  newProps,
) {
  updateDOMProperties(domElement, updatePayload)
}

//!! commit->commitMutationEffects->commitWort(only HostComponent)->commitMutationEffects
function updateDOMProperties(domElement, updatePayload) {
  for (var i = 0; i < updatePayload.length; i += 2) {
    var propKey = updatePayload[i]
    var propValue = updatePayload[i + 1]

    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue)
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue)
    } else {
      debugger
      // setValueForProperty(domElement, propKey, propValue)
    }
  }
}

//!! commit if updated or complete if created
export function setValueForStyles(node, styles) {
  var style = node.style

  for (var styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) continue

    style[styleName] = styles[styleName]
  }
}

//!! commit if updated or complete if created
export function setTextContent(node, text) {
  if (text) {
    var firstChild = node.firstChild

    if (
      firstChild &&
      firstChild === node.lastChild &&
      firstChild.nodeType === TEXT_NODE
    ) {
      firstChild.nodeValue = text
      return
    }
  }

  node.textContent = text
}

//!! commit if updated or complete if created
export function resetTextContent(domElement) {
  setTextContent(domElement, '')
}

export function appendPlacementNode(fiberNode, parent, append) {
  var tag = fiberNode.tag
  var isHost = tag === HostComponent || tag === HostText

  if (isHost) {
    append(parent, fiberNode.stateNode)
    return
  }

  const child = fiberNode.child
  if (child !== null) {
    appendPlacementNode(child, parent, append)

    let sibling = child.sibling
    while (sibling !== null) {
      appendPlacementNode(sibling, parent, append)
      sibling = sibling.sibling
    }
  }
}

export function getHostParentFiber(fiber: FiberNode) {
  let parent = fiber.return

  while (parent !== null) {
    if (isHostParent(parent)) return parent
    parent = parent.return
  }

  throw new Error('host parent not found for fiber' + fiber)
}

export function getPublicInstance(instance) {
  return instance
}

function isHostParent(fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot
}

var randomKey = Math.random().toString(36).slice(2)
export var internalInstanceKey = '__reactInternalInstance$' + randomKey
export var internalEventHandlersKey = '__reactEventHandlers$' + randomKey
var internalContainerInstanceKey = '__reactContainere$' + randomKey
export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst
}
export function updateFiberProps(node, props) {
  node[internalEventHandlersKey] = props
}
