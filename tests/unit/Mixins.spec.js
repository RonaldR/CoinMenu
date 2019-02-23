import mixins from '@/mixins';

describe('mixins.js', () => {
    it('has a openExternalLink function', () => {
        expect(typeof mixins.methods.openExternalLink).toBe('function');
    });

    it('openExternalLink return false without url parameter', () => {
        expect(mixins.methods.openExternalLink()).toBe(false);
    });
});
