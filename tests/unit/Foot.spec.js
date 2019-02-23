// import { shallow } from '@vue/test-utils';
import foot from '@/components/Foot.vue';

describe('Foot.vue', () => {
    it('has a mounted hook', () => {
        expect(typeof foot.mounted).toBe('function');
    });
});
