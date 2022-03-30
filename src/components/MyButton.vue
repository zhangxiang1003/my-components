<template>
  <el-button v-bind="$attrs" :loading="loadingStatus" @click="handleClick">
    <slot></slot>
  </el-button>
</template>

<script>
export default {
  name: 'MyButton',
  props: {
    autoLoading: {
      type: Boolean,
      default: false
    },
    autoConfirm: {
      type: Boolean,
      default: false
    },
    confirmConfig: {
      type: Object,
      default() {
        return {
          title: '提示',
          message: '此操作将永久删除该数据, 是否继续?',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      }
    }
  },
  data() {
    return {
      loadingStatus: false
    }
  },
  methods: {
    handleClick() {
      if (this.autoConfirm) {
        const { title, message, confirmButtonText, cancelButtonText, type } =
          this.confirmConfig
        this.$confirm(message, title, {
          confirmButtonText,
          cancelButtonText,
          type
        })
          .then(() => {
            this.$emit('confirm')
          })
          .catch(() => {
            this.$emit('cancel')
          })
      }
      if (this.autoLoading) {
        this.loadingStatus = true
      }
      this.$emit('click', () => {
        this.loadingStatus = false
      })
    }
  }
}
</script>