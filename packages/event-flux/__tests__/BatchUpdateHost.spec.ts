import BatchUpdateHost from '../src/BatchUpdateHost';

jest.useFakeTimers();

test('Batch', () => {
  let sendUpdateFn = jest.fn(); 
  let appStore = {
    _sendUpdate: sendUpdateFn,
  };

  let batchUpdater = new BatchUpdateHost(appStore);
  batchUpdater.requestUpdate();
  batchUpdater.requestUpdate();

  expect(batchUpdater.runState).toBe('prepare');
  
  jest.runAllTimers();
  expect(sendUpdateFn).toHaveBeenCalled();
  expect(batchUpdater.runState).toBe('idle');
});