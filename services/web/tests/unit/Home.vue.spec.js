import { shallowMount } from '@vue/test-utils';
import Home from '@/components/Home.vue';

describe('Home.vue', () => {
  it('has a keyword for "Rwin-bot"', () => {
    const wrapper = shallowMount(Home);
    expect(wrapper.text()).toContain('ストレスフリー');
  });

  it('has a button "登録する" to register schedule', () => {
    const wrapper = shallowMount(Home);
    expect(wrapper.text()).toContain('登録する');
  });
});
