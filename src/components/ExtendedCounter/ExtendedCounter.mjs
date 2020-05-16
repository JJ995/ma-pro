export default {
    name: 'ExtendedCounter',
    components: {
        Counter: () => import('../../components/Counter/Counter.vue'),
    },
    data: function () {
        return {
        }
    }
}
