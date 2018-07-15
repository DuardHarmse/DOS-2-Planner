<template>
    <div v-on="inputListeners">
        <slot :color="color" :icon="icon" :text="text" :disabled="disabled"></slot>
    </div>
</template>

<script>
    export default {
        mounted() {
            this.color = this.colorDefault;
            this.icon = this.iconDefault;
            this.text = this.textDefault;

            this.$on('click-confirm', this.clickConfirm);
        },
        props: {
            delay: {
                type: Number,
                default: 2500
            },
            disabled: {
                type: Boolean,
                default: false
            },
            colorDefault: {
                type: String,
                default: 'primary'
            },
            colorConfirm: {
                type: String,
                default: 'red'
            },
            iconDefault: String,
            iconConfirm: String,
            textDefault: String,
            textConfirm: String
        },
        data: () => ({
            color: '',
            icon: '',
            text: '',
            isConfirming: false,
            timeout: null,
            clickConfirm: () => { }
        }),
        computed: {
            inputListeners() {
                var vm = this;

                vm.clickConfirm = this.$listeners.click;

                return Object.assign({},
                    // We add all the listeners from the parent.
                    this.$listeners,
                    // Then we can add custom listeners or override the behavior of some listeners.
                    {
                        // This ensures that the component works with v-model.
                        click(event) {
                            event.stopPropagation();

                            if (!vm.disabled) {
                                if (vm.isConfirming) {
                                    clearTimeout(vm.timeout);
                                    vm.$emit('click-confirm', event, vm.reset);
                                }
                                else {
                                    vm.confirm();
                                }
                            }
                        }
                    }
                )
            }
        },
        methods: {
            confirm() {
                this.isConfirming = true;

                this.color = this.colorConfirm;
                this.icon = this.iconConfirm;
                this.text = this.textConfirm;

                this.timeout = setTimeout(this.reset, this.delay);
            },
            reset() {
                this.isConfirming = false;

                this.color = this.colorDefault;
                this.icon = this.iconDefault;
                this.text = this.textDefault;
            }
        }
    };
</script>