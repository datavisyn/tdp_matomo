/// <reference types="jasmine" />
import {trackApp} from '../src/index';

describe('index', () => {
  it('trackApp() exists', () => {
    expect(typeof trackApp).toBe('function');
  });
});
