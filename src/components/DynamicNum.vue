<template>
  <div class="roller">
    <i>￥</i>
    <div v-show="isAnimationEnd" class="roller_trans">
      <div
        v-for="char in priceStatic"
        :key="char.id"
        class="roller__wrapper"
        :class="char ? char.numType : ''"
      >
        <ul class="roller__char">
          <li class="roller__char__item">
            {{ char.num }}
          </li>
        </ul>
      </div>
    </div>
    <template v-if="!isAnimationEnd">
      <transition-group
        tag="div"
        name="roller"
        class="roller_trans"
      >
        <div
          v-for="t in newPrice"
          :key="t.key"
          class="roller__wrapper"
          :class="t ? t.numType : ''"
        >
          <ul
            class="roller__char roller_block"
            :style="{
              top: `${isRollStart && t.list ? (t.list.length - 1) * -100 : 0}%`,
              height: `${t.list ? t.list.length * 100 : 0}%`,
              transition: `${realTeansTime(t.list)}s`,
            }"
          >
            <li
              v-for="(char, index) in t.list"
              :key="index"
              class="roller__char__item"
            >
              {{ char }}
            </li>
          </ul>
        </div>
      </transition-group>
    </template>
  </div>
</template>

<script>
import { toFixed } from '@/utils/number'
const numList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
export default {
  name: 'DynamicPrice',
  props: {
    // 价格
    price: {
      type: [Number, String],
      default: 0,
    },
    // 动画的最大时长，如果滚动距离短会相对变小
    transition: {
      type: [Number, String],
      default: 1.5,
    },
  },
  data() {
    return {
      // 数据更新完毕，执行动画的标记
      isRollStart: false,
      // 动画执行完成，切换回静态数据的标记
      isAnimationEnd: false,
      // 用来动画显示的数字
      newPrice: [],
      // 用来兜底的数字
      priceStatic: [],
      // 上一次的价格
      lastPrice: '',
      // 有动画的dom
      animmationEles: [],
      // 异常时做兜底的计数器
      errorTimer: '',
      // 监听器状态管理的容器数量
      transStartCount: 0,
    }
  },
  watch: {
    price(val) {
      if (!this.isAnimationEnd) {
        this.destroyAnimation()
      }
      // 之前newPrice清空了，但是由于有transition-group，dom更新可能不会立即完成；因此这里要延迟一下。否则可能出现两份newPrice在dom中同时存在
      this.$nextTick(() => {
        this.priceChange(this.padZero(val, 2))
      })
    },
  },
  mounted() {
    this.priceChange('0.00')
    if (this.price) {
      this.priceChange(this.padZero(this.price))
    }
  },
  // 组件销毁前
  beforeDestroy() {
    for (let i = 0; i < this.animmationEles.length; i++) {
      this.animmationEles[i].removeEventListener('transitionstart', this.transStartListenFun, true)
      this.animmationEles[i].removeEventListener('transitionend', this.transEndListenFun, true)
    }
  },
  methods: {
    // 根据滚动的长度赋值动画时间
    realTeansTime(list) {
      return list ? (this.transition * list.length) / 10 : 0
    },
    // 检查最后结果是不是’.‘
    checkLastPoint(arr) {
      if (arr instanceof Array) {
        return arr[arr.length - 1] === '.'
      } else {
        return false
      }
    },
    // 判断是整数位，还是小数位，还是小数点
    judgeNumType(list, index) {
      const dotIndex = list.indexOf('.')
      if (index === dotIndex) {
        return 'dot'
      } else if (index < dotIndex) {
        return 'decimal'
      } else {
        return 'integer'
      }
    },
    // 销毁当前在监听动画的事件、兜底切换事件，结束动画， 并且更新为静态数据
    destroyAnimation() {
      for (let i = 0; i < this.animmationEles.length; i++) {
        this.animmationEles[i].removeEventListener('transitionstart', this.transStartListenFun, true)
        this.animmationEles[i].removeEventListener('transitionend', this.transEndListenFun, true)
      }
      this.transStartCount = 0
      this.isRollStart = false
      clearTimeout(this.errorTimer)
      this.changePriceToStatic()
    },
    // 补0两位，原来超过两位不修改
    padZero(num) {
      // 超过两位小数的数，肯定比保留两位小数并向下去整的数大
      if (num * 100 > Math.floor(num * 100)) {
        return num
      } else {
        return toFixed(num, 2)
      }
    },
    /** 生成需要长度的列
     *  @param startNum 起始值
     *  @param endNum 结束值
     * */
    createLi(startNum, endNum) {
      let list = []
      const startIndex = numList.indexOf(startNum)
      const endIndex = numList.indexOf(endNum)
      let distance = 0
      list.push(startNum)
      if (startIndex === -1) {
        distance = endIndex + 1
        // 上一次这位是’.‘
        for (let i = 0; i < distance; i++) {
          list.push(numList[i])
        }
      } else if (endIndex === -1) {
        // 下一次这位是’.‘
        list.push(endNum)
      } else if (
        startIndex !== -1 &&
        endIndex !== -1 &&
        startIndex !== endIndex
      ) {
        // 数字到数字，没有’.‘
        distance = endNum - startNum
        distance = distance > 0 ? distance : distance + 10
        for (let i = startIndex + 1; i <= distance + startIndex; i++) {
          list.push(numList[i >= numList.length ? i - numList.length : i])
        }
      }
      return list
    },
    // 切换数据为静态
    changePriceToStatic() {
      this.newPrice = []
      this.isAnimationEnd = true
    },
    /**
     * @param num 展示的数字
     */
    priceChange(num) {
      this.isAnimationEnd = false
      // 要保证动态的那一整个DOM先创建完，要不动画可能不会生效
      this.$nextTick(() => {
        this.isRollStart = false
        let strArr = num.toString().split('')
        this.priceStatic = []
        let oldNum = this.lastPrice.split('')
        let list = []
        // 如果没有缓存，开始数字填充0.00
        if (!oldNum || oldNum.length === 0) {
          oldNum = [0, '.', 0, 0]
        }
        // 如果上一次和现在长度一样，则直接计算;如果新的数字位数小，则直接把长的几位截取
        // 如果新的数字位数大，则把新的几位填充数列，并带有动画
        const gap = strArr.length - oldNum.length
        if (gap > 0) {
          const fillArr = new Array(gap).fill('0')
          oldNum = fillArr.concat(oldNum)
        }
        if (gap < 0) {
          oldNum = oldNum.slice(-gap)
        }
        for (let i = 0; i < strArr.length; i++) {
          const numType = this.judgeNumType(strArr, i)
          this.priceStatic.push({
            num: strArr[i],
            id: i,
            numType,
          })
          list.push({
            list: this.createLi(oldNum[i], strArr[i]),
            numType,
            key: Math.random(),
          })
        }
        this.newPrice = list
        // 兜底，如果超过时间还没有结束，则结束动画
        this.errorTimer = setTimeout(() => {
          this.changePriceToStatic()
        }, this.transition * 1000 + 200)
        // 开始监听动画，结束后切换为静态数据
        this.$nextTick(() => {
          this.handleAnimationProcess()
          this.isRollStart = true
        })
        this.lastPrice = num.toString()
      })
    },
    // 监听动画执行
    handleAnimationProcess() {
      this.animmationEles = document.getElementsByClassName('roller_block')
      this.transStartCount = 0
      for (let i = 0; i < this.animmationEles.length; i++) {
        this.animmationEles[i].addEventListener('transitionstart', this.transStartListenFun, true)
        this.animmationEles[i].addEventListener('transitionend', this.transEndListenFun, true)
      }
    },
    transStartListenFun() {
      this.transStartCount++
    },
    transEndListenFun() {
      this.transStartCount--
      if (this.transStartCount === 0) {
        clearTimeout(this.errorTimer)
        this.changePriceToStatic()
      }
    },
  },
}
</script>

<style lang="less">
// 由于这个组件的都没是通过innerHTML添加的，所以这里不能加scoped,因为按在vue的判断加的内容没有挂在组件下（data-v）

.roller {
  overflow: hidden;
  display: flex;
  line-height: 0;
  align-items:flex-end ;
  position: relative;
  padding-left: 18px;
  font-weight: 500;
  i {
    position: absolute;
    font-size: 26px;
    line-height: 26px;
    width: 24px;
    height: 28px;
    left: -4px;
    bottom: 0;
    font-style: normal;
  }
  .roller_trans {
    display: flex;
    align-items: flex-end;
  }
  .roller__wrapper {
    position: relative;
    overflow: hidden;
    display: inline-block;
  }
  .roller__char {
    transition: 0.5s;
    position: relative;
    list-style: none;
    line-height: 44px;
    .roller__char__item {
      display: block;
      user-select: none;
      text-align: center;
    }
  }
  .decimal {
    font-size: 48px;
    width: 28px;
    height: 42px;
    .roller__char__item {
      width: 28px;
      height: 42px;
    }
  }
  .dot {
    height: 28px;
    .roller__char {
      height: 28px;
      line-height: 28px;
    .roller__char__item {
      height: 28px;
      font-size: 26px;
    }
    }
  }
  .integer {
    height: 28px;
    width: 15px;
    .roller__char {
      line-height: 28px;
    }
    .roller__char__item {
      height: 28px;
      font-size: 26px;
    }
  }
}
</style>
