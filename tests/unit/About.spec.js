import { shallow } from '@vue/test-utils';
import About from '@/views/About.vue';

describe('About.vue', () => {
  it('has a created hook', () => {
    expect(typeof About.created).toBe('function');
  });

  it('has a destroyed hook', () => {
    expect(typeof About.destroyed).toBe('function');
  });
});
