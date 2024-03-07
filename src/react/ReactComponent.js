var didWarnStateUpdateForUnmountedComponent = {}

function warnNoop(publicInstance, callerName) {
  {
    var _constructor = publicInstance.constructor
    var componentName = (_constructor && (_constructor.displayName || _constructor.name)) || 'ReactClass'
    var warningKey = componentName + '.' + callerName

    if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
      return
    }

    error(
      "Can't call %s on a component that is not yet mounted. " +
        'This is a no-op, but it might indicate a bug in your application. ' +
        'Instead, assign to `this.state` directly or define a `state = {};` ' +
        'class property with the desired state in the %s component.',
      callerName,
      componentName,
    )

    didWarnStateUpdateForUnmountedComponent[warningKey] = true
  }
}

var ReactNoopUpdateQueue = {
  isMounted: function (publicInstance) {
    return false
  },

  enqueueForceUpdate: function (publicInstance, callback, callerName) {
    warnNoop(publicInstance, 'forceUpdate')
  },

  enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
    warnNoop(publicInstance, 'replaceState')
  },

  enqueueSetState: function (publicInstance, partialState, callback, callerName) {
    warnNoop(publicInstance, 'setState')
  },
}

var emptyObject = {}

{
  Object.freeze(emptyObject)
}

export function Component(props, context, updater) {
  this.props = props
  this.context = context

  this.refs = emptyObject

  this.updater = updater || ReactNoopUpdateQueue
}

Component.prototype.isReactComponent = {}

Component.prototype.setState = function (partialState, callback) {
  if (!(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null)) {
    {
      throw Error(
        'setState(...): takes an object of state variables to update or a function which returns an object of state variables.',
      )
    }
  }
  this.updater.enqueueSetState(this, partialState, callback, 'setState')
}

Component.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate')
}

function ComponentDummy() {}

ComponentDummy.prototype = Component.prototype

function PureComponent(props, context, updater) {
  this.props = props
  this.context = context

  this.refs = emptyObject
  this.updater = updater || ReactNoopUpdateQueue
}

var pureComponentPrototype = (PureComponent.prototype = new ComponentDummy())
pureComponentPrototype.constructor = PureComponent

pureComponentPrototype = Component.prototype

pureComponentPrototype.isPureReactComponent = true
