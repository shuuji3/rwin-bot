import { shallowMount } from '@vue/test-utils';
import App from '@/App.vue';

describe('App.vue', () => {
  it('has a GitHub link on the nav bar', () => {
    const wrapper = shallowMount(App);
    expect(wrapper.text()).toContain('GitHub');
  });
});

