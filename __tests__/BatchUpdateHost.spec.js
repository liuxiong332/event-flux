import BatchUpdateHost from '../src/BatchUpdateHost';

jest.useFakeTimers();

test('Batch', () => {
  test('parseStores', () => {
    let  isEnable = true;
    let appStore = {
      disableUpdate() { isEnable = false; },
      enableUpdate() { isEnable = true; },
    };
    let task1 = jest.fn();
    let task2 = jest.fn();
    let batchUpdater = new BatchUpdateHost(appStore);
    batchUpdater.addTask(task1);
    batchUpdater.addTask(task2);

    expect(batchUpdater.runState).toBe('prepare');
    expect(task1).toBeCalled();
    expect(task2).toBeCalled();
    expect(isEnable).toBeFalsy();
    
    jest.runAllTimers();
    expect(isEnable).toBeTruthy();
    expect(batchUpdater.runState).toBe('idle');
  });
});