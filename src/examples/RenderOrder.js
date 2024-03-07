export const RenderOrder = () => {
  return createElement(
    Div,
    null,
    1,
    createElement(
      Div,
      null,
      2,
      createElement(Div, null, 3),
      createElement(
        Div,
        null,
        4,
        createElement(Div, null, 5, createElement(Div, null, 6)),
        createElement(
          Div,
          null,
          7,
          createElement(Div, null, 8, createElement(Div, null, 9)),
          createElement(Div, null, 10),
        ),
      ),
    ),
  )
}
//!! 3->6->5->9->8->10->7->4->2->1

const Div = ({ children }) => {
  useEffect(() => {
    console.log(children)
  }, [])

  return createElement('div', null, children)
}
