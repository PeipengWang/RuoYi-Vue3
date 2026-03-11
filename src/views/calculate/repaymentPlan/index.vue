<template>
  <div class="app-container">

    <!-- 1. 房贷还款计算模块 -->
    <div v-if="mainTab === 'repay-calc'">
      <!-- 计算类型选择 -->
      <div class="calc-type-selector mb-4">
        <span class="me-2 fw-medium">计算类型：</span>
        <el-select
            v-model="calcType"
            style="width: 200px;"
            @change="handleCalcTypeChange">
          <el-option label="普通计算" value="normal" />
          <el-option label="提前还款计算" value="prepayment" />
        </el-select>
      </div>
      <!-- 还款方式 Tab -->
      <el-tabs
          v-model="activeTab"
          type="card"
          class="mb-5"
          @tab-change="handleTabChange"
      >
        <el-tab-pane label="等额本金" name="equal-principal">
          <CalculatorForm
              @calculate="handleCalculate"
              @reset="handleReset"
              :visible-prepayment="showPrepaymentForm"
          />
        </el-tab-pane>
        <el-tab-pane label="等额本息" name="equal-interest">
          <CalculatorForm
              @calculate="handleCalculate"
              @reset="handleReset"
              :visible-prepayment="showPrepaymentForm"
          />
        </el-tab-pane>
      </el-tabs>

      <!-- 计算结果展示 -->
      <CalculatorResult
          :summary="summary"
          :monthlyDetails="monthlyDetails"
          :yearlySummaries="yearlySummaries"
          :loading="loading"
          :showResult="showResult"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
// 导入RuoYi内置的request工具
import request from '@/utils/request'
// 组件导入
import CalculatorForm from '@/components/calculate/CalculatorForm.vue'
import CalculatorResult from '@/components/calculate/CalculatorResult.vue'
import {getEqualPrincipal, getEqualInterest} from '@/api/calculate/getRepayments/api.js'

// ========== 核心变量定义 ==========
const mainTab = ref('repay-calc')
const calcType = ref('normal')
const activeTab = ref('equal-principal')
const showPrepaymentForm = computed(() => calcType.value === 'prepayment')

// 计算结果存储
const summary = reactive({
  loanTotal: '-',
  years: '-',
  totalMonths: '-',
  totalAllPrincipal: '-',
  totalAllInterest: '-',
  totalAllRepay: '-'
})
const monthlyDetails = ref([])
const yearlySummaries = ref([])
const loading = ref(false)
const showResult = ref(false)

// ========== 事件处理函数 ==========
const handleMainTabChange = (tabName) => {
  if (tabName === 'repay-calc') {
    handleReset()
  }
}

const handleCalcTypeChange = () => {
  handleReset()
}

const handleTabChange = () => {
  handleReset()
}

const handleReset = () => {
  showResult.value = false
  Object.assign(summary, {
    loanTotal: '-',
    years: '-',
    totalMonths: '-',
    totalAllPrincipal: '-',
    totalAllInterest: '-',
    totalAllRepay: '-'
  })
  monthlyDetails.value = []
  yearlySummaries.value = []
}

/**
 * 处理计算请求（修复参数校验逻辑）
 * @param {Object} params 从表单传递的完整参数
 */
const handleCalculate = async (params) => {
  // 1. 空参数校验
  if (!params) {
    ElMessage.warning('请填写完整的贷款信息！')
    return
  }

  // 2. 根据贷款类型（纯商贷/纯公积金/组合贷）校验核心参数
  let hasValidLoan = false
  let totalLoan = 0
  let loanYears = 0

  // 纯商贷校验
  if (params.loanType === 'single') {
    if (!params.businessLoanTotal || !params.businessYears) {
      ElMessage.warning('请填写完整的商贷信息（总额+年限）！')
      return
    }
    totalLoan = params.businessLoanTotal
    loanYears = params.businessYears
    hasValidLoan = true
  }
  // 纯公积金贷校验
  else if (params.loanType === 'fund') {
    if (!params.fundLoanTotal || !params.fundYears) {
      ElMessage.warning('请填写完整的公积金贷信息（总额+年限）！')
      return
    }
    totalLoan = params.fundLoanTotal
    loanYears = params.fundYears
    hasValidLoan = true
  }
  // 组合贷校验
  else if (params.loanType === 'combination') {
    if (!params.businessLoanTotal || !params.businessYears || !params.fundLoanTotal || !params.fundYears) {
      ElMessage.warning('请填写完整的组合贷信息（商贷+公积金贷的总额+年限）！')
      return
    }
    totalLoan = params.businessLoanTotal + params.fundLoanTotal
    // 组合贷取商贷年限（也可根据业务逻辑调整为取最大值/最小值）
    loanYears = params.businessYears
    hasValidLoan = true
  }

  // 3. 最终校验兜底
  if (!hasValidLoan || totalLoan <= 0 || loanYears <= 0) {
    ElMessage.warning('请填写有效的贷款金额和年限（金额>0，年限>0）！')
    return
  }

  loading.value = true
  try {
    // 根据还款方式调用对应API
    let res = null
    if (activeTab.value === 'equal-principal') {
      res = await getEqualPrincipal(params)
    } else {
      res = await getEqualInterest(params)
    }
    debugger;
    // 接口返回处理
    if (res) {
      loading.value = false
      Object.assign(summary, res)
      monthlyDetails.value = res.monthlyDetails || []
      yearlySummaries.value = res.fundYearSummaries || []
      showResult.value = true
      ElMessage.success('计算成功！')
    } else {
      loading.value = false
      console.error('计算失败：', errMsg)
    }
  } catch (error) {
    console.error('房贷计算请求失败：', error)
    ElMessage.error('计算请求失败，请检查网络或联系管理员！')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('房贷计算页面初始化完成')
})
</script>

<style scoped>
/* 适配RuoYi默认的app-container样式 */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 计算类型选择器样式 */
.calc-type-selector {
  display: flex;
  align-items: center;
}

/* 样式优化：使用RuoYi的margin类名，统一风格 */
.mb-4 {
  margin-bottom: 16px !important;
}

.mb-5 {
  margin-bottom: 20px !important;
}

.me-2 {
  margin-right: 8px !important;
}

.fw-medium {
  font-weight: 500 !important;
}

/* Tab样式优化（适配RuoYi后台风格） */
:deep(.el-tabs--card) {
  --el-tabs-card-border-color: var(--el-border-color-lighter);
}

:deep(.el-tabs--card .el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs--card .el-tabs__item) {
  padding: 0 20px;
  margin-right: 8px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  :deep(.el-tabs--card .el-tabs__nav) {
    flex-wrap: wrap;
  }

  :deep(.el-tabs--card .el-tabs__item) {
    margin-bottom: 8px;
    flex: 1 1 auto;
    text-align: center;
  }

  .app-container {
    padding: 10px;
  }
}
</style>
