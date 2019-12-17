export default {
    name: 'Counter',
    props: ['headline'],
    components: {
        /**
         * Use dynamic imports for child components so node doesn't stumble
         * because of unknown file extension '.vue'
         */
        ButtonIncrement: () => import('../../components/ButtonIncrement/ButtonIncrement.vue'),
        ButtonDecrement: () => import('../../components/ButtonDecrement/ButtonDecrement.vue')
    },
    data: function () {
        return {
        }
    }
}
