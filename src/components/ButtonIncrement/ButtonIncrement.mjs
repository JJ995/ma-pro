export default {
    name: 'ButtonIncrement',
    props: ['text'],
    components: {
        CustomButton: () => import('../../components/CustomButton/CustomButton.vue')
    },
    data: function () {
        return {
            count: 0
        }
    },
    methods: {
        increment() {
            this.count++;
        }
    }
}
