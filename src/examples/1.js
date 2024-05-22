import { ThemeContext } from './components/ThemeContext'
import { createElement, memo } from './react/React'
import { Component } from './react/ReactComponent'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from './react/renderWithHooks'

export const App = () => {
  const [count, setCount] = useState(0)

  return createElement(
    'div',
    null,
    createElement('button', { onClick: () => setCount((p) => p + 1) }, 'click', count),
    createElement(ClassComponent),
  )
}

class ClassComponent extends Component {
  constructor(props) {
    super(props)
    this.state = { isToggleOn: true }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    this.setState((prevState) => {
      console.log('change state')
      return {
        isToggleOn: !prevState.isToggleOn,
      }
    })
  }

  componentDidUpdate() {
    console.log('componentDidUpdate')
  }

  componentWillMount() {
    console.log('componentWillMount')
  }

  componentWillReceiveProps(props) {
    console.log('componentWillReceiveProps', props)
  }

  // shouldComponentUpdate() {
  //   return true
  // }

  render() {
    console.log('change ')
    return createElement(
      'button',
      { onClick: this.handleClick },
      createElement(
        'div',
        {},
        this.state.isToggleOn ? createElement(RenderComponent) : false,
        this.state.isToggleOn ? 'ON' : 'OFF',
      ),
    )
  }
}

class RenderComponent extends Component {
  render() {
    console.log('render')
    return createElement('div', null, 123)
  }
}
