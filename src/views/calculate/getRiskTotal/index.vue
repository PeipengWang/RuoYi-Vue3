<template>
  <div class="expense-calculator-section" v-show="visible">
    <el-card shadow="hover" header="必要支出 & 应急金计算器" class="calc-card">
      <el-form
          :model="form"
          :rules="formRules"
          ref="formRef"
          label-width="120px"
          size="default"
          class="expense-form"
      >
        <!-- 应急金倍数设置 -->
        <el-form-item label="应急金倍数(N)" prop="emergencyMultiple">
          <el-input
              v-model.number="form.emergencyMultiple"
              type="number"
              min="3"
              max="24"
              placeholder="建议3-12（即预留3-12个月必要支出）"
              clearable
          />
          <div class="form-tip">提示：应急金建议为3-12个月的月度必要支出总额</div>
        </el-form-item>

        <!-- 月度必要支出 -->
        <el-form-item label="月度必要支出" prop="monthlyExpenses">
          <el-table
              :data="monthlyExpenseList"
              border
              style="width: 100%;"
              :show-header="false"
          >
            <el-table-column width="180">
              <template #default="scope">
                {{ scope.row.name }}
              </template>
            </el-table-column>
            <el-table-column>
              <template #default="scope">
                <el-input
                    v-model.number="scope.row.amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    size="small"
                    style="width: 200px;"
                />
                <span class="unit">元/月</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="total-item">
            月度必要支出总计：{{ calculateMonthlyTotal() }} 元
          </div>
        </el-form-item>

        <!-- 年度必要支出 -->
        <el-form-item label="年度必要支出" prop="annualExpenses">
          <el-table
              :data="annualExpenseList"
              border
              style="width: 100%;"
              :show-header="false"
          >
            <el-table-column width="180">
              <template #default="scope">
                {{ scope.row.name }}
              </template>
            </el-table-column>
            <el-table-column>
              <template #default="scope">
                <el-input
                    v-model.number="scope.row.amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    size="small"
                    style="width: 200px;"
                />
                <span class="unit">元/年</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="total-item">
            年度必要支出总计：{{ calculateAnnualTotal() }} 元
          </div>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button
              type="primary"
              @click="calculateEmergency"
              icon="el-icon-calculator"
          >
            计算应急金
          </el-button>
          <el-button
              type="default"
              @click="resetForm"
              icon="el-icon-refresh"
              style="margin-left: 8px;"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 应急金计算结果 -->
      <div v-if="emergencyResult" class="emergency-result">
        <el-divider content-position="left">应急金计算结果</el-divider>
        <el-card shadow="hover" class="result-card">
          <div class="result-summary">
            <div class="result-item">
              <span class="label">月度必要支出总计：</span>
              <span class="value">{{ calculateMonthlyTotal() }} 元</span>
            </div>
            <div class="result-item">
              <span class="label">年度必要支出总计：</span>
              <span class="value">{{ calculateAnnualTotal() }} 元</span>
            </div>
            <div class="result-item">
              <span class="label">应急金倍数(N)：</span>
              <span class="value">{{ form.emergencyMultiple }} 个月</span>
            </div>
            <div class="result-item emergency-fund">
              <span class="label">建议应急金总额：</span>
              <span class="value">{{ emergencyResult }} 元</span>
            </div>
            <div class="result-tip">
              计算公式：应急金 = 月度必要支出 × {{ form.emergencyMultiple }} + 年度必要支出
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { calculateEmergencyFund } from "@/api/calculate/getRepayments/api.js";

// 定义Props：控制组件显隐
const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  }
})

// 定义Emits
const emit = defineEmits(['reset'])

// 表单Ref
const formRef = ref()

// 表单数据
const form = reactive({
  emergencyMultiple: 6, // 默认应急金倍数：6个月
})

// 月度支出列表（固定项）
const monthlyExpenseList = ref([
  { name: '房贷/房租', amount: 0 },
  { name: '水电燃气', amount: 0 },
  { name: '通讯', amount: 0 },
  { name: '基础饮食', amount: 0 },
  { name: '社保/医保', amount: 0 },
  { name: '孩子基础教育', amount: 0 },
  { name: '必要交通', amount: 0 },
])

// 年度支出列表（固定项）
const annualExpenseList = ref([
  { name: '老人养老金', amount: 0 },
  { name: '节日礼金', amount: 0 },
  { name: '人情往来', amount: 0 },
  { name: '其他', amount: 0 },
])

// 应急金计算结果
const emergencyResult = ref(null)

// 表单校验规则
const formRules = reactive({
  emergencyMultiple: [
    { required: true, message: '请输入应急金倍数', trigger: 'blur' },
    { type: 'number', min: 1, max: 24, message: '倍数需在3-24个月之间', trigger: 'blur' }
  ]
})

// 计算月度支出总计
const calculateMonthlyTotal = () => {
  const total = monthlyExpenseList.value.reduce((sum, item) => sum + (item.amount || 0), 0)
  return total.toFixed(2)
}

// 计算年度支出总计
const calculateAnnualTotal = () => {
  const total = annualExpenseList.value.reduce((sum, item) => sum + (item.amount || 0), 0)
  return total.toFixed(2)
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  // 重置支出金额
  monthlyExpenseList.value.forEach(item => item.amount = 0)
  annualExpenseList.value.forEach(item => item.amount = 0)
  emergencyResult.value = null
  emit('reset')
  ElMessage.success('表单已重置')
}

// 计算应急金（调用后端接口）
const calculateEmergency = async () => {
  // 表单校验
  try {
    await formRef.value.validate()
  } catch (error) {
    ElMessage.error('请完善表单必填项')
    return
  }

  // 构造请求数据
  const requestData = {
    emergencyMultiple: form.emergencyMultiple,
    monthlyExpenses: monthlyExpenseList.value,
    annualExpenses: annualExpenseList.value
  }

  // 调用后端接口
  try {
    const response = await calculateEmergencyFund(requestData)
    debugger;
    emergencyResult.value = response.emergencyFund.toFixed(2)
    ElMessage.success('应急金计算成功')
  } catch (error) {
    ElMessage.error('应急金计算失败：' + (error.response?.data?.message || error.message))
    console.error('计算应急金失败：', error)
  }
}
</script>

<style scoped>
.expense-calculator-section {
  margin-top: 20px;
  padding: 0 10px;
}

.expense-form {
  margin-bottom: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.total-item {
  margin-top: 8px;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.unit {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.form-actions {
  margin-top: 16px;
}

.emergency-result {
  margin-top: 20px;
}

.result-card {
  padding: 16px;
}

.result-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}

.result-item .label {
  color: #606266;
}

.result-item .value {
  color: #303133;
  font-weight: 500;
}

.result-item.emergency-fund {
  font-size: 16px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.result-item.emergency-fund .value {
  color: #e6a23c;
  font-size: 18px;
  font-weight: bold;
}

.result-tip {
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .el-table {
    width: 100% !important;
  }

  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 0 !important;
  }

  .result-item {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
