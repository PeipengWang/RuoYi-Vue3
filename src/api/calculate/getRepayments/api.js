// src/api/calculate/getRepayments/api.js
import request from '@/utils/request'

// ========== 还款计算相关 ==========
// 等额本金（基于 repay: '/demo/api/repay' 转化）
export function getEqualPrincipal(data) {
    return request({
        url: '/repay/equal-principal',
        method: 'post',
        data: data
    })
}

// 等额本息（基于 repay: '/demo/api/repay' 转化）
export function getEqualInterest(data) {
    return request({
        url: '/repay/equal-interest',
        method: 'post',
        data: data
    })
}

// ========== 收入计算 ==========
// 收入计算（基于 income: '/demo/api/income/calculate' 转化）
export function calculateIncome(data) {
    return request({
        url: '/income/calculate',
        method: 'post',
        data: data
    })
}

// ========== 应急能力计算 ==========
// 应急能力计算（基于 emergency: '/demo/api/emergency/calculate' 转化）
export function calculateEmergency(data) {
    return request({
        url: '/emergency/calculate',
        method: 'post',
        data: data
    })
}

// ========== 应急金计算 ==========
// 应急金计算（基于 emergencyFund: '/demo/api/expense/calculateEmergencyFund' 转化）
export function calculateEmergencyFund(data) {
    return request({
        url: '/expense/calculateEmergencyFund',
        method: 'post',
        data: data
    })
}
