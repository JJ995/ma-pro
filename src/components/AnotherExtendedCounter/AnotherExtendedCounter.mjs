export default {
    name: 'AnotherExtendedCounter',
    components: {
        ExtendedCounter: () => import('../../components/ExtendedCounter/ExtendedCounter.vue'),
    },
    data: function () {
        return {
        }
    }
}
