const Redux = require('redux')
const ReduxStore = require('./index')

describe('ReduxStore', () => {
  function createStore (reducers = {}) {
    const reducer = Redux.combineReducers({ ...reducers, uppy: ReduxStore.reducer })
    return Redux.createStore(reducer)
  }

  it('can be created with named or default import', () => {
    const r = createStore()
    let store = new ReduxStore.ReduxStore({ store: r })
    expect(typeof store).toBe('object')
    store = new ReduxStore({ store: r })
    expect(typeof store).toBe('object')
  })

  it('merges in state using `setState`', () => {
    const r = createStore()
    const store = new ReduxStore({ store: r })
    expect(store.getState()).toEqual({})

    store.setState({
      a: 1,
      b: 2,
    })
    expect(store.getState()).toEqual({ a: 1, b: 2 })

    store.setState({ b: 3 })
    expect(store.getState()).toEqual({ a: 1, b: 3 })
  })

  it('notifies subscriptions when state changes', () => {
    let expected = []
    let calls = 0
    function listener (prevState, nextState, patch) {
      calls++
      expect([prevState, nextState, patch]).toEqual(expected)
    }

    const r = createStore()
    const store = new ReduxStore({ store: r })
    store.subscribe(listener)

    expected = [{}, { a: 1, b: 2 }, { a: 1, b: 2 }]
    store.setState({
      a: 1,
      b: 2,
    })

    expected = [{ a: 1, b: 2 }, { a: 1, b: 3 }, { b: 3 }]
    store.setState({ b: 3 })

    expect(calls).toBe(2)
  })

  it('fires `subscribe` if state is modified externally (eg redux devtools)', () => {
    const reducer = Redux.combineReducers({ uppy: ReduxStore.reducer })
    const r = Redux.createStore((state, action) => {
      // Add a `SET` action that can change Uppy state without going through the Uppy reducer or action creator.
      // Emulates Redux Devtools.
      if (action.type === 'SET') return action.payload
      return reducer(state, action)
    })

    let expected = []
    let calls = 0
    function listener (prevState, nextState, patch) {
      calls++
      expect([prevState, nextState, patch]).toEqual(expected)
    }

    const store = new ReduxStore({ store: r })
    store.subscribe(listener)

    expected = [{}, { a: 1 }, { a: 1 }]
    store.setState({ a: 1 })

    expected = [{ a: 1 }, { b: 2 }, { b: 2 }]
    // redux-devtools's `JUMP_TO_STATE` is similar to this.
    r.dispatch({
      type: 'SET',
      payload: {
        uppy: {
          [store[Symbol.for('uppy test: get id')]()]: { b: 2 },
        },
      },
    })

    expect(calls).toBe(2)
  })

  it('can mount in a custom state key', () => {
    const reducer = Redux.combineReducers({
      hello: ReduxStore.reducer,
    })
    const r = Redux.createStore(reducer)
    const store = new ReduxStore({
      store: r,
      id: 'world',
      selector: state => state.hello.world,
    })
    store.setState({ a: 1 })

    expect(r.getState()).toEqual({
      hello: {
        world: {
          a: 1,
        },
      },
    })
  })
})
