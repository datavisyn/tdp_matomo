/// <reference types="jest" />
import {trackProvenance, trackLogin, trackLogout} from '../src/index';

describe('index', () => {
  it('trackLogin() exists', () => {
    expect(typeof trackLogin).toBe('function');
  });

  it('trackLogout() exists', () => {
    expect(typeof trackLogout).toBe('function');
  });

  it('trackProvenance() exists', () => {
    expect(typeof trackProvenance).toBe('function');
  });
});
