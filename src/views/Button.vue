<template>
  <div class="about">
    <my-button type="primary" autoLoading @click="onClick">按钮</my-button>
  </div>
</template>
<script>
import MyButton from '@/components/MyButton.vue'
export default {
  name: 'Button',
  components: {
    'my-button': MyButton
  },
  methods: {
    onClick(done) {
      setTimeout(() => {
        done()
      }, 1000)
    }
  }
}
</script>