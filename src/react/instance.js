import { ensureListeningTo } from './listener'
import { registrationNameModules } from './registrationName'

export function createTextInstance(text, rootContainerInstance, internalInstanceHandle) {
  var textNode = document.createTextNode(text)
  precacheFiberNode(internalInstanceHandle, textNode)
  return textNode
}

export function createInstance(type, props, rootContainerInstance, internalInstanceHandle) {
  const domElement = document.createElement(type)
  precacheFiberNode(internalInstanceHandle, domElement)
  updateFiberProps(domElement, props)
  return domElement
}

export function finalizeInitialChildren(domElement, type, props, rootContainerInstance) {
  setInitialProperties(domElement, type, props, rootContainerInstance)
}

export function removeChild(parentInstance, child) {
  parentInstance.removeChild(child)
}

export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child)
}

export function appendAllChildren(parent, workInProgress) {
  var node = workInProgress.child
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendChild(parent, node.stateNode)
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

function setInitialProperties(domElement, tag, props, rootContainerElement) {
  setInitialDOMProperties(tag, domElement, rootContainerElement, props)
}

function setInitialDOMProperties(tag, domElement, rootContainerElement, nextProps) {
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

export function prepareUpdate(domElement, type, oldProps, newProps, rootContainerInstance) {
  return diffProperties(domElement, type, oldProps, newProps, rootContainerInstance)
}

function diffProperties(domElement, tag, lastRawProps, nextRawProps, rootContainerElement) {
  var updatePayload = null
  var lastProps
  var nextProps
  lastProps = lastRawProps
  nextProps = nextRawProps

  var propKey
  var styleName
  var styleUpdates = null

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
          if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
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

export function updateProperties(domElement, updatePayload) {
  updateDOMProperties(domElement, updatePayload)
}

function updateDOMProperties(domElement, updatePayload) {
  for (var i = 0; i < updatePayload.length; i += 2) {
    var propKey = updatePayload[i]
    var propValue = updatePayload[i + 1]

    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue)
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue)
    } else {
      setValueForProperty(domElement, propKey, propValue)
    }
  }
}

export function setValueForStyles(node, styles) {
  var style = node.style

  for (var styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) continue

    style[styleName] = styles[styleName]
  }
}

export function setTextContent(node, text) {
  if (text) {
    var firstChild = node.firstChild

    if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
      firstChild.nodeValue = text
      return
    }
  }

  node.textContent = text
}

export function resetTextContent(domElement) {
  setTextContent(domElement, '')
}

export function appendPlacementNode(node, parent, append) {
  var tag = node.tag
  var isHost = tag === HostComponent || tag === HostText

  if (isHost) {
    append(parent, node.stateNode)
    return
  }
  var child = node.child
  if (child !== null) {
    appendPlacementNode(child, parent, append)
    var sibling = child.sibling

    while (sibling !== null) {
      appendPlacementNode(sibling, parent, append)
      sibling = sibling.sibling
    }
  }
}

export function getHostParentFiber(fiber) {
  var parent = fiber.return

  while (parent !== null) {
    if (isHostParent(parent)) return parent
    parent = parent.return
  }
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
