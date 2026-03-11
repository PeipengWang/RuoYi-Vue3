<template>
  <div class="emergency-ability-container">
    <el-card shadow="hover" style="margin-bottom: 20px;">
      <template #header>
        <div class="card-header">
          <span style="font-weight: 600; font-size: 16px;">应急能力计算</span>
        </div>
      </template>

      <!-- 应急能力计算表单 -->
      <el-form
          ref="abilityFormRef"
          :model="formData"
          :rules="formRules"
          label-width="180px"
          size="default"
      >
        <el-row :gutter="20">
          <!-- 核心应急金参数 -->
          <el-col :span="12">
            <el-form-item label="应急金倍数N（月）" prop="multipleN">
              <el-select v-model.number="formData.multipleN" style="width: 100%;">
                <el-option label="3个月（基础）" value="3" />
                <el-option label="6个月（标准）" value="6" />
                <el-option label="12个月（高）" value="12" />
                <el-option label="自定义" value="0" />
              </el-select>
              <el-input
                  v-if="formData.multipleN === 0"
                  v-model.number="formData.customMultipleN"
                  type="number"
                  placeholder="输入自定义倍数"
                  step="1"
                  min="1"
                  style="width: 100%; margin-top: 8px;"
              />
            </el-form-item>

            <el-form-item label="每月必要支出（元）" prop="monthlyNecessaryExpense">
              <el-input
                  v-model.number="formData.monthlyNecessaryExpense"
                  type="number"
                  placeholder="如房租、伙食、水电等固定支出"
                  step="0.01"
                  min="0"
                  style="width: 100%;"
              />
            </el-form-item>

            <el-form-item label="年度支出（元）" prop="annualExpense">
              <el-input
                  v-model.number="formData.annualExpense"
                  type="number"
                  placeholder="如物业费、保险、学费等年度支出"
                  step="0.01"
                  min="0"
                  style="width: 100%;"
              />
            </el-form-item>

            <el-form-item label="单月应急金额度（元）" prop="monthlyEmergencyQuota">
              <el-input
                  v-model.number="formData.monthlyEmergencyQuota"
                  type="number"
                  placeholder="请输入单月应急金额度"
                  step="0.01"
                  min="0"
                  style="width: 100%;"
              />
            </el-form-item>
          </el-col>

          <!-- 财务状况参数 -->
          <el-col :span="12">
            <el-form-item label="当前可用存款（元）" prop="currentDeposit">
              <el-input
                  v-model.number="formData.currentDeposit"
                  type="number"
                  placeholder="请输入可随时支取的存款"
                  step="1"
                  min="0"
                  style="width: 100%;"
              />
            </el-form-item>

            <el-form-item label="存款年利率（%）" prop="depositInterestRate">
              <el-input
                  v-model.number="formData.depositInterestRate"
                  type="number"
                  placeholder="如1.5代表年利率1.5%"
                  step="0.01"
                  min="0"
                  style="width: 100%;"
              />
            </el-form-item>

            <el-form-item label="每月固定收入（元）" prop="monthlyIncome">
              <el-input
                  v-model.number="formData.monthlyIncome"
                  type="number"
                  placeholder="请输入每月固定收入（工资等）"
                  step="1"
                  min="0"
                  style="width: 100%;"
              />
            </el-form-item>

            <el-form-item label="其他收入（元）" prop="otherIncome">
              <el-input
                  v-model.number="formData.otherIncome"
                  type="number"
                  placeholder="如副业、理财收益等（无则填0）"
                  step="0.01"
                  min="0"
                  style="width: 100%;"
              />
            </el-form-item>
          </el-col>

          <!-- 贷款相关参数 -->
          <el-col :span="24">
            <el-divider content-position="left">贷款相关参数</el-divider>
          </el-col>
          <el-col :span="12">
            <el-form-item label="剩余贷款额度（元）" prop="remainingLoan">
              <el-input
                  v-model.number="formData.remainingLoan"
                  type="number"
                  placeholder="无贷款请填0"
                  step="1"
                  min="0"
                  style="width: 100%;"
              />
            </el-form-item>

            <el-form-item label="LPR年利率（%）" prop="lprRate">
              <el-input
                  v-model.number="formData.lprRate"
                  type="number"
                  placeholder="无贷款请填0"
                  step="0.01"
                  min="0"
                  style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="剩余还款年限" prop="repayYears">
              <el-input
                  v-model.number="formData.repayYears"
                  type="number"
                  placeholder="无贷款请填0"
                  step="1"
                  min="0"
                  style="width: 100%;"
              />
            </el-form-item>

            <el-form-item label="还款方式" prop="repayMethod">
              <el-select v-model="formData.repayMethod" style="width: 100%;">
                <el-option label="无贷款" value="none" />
                <el-option label="等额本金" value="等额本金" />
                <el-option label="等额本息" value="等额本息" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 统计配置 -->
          <el-col :span="24">
            <el-divider content-position="left">统计配置</el-divider>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统计起始时间" prop="startDate">
              <el-date-picker
                  v-model="formData.startDate"
                  type="month"
                  placeholder="选择统计起始月份"
                  format="YYYY-MM"
                  value-format="YYYY-MM-dd"
                  style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统计时长（月）" prop="statMonths">
              <el-input
                  v-model.number="formData.statMonths"
                  type="number"
                  placeholder="如12代表统计1年"
                  step="1"
                  min="1"
                  max="60"
                  style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-row style="margin-top: 30px; text-align: center;">
          <el-col :span="24">
            <el-button type="primary" @click="handleCalculate" :loading="loading" size="default">
              计算应急能力
            </el-button>
            <el-button type="default" @click="handleReset" style="margin-left: 20px;">
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 计算结果展示 -->
    <el-card shadow="hover" v-if="showResult">
      <template #header>
        <div class="card-header">
          <span style="font-weight: 600; font-size: 16px;">应急能力计算结果</span>
        </div>
      </template>

      <!-- 年度核心指标 -->
      <div style="margin-bottom: 20px;">
        <h4 style="color: #1989fa; margin: 10px 0;">年度核心指标</h4>
        <el-table :data="annualResultList" border size="default" style="width: 100%;">
          <el-table-column
              label="指标名称"
              prop="name"
              align="center"
              width="200"
          />
          <el-table-column
              label="数值"
              prop="value"
              align="center"
              :formatter="formatValue"
          />
          <el-table-column
              label="说明"
              prop="desc"
              align="center"
          />
        </el-table>
      </div>

      <!-- 月度明细 -->
      <div>
        <h4 style="color: #1989fa; margin: 10px 0;">月度应急能力明细</h4>
        <el-table
            :data="monthlyDetails"
            border
            size="small"
            max-height="400"
            style="width: 100%;"
        >
          <el-table-column label="统计月份" prop="statMonth" align="center" />
          <el-table-column label="每月收入（元）" prop="monthlyIncome" align="center"  />
          <el-table-column label="每月支出（元）" prop="monthlyExpense" align="center"  />
          <el-table-column label="月度收支余额（元）" prop="monthlyBalance" align="center"  />
          <el-table-column label="应急覆盖月数" prop="emergencyCoverageMonths" align="center" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
// 导入配置，复用原有请求配置
import { calculateEmergency } from '@/api/calculate/getRepayments/api.js'

// 表单引用
const abilityFormRef = ref(null)
// 加载状态
const loading = ref(false)
// 是否显示结果
const showResult = ref(false)
// 年度结果列表
const annualResultList = ref([])
// 月度明细
const monthlyDetails = ref([])

// 表单数据
const formData = reactive({
  // 核心应急金参数
  multipleN: 6, // 应急金倍数N（默认6）
  customMultipleN: '', // 自定义倍数
  monthlyNecessaryExpense: '', // 每月必要支出
  annualExpense: '', // 年度支出
  monthlyEmergencyQuota: '', // 单月应急金额度

  // 财务状况参数
  currentDeposit: '', // 当前存款
  depositInterestRate: 0, // 存款年利率（默认0）
  monthlyIncome: '', // 每月固定收入
  otherIncome: 0, // 其他收入（默认0）

  // 贷款相关参数
  remainingLoan: 0, // 剩余贷款
  lprRate: 3.85, // LPR年利率
  repayYears: 0, // 剩余还款年限
  repayMethod: 'none', // 还款方式（默认无贷款）

  // 统计配置
  startDate: new Date().toISOString().split('T')[0], // 统计起始时间
  statMonths: 12 // 统计时长
})

// 监听倍数选择，清空自定义值
watch(() => formData.multipleN, (val) => {
  if (val !== 0) formData.customMultipleN = ''
})

// 表单校验规则
const formRules = reactive({
  // 核心应急金参数校验
  multipleN: [
    { required: true, message: '请选择应急金倍数', trigger: 'change' },
    { type: 'number', min: 0, message: '倍数不能为负数', trigger: 'change' }
  ],
  customMultipleN: [
    { required: true, message: '请输入自定义倍数', trigger: 'blur', validator: (rule, value) => {
        return formData.multipleN !== 0 || (value && value >= 1)
      }}
  ],
  monthlyNecessaryExpense: [
    { required: true, message: '请输入每月必要支出', trigger: 'blur' },
    { type: 'number', min: 0, message: '每月必要支出不能为负数', trigger: 'blur' }
  ],
  annualExpense: [
    { required: true, message: '请输入年度支出', trigger: 'blur' },
    { type: 'number', min: 0, message: '年度支出不能为负数', trigger: 'blur' }
  ],
  monthlyEmergencyQuota: [
    { required: true, message: '请输入单月应急金额度', trigger: 'blur' },
    { type: 'number', min: 0, message: '单月应急金额度不能为负数', trigger: 'blur' }
  ],

  // 财务状况参数校验
  currentDeposit: [
    { required: true, message: '请输入当前可用存款', trigger: 'blur' },
    { type: 'number', min: 0, message: '存款不能为负数', trigger: 'blur' }
  ],
  monthlyIncome: [
    { required: true, message: '请输入每月固定收入', trigger: 'blur' },
    { type: 'number', min: 0, message: '收入不能为负数', trigger: 'blur' }
  ],

  // 统计配置校验
  startDate: [
    { required: true, message: '请选择统计起始时间', trigger: 'change' }
  ],
  statMonths: [
    { required: true, message: '请输入统计时长', trigger: 'blur' },
    { type: 'number', min: 1, max: 60, message: '统计时长需在1-60个月之间', trigger: 'blur' }
  ]
})

// 复用原有原生AJAX请求方法
const requestPost = (url, data, success, error) => {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', url, true)
  xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8')
  xhr.timeout = 2000;

  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const res = JSON.parse(xhr.responseText)
        success(res)
      } catch (e) {
        error('返回数据格式错误：' + e.message)
      }
    } else {
      error(`请求失败：${xhr.status} ${xhr.statusText}`)
    }
  }

  xhr.onerror = () => error('网络请求异常，请检查后端服务是否启动')
  xhr.ontimeout = () => error('请求超时，请重试')
  xhr.send(JSON.stringify(data))
}

// 格式化数值（通用，保留2位小数）
const formatValue = (row) => {
  // 适配表格列和年度指标两种场景
  const value = row.value !== undefined ? row.value : row[Object.keys(row)[0]]
  return value ? Number(value).toFixed(2) : '0.00'
}
// 重置表单
const handleReset = () => {
  abilityFormRef.value.resetFields()
  showResult.value = false
  annualResultList.value = []
  monthlyDetails.value = []
  // 重置默认值
  formData.multipleN = 6
  formData.customMultipleN = ''
  formData.depositInterestRate = 0
  formData.otherIncome = 0
  formData.remainingLoan = 0
  formData.lprRate = 3.85
  formData.repayYears = 0
  formData.repayMethod = 'none'
  formData.startDate = new Date().toISOString().split('T')[0]
  formData.statMonths = 12
}

// 提交计算
const handleCalculate = () => {
  // 手动校验自定义倍数
  if (formData.multipleN === 0 && !formData.customMultipleN) {
    ElMessage.warning('请输入自定义应急金倍数！')
    return
  }

  // 表单校验
  abilityFormRef.value.validate((valid) => {
    if (!valid) {
      ElMessage.warning('请完善必填参数！')
      return
    }

    loading.value = true
    // 组装请求参数（严格匹配后端EmergencyFundRequest）
    const params = {
      monthlyEmergencyQuota: formData.monthlyEmergencyQuota,
      multipleN: formData.multipleN === 0 ? formData.customMultipleN : formData.multipleN,
      monthlyNecessaryExpense: formData.monthlyNecessaryExpense,
      annualExpense: formData.annualExpense,
      currentDeposit: formData.currentDeposit,
      depositInterestRate: formData.depositInterestRate,
      remainingLoan: formData.remainingLoan,
      lprRate: formData.lprRate,
      repayMethod: formData.repayMethod === 'none' ? '' : formData.repayMethod,
      repayYears: formData.repayYears,
      monthlyIncome: formData.monthlyIncome,
      otherIncome: formData.otherIncome,
      startDate: formData.startDate,
      statMonths: formData.statMonths
    }
    // 发送请求
    loading.value = true // 先开启加载状态
    try {
      // 使用新的请求方式发送请求
      const res = calculateEmergency(params);
      // 校验响应数据完整性
      if (!res || !res.annualStat || !Array.isArray(res.monthlyStatList)) {
        ElMessage.error('后端返回数据格式异常，缺少核心字段！')
        loading.value = false
        return
      }
      // ========== 核心修复：适配后端返回的响应结构 ==========
      // 1. 组装年度指标列表（匹配后端annualStat字段）
      annualResultList.value = [
        {
          name: '年度平均应急能力（月）',
          value: res.annualStat.annualAvgEmergencyAbility,
          desc: '统计周期内平均应急覆盖月数'
        },
        {
          name: '年度剩余资金（元）',
          value: res.annualStat.annualRemainingFund,
          desc: '统计周期内累计剩余资金总额'
        },
        {
          name: '单月应急金额度（元）',
          value: res.annualStat.monthlyEmergencyQuota,
          desc: '每月所需的应急资金额度'
        },
        {
          name: '基础应急金额度（元）',
          value: res.annualStat.baseEmergencyQuota,
          desc: '核心应急资金基准额度'
        }
      ]
      // 2. 赋值月度明细（匹配后端monthlyStatList字段）
      monthlyDetails.value = res.monthlyStatList

      // 显示结果
      showResult.value = true
      loading.value = false
      ElMessage.success('应急能力计算成功！')
    } catch (err) {
      // 捕获请求异常
      loading.value = false
      const errMsg = err.message || '应急能力计算请求失败'
      ElMessage.error(errMsg)
      console.error('应急能力计算失败：', errMsg)
    }
  })
}
</script>

<style scoped>
.emergency-ability-container {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-table-header th) {
  background-color: #f5f7fa;
  color: #1989fa;
  font-weight: 600;
}

/* 适配自定义倍数输入框 */
:deep(.el-select) {
  margin-bottom: 8px;
}
</style>
