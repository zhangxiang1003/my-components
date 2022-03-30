<template>
  <div>
    <el-input @change="onChange" v-model="inputStr"></el-input>
    <dynamic-num :price="price"></dynamic-num>
  </div>
</template>

<script>
import DynamicNum from '@/components/DynamicNum.vue'
export default {
  name: 'Number',
  components: {
    'dynamic-num': DynamicNum
  },
  data() {
    return {
      price: 99.90,
      inputStr: ''
    }
  },
  methods: {
    onChange(val) {
      this.price = Number(val)
    }
  }
}
</script>

<style lang="less" scoped>
</style>