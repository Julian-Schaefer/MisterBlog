import { DateProxyPipe } from './date-proxy.pipe';

describe('DateProxyPipePipe', () => {
  it('create an instance', () => {
    const pipe = new DateProxyPipe(undefined);
    expect(pipe).toBeTruthy();
  });
});
