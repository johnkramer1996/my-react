import { ThemeContext } from './components/ThemeContext'
import { createElement, memo } from './react/React'
import { Component } from './react/ReactComponent'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from './react/renderWithHooks'

const Parent = ({ children }) => {
  console.log('render Parent')
  return createElement('div', null, children)
}

const Child = () => {
  console.log('render Child')
  return createElement('div', null, 'child')
}

const memoParent = memo(Parent)
const memoChild = memo(Child)

export const App = () => {
  const [count, setCount] = useState(0)

  return createElement(
    'div',
    null,
    createElement('button', { onClick: () => setCount((p) => p + 1) }, 'click', count),
    createElement(memoParent, null, createElement(memoChild)),
  )
}
