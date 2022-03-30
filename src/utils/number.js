import Big from 'big.js'

/**
 * 四舍五入指定小数位数
 * @param {数字} num
 * @param {小数位数} precision
 */
export function toFixed(num, precision = 2) {
  if (num == null || isNaN(num)) return ''
  return new Big(num).toFixed(precision)
}