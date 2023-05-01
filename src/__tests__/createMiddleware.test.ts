import * as actions from '../actions';
import middleware from '../createMiddleware';
import ReduxWebSocket from '../ReduxWebSocket';
import type { Options } from '../types';

jest.mock('../ReduxWebSocket');

const ReduxWebSocketMock = ReduxWebSocket as jest.Mock<ReduxWebSocket>;
const connectMock = jest.fn();
const disconnectMock = jest.fn();
const sendMock = jest.fn();
const nextMock = jest.fn();
const dispatchMock = jest.fn((i) => i);
const mockStore = (options: Options = {}) => {
  const store = { getState: () => {}, dispatch: dispatchMock };
  const wrapper = middleware(options)(store);
  const dispatch = wrapper(nextMock);

  return { store, wrapper, dispatch };
};

// @ts-ignore
ReduxWebSocketMock.mockImplementation((options) => {
  /* eslint-disable lines-between-class-members */
  class Fake {
    close = () => {};

    connect = connectMock;

    disconnect = disconnectMock;

    handleBrokenConnection = () => {};

    hasOpened = false;

    lastSocketUrl = '';

    private options = options;

    reconnectCount = 0;

    reconnectionInterval = null;

    reconnectOnClose = false;

    send = sendMock;

    websocket = null;

    handleClose = () => {};

    handleError = () => {};

    handleOpen = () => {};

    handleMessage = () => {};
  }
  /* eslint-enable lines-between-class-members */

  return new Fake();
});

describe('middleware', () => {
  beforeEach(() => {
    ReduxWebSocketMock.mockClear();
    connectMock.mockClear();
    disconnectMock.mockClear();
    sendMock.mockClear();
    nextMock.mockClear();
  });

  it('creates a new ReduxWebSocket instance', () => {
    middleware();

    expect(ReduxWebSocketMock).toHaveBeenCalled();
  });

  it('passes default options to the ReduxWebSocket constructor', () => {
    middleware();

    expect(ReduxWebSocketMock).toHaveBeenCalledWith({
      prefix: 'REDUX_WEBSOCKET',
      reconnectInterval: 2000,
      reconnectOnClose: false,
      reconnectOnError: true,
      serializer: JSON.stringify,
      dateSerializer: null,
    });
  });

  it('passes custom options to the ReduxWebSocket constructor', () => {
    middleware({ prefix: 'CUSTOM' });

    expect(ReduxWebSocketMock).toHaveBeenCalledWith({
      prefix: 'CUSTOM',
      reconnectInterval: 2000,
      reconnectOnClose: false,
      reconnectOnError: true,
      serializer: JSON.stringify,
      dateSerializer: null,
    });
  });

  it('can create multiple instances of ReduxWebSocket', () => {
    middleware({ prefix: 'ONE' });
    middleware({ prefix: 'TWO', reconnectOnClose: true });

    expect(ReduxWebSocketMock).toHaveBeenCalledTimes(2);
    expect(ReduxWebSocketMock).toHaveBeenCalledWith({
      prefix: 'ONE',
      reconnectInterval: 2000,
      reconnectOnClose: false,
      reconnectOnError: true,
      serializer: JSON.stringify,
      dateSerializer: null,
    });
    expect(ReduxWebSocketMock).toHaveBeenCalledWith({
      prefix: 'TWO',
      reconnectInterval: 2000,
      reconnectOnClose: true,
      reconnectOnError: true,
      serializer: JSON.stringify,
      dateSerializer: null,
    });
  });

  it('should handle a REDUX_WEBSOCKET::CONNECT action', () => {
    const { store, dispatch } = mockStore();
    const dispatchedAction = {
      type: 'REDUX_WEBSOCKET::CONNECT',
      meta: { timestamp: expect.any(Date) },
      payload: {
        url: 'ws://example.com',
      },
    };

    dispatch(actions.connect('ws://example.com'));

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(dispatchedAction);
    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(connectMock).toHaveBeenCalledWith(store, dispatchedAction);
  });

  it('should handle a REDUX_WEBSOCKET::DISCONNECT action', () => {
    const { store, dispatch } = mockStore();
    const dispatchedAction = {
      type: 'REDUX_WEBSOCKET::DISCONNECT',
      meta: { timestamp: expect.any(Date) },
    };

    dispatch(actions.disconnect());

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(dispatchedAction);
    expect(disconnectMock).toHaveBeenCalledTimes(1);
    expect(disconnectMock).toHaveBeenCalledWith(store, dispatchedAction);
  });

  it('should handle a REDUX_WEBSOCKET::SEND action', () => {
    const { store, dispatch } = mockStore();
    const dispatchedAction = {
      type: 'REDUX_WEBSOCKET::SEND',
      meta: { timestamp: expect.any(Date) },
      payload: {
        test: 'message',
      },
    };

    dispatch(actions.send({ test: 'message' }));

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(dispatchedAction);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(store, dispatchedAction);
  });

  it('should not break on random actions', () => {
    const { dispatch } = mockStore();

    dispatch({
      type: `REDUX_WEBSOCKET::${Math.random().toString(36).substring(2, 15)}`,
    });
    dispatch({ type: 'something-else-entirely' });

    expect(connectMock).not.toHaveBeenCalled();
    expect(disconnectMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should dispatch an error action if a handler throws an error', () => {
    const err = new Error('whoops');

    sendMock.mockImplementation(() => {
      throw err;
    });

    const { dispatch } = mockStore();
    dispatch(actions.send({ test: 'message' }));
    const expectedResult = {
      type: 'REDUX_WEBSOCKET::SEND',
      meta: {
        timestamp: expect.any(Date),
      },
      payload: {
        test: 'message',
      },
    };

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(expectedResult);
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      error: true,
      type: 'REDUX_WEBSOCKET::ERROR',
      meta: {
        timestamp: expect.any(Date),
        originalAction: expectedResult,
        name: 'Error',
        message: 'whoops',
      },
      payload: err,
    });
  });

  it('should not serialize timestamp by default', () => {
    const { dispatch } = mockStore();
    const action = {
      type: 'REDUX_WEBSOCKET::MESSAGE',
      meta: { timestamp: new Date() },
      payload: {
        test: 'message',
      },
    };

    dispatch(action);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(action);
  });

  it('should serialize timestamp with config option', () => {
    const dateSerializer = (date: Date) => date.toISOString();
    const { dispatch } = mockStore({ dateSerializer });
    const action = {
      type: 'REDUX_WEBSOCKET::MESSAGE',
      meta: { timestamp: new Date('2020-01-01') },
      payload: {
        test: 'message',
      },
    };

    dispatch(action);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith({
      type: 'REDUX_WEBSOCKET::MESSAGE',
      meta: { timestamp: '2020-01-01T00:00:00.000Z' },
      payload: {
        test: 'message',
      },
    });
  });
});
