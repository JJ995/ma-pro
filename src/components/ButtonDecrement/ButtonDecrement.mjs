export default {
    name: 'ButtonDecrement',
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
        decrement() {
            this.count--;
        }
    }
}
