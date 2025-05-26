import {
  REACT_ELEMENT_TYPE,
  REACT_FRAGMENT_TYPE,
  ReactElement,
  ReactNode,
  ReactType,
} from './React'
import {
  createFiberFromElement,
  createFiberFromFragment,
  createFiberFromText,
  createWorkInProgress,
  FiberNode,
} from './fiber'

export function reconcileChildren(
  current: FiberNode,
  workInProgress: FiberNode,
  nextChildren: ReactElement,
  renderExpirationTime: number,
) {
  return (workInProgress.child =
    current === null
      ? mountChildFibers(
          workInProgress,
          null,
          nextChildren,
          renderExpirationTime,
        )
      : reconcileChildFibers(
          workInProgress,
          current.child,
          nextChildren,
          renderExpirationTime,
        ))
}

var reconcileChildFibers = ChildReconciler(true)
var mountChildFibers = ChildReconciler(false)
function ChildReconciler(shouldTrackSideEffects: boolean) {
  function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
    newChild: ReactElement,
    expirationTime: number,
  ) {
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          var newFiber = reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild,
            expirationTime,
          )
          return placeSingleChild(newFiber)
      }
    }
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      var newFiber = reconcileSingleTextNode(
        returnFiber,
        currentFirstChild,
        newChild,
        expirationTime,
      )
      return placeSingleChild(newFiber)
    }
    if (Array.isArray(newChild))
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,
        expirationTime,
      )

    return deleteRemainingChildren(returnFiber, currentFirstChild)
  }

  function reconcileChildrenArray(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
    newChildren: ReactElement[],
    expirationTime: number,
  ) {
    var resultingFirstChild: FiberNode | null = null
    let previousNewFiber: FiberNode | null = null
    var oldFiber: FiberNode | null = currentFirstChild
    var lastPlacedIndex = 0
    var newIdx = 0
    var nextOldFiber: FiberNode | null = null

    //!! first always mount, lastPlacedIndex no matter
    if (oldFiber === null) {
      for (; newIdx < newChildren.length; newIdx++) {
        var _newFiber = createChild(
          returnFiber,
          newChildren[newIdx],
          expirationTime,
        )
        placeChild(_newFiber, lastPlacedIndex, newIdx, expirationTime)

        if (previousNewFiber === null) resultingFirstChild = _newFiber
        else previousNewFiber.sibling = _newFiber
        previousNewFiber = _newFiber
      }
      return resultingFirstChild
    }

    //!! second update, if order have not changed. Can delete element, but not add to the end. 3->2. 2!->3
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      //TODO: HOW IT WORK
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber
        oldFiber = null
      } else {
        nextOldFiber = oldFiber.sibling
      }
      //!! if key change return null
      var newFiber = updateSlot(
        returnFiber,
        oldFiber!,
        newChildren[newIdx],
        expirationTime,
      )
      if (newFiber === null) {
        oldFiber = oldFiber || nextOldFiber
        break
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null)
          deleteChild(returnFiber, oldFiber)
      }
      lastPlacedIndex = placeChild(
        newFiber,
        lastPlacedIndex,
        newIdx,
        expirationTime,
      )
      if (previousNewFiber === null) resultingFirstChild = newFiber
      else previousNewFiber.sibling = newFiber
      previousNewFiber = newFiber
      oldFiber = nextOldFiber
    }

    //!! if all children placed -> delete remain
    if (newIdx === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber)
      return resultingFirstChild
    }
    var existingChildren = mapRemainingChildren(oldFiber!)

    //!! third update from map, if order have changed
    for (; newIdx < newChildren.length; newIdx++) {
      var _newFiber2 = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        expirationTime,
      )

      if (_newFiber2 !== null) {
        if (shouldTrackSideEffects) {
          if (_newFiber2.alternate !== null) {
            var key = _newFiber2.key === null ? newIdx : _newFiber2.key
            existingChildren.delete(key)
          }
        }
        lastPlacedIndex = placeChild(
          _newFiber2,
          lastPlacedIndex,
          newIdx,
          expirationTime,
        )
        if (previousNewFiber === null) resultingFirstChild = _newFiber2
        else previousNewFiber.sibling = _newFiber2
        previousNewFiber = _newFiber2
      }
    }

    if (shouldTrackSideEffects) {
      existingChildren.forEach((child) => deleteChild(returnFiber, child))
    }
    return resultingFirstChild
  }

  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
    textContent: string,
    expirationTime: number,
  ) {
    if (currentFirstChild === null || currentFirstChild.tag !== HostText) {
      var created = createFiberFromText(
        textContent,
        returnFiber.mode,
        expirationTime,
      )
      created.return = returnFiber
      return created
    }

    var existing = useFiber(currentFirstChild, textContent)
    existing.return = returnFiber
    return existing
  }

  //! for all one child
  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
    element: ReactElement,
    expirationTime: number,
  ) {
    var key = element.key
    var child = currentFirstChild

    if (child !== null) {
      if (child.key === key) {
        switch (child.tag) {
          case Fragment: {
            if (element.type === REACT_FRAGMENT_TYPE) {
              var existing = useFiber(child, element.props.children)
              existing.return = returnFiber

              return existing
            }
            break
          }

          default: {
            if (child.type === element.type) {
              var existing = useFiber(child, element.props)

              existing.ref = element.ref
              existing.return = returnFiber

              return existing
            }

            break
          }
        }
      } else {
        deleteChild(returnFiber, child)
      }
    }

    if (element.type === REACT_FRAGMENT_TYPE) {
      var created = createFiberFromFragment(
        element.props.children,
        returnFiber.mode,
        element.key,
        expirationTime,
      )
      created.return = returnFiber
      return created
    }

    var created = createFiberFromElement(
      element,
      returnFiber.mode,
      expirationTime,
    )
    created.ref = element.ref
    created.return = returnFiber
    return created
  }

  function mapRemainingChildren(currentFirstChild: FiberNode) {
    var existingChildren = new Map<number | string, FiberNode>()
    var existingChild: FiberNode | null = currentFirstChild

    while (existingChild !== null) {
      var key =
        existingChild.key !== null ? existingChild.key : existingChild.index
      existingChildren.set(key, existingChild)
      existingChild = existingChild.sibling
    }
    return existingChildren
  }

  function deleteRemainingChildren(
    returnFiber: FiberNode,
    childToDelete: FiberNode | null,
  ) {
    if (!shouldTrackSideEffects) return null
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete)
      childToDelete = childToDelete.sibling
    }
    return null
  }

  function updateSlot(
    returnFiber: FiberNode,
    oldFiber: FiberNode,
    newChild: ReactNode,
    expirationTime: number,
  ) {
    var key = oldFiber !== null ? oldFiber.key : null

    if (typeof newChild === 'string' || typeof newChild === 'number')
      return updateTextNode(returnFiber, oldFiber, newChild, expirationTime)
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          //! key equal
          if (newChild.key === key) {
            if (newChild.type === REACT_FRAGMENT_TYPE) {
              return updateFragment(
                returnFiber,
                oldFiber,
                newChild.props.children,
                expirationTime,
                key,
              )
            }

            return updateElement(
              returnFiber,
              oldFiber,
              newChild,
              expirationTime,
            )
          } else {
            return null
          }
        }
      }

      if (Array.isArray(newChild)) {
        if (key !== null) {
          //? the fragment can't have key???
          return null
        }

        return updateFragment(
          returnFiber,
          oldFiber,
          newChild,
          expirationTime,
          null,
        )
      }
    }
    return null
  }

  function updateFromMap(
    existingChildren: Map<number | string, FiberNode>,
    returnFiber: FiberNode,
    newIdx: number,
    newChild: ReactNode,
    expirationTime: number,
  ) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      var matchedFiber = existingChildren.get(newIdx) || null
      return updateTextNode(returnFiber, matchedFiber, newChild, expirationTime)
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          var key = newChild.key === null ? newIdx : newChild.key
          var _matchedFiber = existingChildren.get(key) || null

          if (newChild.type === REACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              _matchedFiber,
              newChild.props.children,
              expirationTime,
              newChild.key,
            )
          }
          return updateElement(
            returnFiber,
            _matchedFiber,
            newChild,
            expirationTime,
          )
        }
      }

      if (Array.isArray(newChild)) {
        var _matchedFiber3 = existingChildren.get(newIdx) || null

        return updateFragment(
          returnFiber,
          _matchedFiber3,
          newChild,
          expirationTime,
          null,
        )
      }
    }
    return null
  }

  function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
    if (!shouldTrackSideEffects) {
      return
    }

    var last = returnFiber.lastEffect

    if (last !== null) {
      last.nextEffect = childToDelete
      returnFiber.lastEffect = childToDelete
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete
    }
    childToDelete.nextEffect = null
    childToDelete.effectTag = Deletion
  }

  function useFiber(fiber, pendingProps) {
    var clone = createWorkInProgress(fiber, pendingProps)
    clone.index = 0
    clone.sibling = null
    return clone
  }

  //!! add tag for Placement
  function placeChild(
    newFiber: FiberNode,
    lastPlacedIndex: number,
    newIndex: number,
    expirationTime: number,
  ) {
    newFiber.index = newIndex
    if (!shouldTrackSideEffects) return lastPlacedIndex
    var current = newFiber.alternate
    //!! current.index = 2, lastPlacedIndex = 3
    if (current === null || current.index < lastPlacedIndex) {
      //!! moved to the end
      //!! 1-"2"-3 => 1-3-"2". need re-placement
      //!! return 3
      newFiber.effectTag = Placement
      return lastPlacedIndex
    }
    //!! moved to the begginning
    //!! 1-2-"3" => 1-"3"-2. not need re-placement. Need re-placement other(2) or delete if need
    //!! return 3
    return current.index
  }

  function placeSingleChild(newFiber) {
    //!! первый ребенок рута ставиться на размещение
    if (shouldTrackSideEffects && newFiber.alternate === null)
      newFiber.effectTag = Placement
    return newFiber
  }

  //! if mount create else copy current
  function updateTextNode(
    returnFiber: FiberNode,
    current: FiberNode | null,
    textContent: string,
    expirationTime: number,
  ) {
    if (current === null || current.tag !== HostText) {
      var created = createFiberFromText(
        textContent,
        returnFiber.mode,
        expirationTime,
      )
      created.return = returnFiber
      return created
    }
    var existing = useFiber(current, textContent)
    existing.return = returnFiber
    return existing
  }

  //! if mount create else copy current
  function updateElement(returnFiber, current, element, expirationTime) {
    if (current === null || current.elementType !== element.type) {
      var created = createFiberFromElement(
        element,
        returnFiber.mode,
        expirationTime,
      )
      created.ref = element.ref
      created.return = returnFiber
      return created
    }

    var existing = useFiber(current, element.props)
    existing.ref = element.ref
    existing.return = returnFiber
    return existing
  }

  //! if mount create else copy current
  function updateFragment(returnFiber, current, fragment, expirationTime, key) {
    if (current === null || current.tag !== Fragment) {
      var created = createFiberFromFragment(
        fragment,
        returnFiber.mode,
        expirationTime,
        key,
      )
      created.return = returnFiber
      return created
    }
    var existing = useFiber(current, fragment)
    existing.return = returnFiber
    return existing
  }

  //?? IF NEWCHILD = BOOLEAN TYPE
  function createChild(
    returnFiber: FiberNode,
    newChild: ReactNode | null,
    expirationTime: number,
  ) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      var created = createFiberFromText(
        newChild,
        returnFiber.mode,
        expirationTime,
      )
      created.return = returnFiber
      return created
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          var _created = createFiberFromElement(
            newChild,
            returnFiber.mode,
            expirationTime,
          )
          _created.ref = newChild.ref
          _created.return = returnFiber
          return _created
        }
      }

      if (Array.isArray(newChild)) {
        var _created3 = createFiberFromFragment(
          newChild,
          returnFiber.mode,
          expirationTime,
          null,
        )

        _created3.return = returnFiber
        return _created3
      }
    }

    throw new Error('not found in cratechild')
  }

  return reconcileChildFibers
}
