// import { shallow } from '@vue/test-utils';
import Home from '@/views/Home.vue';

describe('Home.vue', () => {
  // Inspect the raw component options
  it('has a mounted hook', () => {
    expect(typeof Home.mounted).toBe('function');
  });

  // Evaluate the results of functions in
  // the raw component options
  it('sets the correct default data', () => {
    expect(typeof Home.data).toBe('function');
    const defaultData = Home.data();
    expect(defaultData.currency).toBe('dollar');
    expect(defaultData.editMode).toBe(false);
    expect(defaultData.editButtonLabel).toBe('Edit');
  });
});
