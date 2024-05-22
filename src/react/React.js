export var hasSymbol = typeof Symbol === 'function' && Symbol.for
export var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7
export var REACT_PROVIDER_TYPE = Symbol.for('react.provider')
export var REACT_CONTEXT_TYPE = Symbol.for('react.context')
export var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0
export var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb
export var REACT_MEMO_TYPE = Symbol.for('react.memo')

export function createElement(type, config, ...children) {
  let props = {}
  let key = null
  let ref = null

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref
    }

    if (hasValidKey(config)) {
      key = '' + config.key
    }
    delete config.ref
    delete config.key
  }

  props = {
    ...config,
    children: children.length === 1 ? children[0] : children,
  }

  return ReactElement(type, key, ref, props)
}

export function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render: render,
  }
}

export function memo(type, compare) {
  var elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type: type,
    compare: compare === undefined ? null : compare,
  }

  return elementType
}

export function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) {
    return true
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  var keysA = Object.keys(objA)
  var keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  } // Test for A's keys different from B.

  for (var i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }

  return true
}

export function createContext(defaultValue, calculateChangedBits) {
  if (calculateChangedBits === undefined) {
    calculateChangedBits = null
  }

  var context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _calculateChangedBits: calculateChangedBits,
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    _threadCount: 0,
    // These are circular
    Provider: null,
    Consumer: null,
  }
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  }
  var Consumer = {
    $$typeof: REACT_CONTEXT_TYPE,
    _context: context,
    _calculateChangedBits: context._calculateChangedBits,
  }

  // todo можно удалить?
  Object.defineProperties(Consumer, {
    Provider: {
      get: function () {
        return context.Provider
      },
      set: function (_Provider) {
        context.Provider = _Provider
      },
    },
    _currentValue: {
      get: function () {
        return context._currentValue
      },
      set: function (_currentValue) {
        context._currentValue = _currentValue
      },
    },
    _currentValue2: {
      get: function () {
        return context._currentValue2
      },
      set: function (_currentValue2) {
        context._currentValue2 = _currentValue2
      },
    },
    _threadCount: {
      get: function () {
        return context._threadCount
      },
      set: function (_threadCount) {
        context._threadCount = _threadCount
      },
    },
    Consumer: {
      get: function () {
        return context.Consumer
      },
    },
    displayName: {
      get: function () {
        return context.displayName
      },
      set: function (displayName) {},
    },
  })

  context.Consumer = Consumer

  return context
}

function ReactElement(type, key, ref, props) {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: ref,
    props: props,
  }
}

function hasValidKey(config) {
  {
    if (hasOwnProperty.call(config, 'key')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'key').get

      if (getter && getter.isReactWarning) {
        return false
      }
    }
  }

  return config.key !== undefined
}

function hasValidRef(config) {
  if (hasOwnProperty.call(config, 'ref')) {
    var getter = Object.getOwnPropertyDescriptor(config, 'ref').get

    if (getter && getter.isReactWarning) {
      return false
    }
  }

  return config.ref !== undefined
}
