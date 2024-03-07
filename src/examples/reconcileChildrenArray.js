import { createElement } from './react/React'
import { useState } from './react/renderWithHooks'

export const App = () => {
  const [state, setState] = useState([
    { id: 1, name: 'name 1' },
    { id: 2, name: 'name 2' },
    { id: 3, name: 'name 3' },
    { id: 4, name: 'name 4' },
    { id: 5, name: 'name 5' },
  ])

  const onClick = () => {
    setState([
      { id: 1, name: 'name 1' },
      { id: 5, name: 'name 5' },
      { id: 3, name: 'name 3' },
    ])
  }

  return createElement(
    'div',
    null,
    state.map((i) =>
      createElement(
        'div',
        {
          key: i.id,
          onClick,
        },
        i.name,
      ),
    ),
  )
}
