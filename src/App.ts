import { ThemeContext } from './components/ThemeContext'
import { createElement, memo } from './react/React'
import { Component } from './react/ReactComponent'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from './react/renderWithHooks'

export const App = () => {
  const [list, setList] = useState([
    { id: 1, name: 'Vitalii' },
    { id: 2, name: 'Oleg' },
    { id: 3, name: 'Nadiya' },
  ])

  return createElement(
    'div',
    null,
    list.map((el: any, i: number) =>
      createElement(
        'div',
        {
          key: el.id,
          onClick: () => {
            console.log('click')
            setList([
              { id: 3, name: 'Nadiya' },
              { id: 2, name: 'Oleg' },
              { id: 4, name: 'Oleg 4' },
              { id: 1, name: 'Vitalii' },
            ])
          },
        },
        el.name,
      ),
    ),
  )
}
