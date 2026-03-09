<template>
  <el-card shadow="hover" header="房贷还款计算器" class="calc-card">
    <!-- 表单容器：绑定校验规则 + 统一尺寸 -->
    <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        size="default"
    >
      <!-- 贷款类型选择 -->
      <el-form-item label="贷款类型" prop="loanType">
        <el-radio-group v-model="form.loanType">
          <el-radio label="combination">组合贷（商贷+公积金）</el-radio>
          <el-radio label="single">纯商贷</el-radio>
          <el-radio label="fund">纯公积金贷</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 商业贷款参数：修复v-model绑定 -->
      <el-collapse v-model="activeBusinessPanel" :disabled="form.loanType === 'fund'">
        <el-collapse-item title="商业贷款参数" name="business">
          <el-form-item label="商贷总额（元）" prop="businessLoanTotal" >
            <el-input
                v-model.number="form.businessLoanTotal"
                type="number"
                step="0.01"
                placeholder="请输入商贷总额，如 1000000"
                clearable
            />
          </el-form-item>
          <el-form-item label="商贷年利率（%）" prop="businessAnnualRate">
            <el-input
                v-model.number="form.businessAnnualRate"
                type="number"
                step="0.01"
                placeholder="请输入商贷年利率，如 4.9"
                clearable
            />
          </el-form-item>
          <el-form-item label="商贷还款年限" prop="businessYears">
            <el-input
                v-model.number="form.businessYears"
                type="number"
                min="1"
                placeholder="请输入商贷还款年限，如 30"
                clearable
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 公积金贷款参数：修复v-model绑定 -->
      <el-collapse v-model="activeFundPanel" :disabled="form.loanType === 'single'">
        <el-collapse-item title="公积金贷款参数" name="fund">
          <el-form-item label="公积金贷总额（元）" prop="fundLoanTotal">
            <el-input
                v-model.number="form.fundLoanTotal"
                type="number"
                step="0.01"
                placeholder="请输入公积金贷总额，如 500000"
                clearable
            />
          </el-form-item>
          <el-form-item label="公积金贷年利率（%）" prop="fundAnnualRate">
            <el-input
                v-model.number="form.fundAnnualRate"
                type="number"
                step="0.01"
                placeholder="请输入公积金贷年利率，如 3.1"
                clearable
            />
          </el-form-item>
          <el-form-item label="公积金贷还款年限" prop="fundYears">
            <el-input
                v-model.number="form.fundYears"
                type="number"
                min="1"
                placeholder="请输入公积金贷还款年限，如 30"
                clearable
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 公共参数：保留本金 -->
      <el-form-item label="保留本金（元）" prop="reservedPrincipal">
        <el-input
            v-model.number="form.reservedPrincipal"
            type="number"
            step="0.01"
            min="0"
            placeholder="请输入保留不还的本金金额，如 10000（填 0 则不保留）"
            clearable
        />
      </el-form-item>

      <!-- 提前还款子组件 -->
      <PrepaymentSection
          v-if="visiblePrepayment"
          v-model:prepayments="form.prepayments"
          v-model:periodicRepayList="form.periodicRepayList"
          @reset="handlePrepaymentReset"
          ref="prepaymentSectionRef"
      />

      <!-- 操作按钮区域 -->
      <el-form-item class="form-actions">
        <el-button type="primary" @click="handleCalculate">
          计算还款明细
        </el-button>
        <el-button @click="handleReset">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref, defineEmits, defineProps, watch } from 'vue'
import { ElMessage } from 'element-plus'
// 请确保 PrepaymentSection 组件路径正确
import PrepaymentSection from './PrepaymentSection.vue'

// 新增：折叠面板激活状态（修复v-model语法错误）
const activeBusinessPanel = ref(['business'])
const activeFundPanel = ref(['fund'])

// Props 定义
const props = defineProps({
  visiblePrepayment: {
    type: Boolean,
    default: true
  }
})

// 事件定义
const emit = defineEmits(['calculate', 'reset'])

// 表单 Ref + 校验规则
const formRef = ref()
const prepaymentSectionRef = ref()

// 表单校验规则
const formRules = reactive({
  loanType: [
    { required: true, message: '请选择贷款类型', trigger: 'change' }
  ],
  // 商贷校验规则（动态校验）
  businessLoanTotal: [
    {
      required: true,
      message: '请输入商贷总额',
      trigger: 'blur',
      validator: (rule, value) => {
        return form.loanType !== 'single' && form.loanType !== 'combination' || (value && value > 0)
      }
    },
    { type: 'number', min: 0.01, message: '商贷总额必须大于 0', trigger: 'blur' }
  ],
  businessAnnualRate: [
    {
      required: true,
      message: '请输入商贷年利率',
      trigger: 'blur',
      validator: (rule, value) => {
        return form.loanType !== 'single' && form.loanType !== 'combination' || (value && value > 0)
      }
    },
    { type: 'number', min: 0.01, message: '商贷年利率必须大于 0', trigger: 'blur' }
  ],
  businessYears: [
    {
      required: true,
      message: '请输入商贷还款年限',
      trigger: 'blur',
      validator: (rule, value) => {
        return form.loanType !== 'single' && form.loanType !== 'combination' || (value && value >= 1)
      }
    },
    { type: 'number', min: 1, message: '商贷还款年限必须大于等于 1', trigger: 'blur' }
  ],
  // 公积金贷校验规则（动态校验）
  fundLoanTotal: [
    {
      required: true,
      message: '请输入公积金贷总额',
      trigger: 'blur',
      validator: (rule, value) => {
        return form.loanType !== 'fund' && form.loanType !== 'combination' || (value && value > 0)
      }
    },
    { type: 'number', min: 0.01, message: '公积金贷总额必须大于 0', trigger: 'blur' }
  ],
  fundAnnualRate: [
    {
      required: true,
      message: '请输入公积金贷年利率',
      trigger: 'blur',
      validator: (rule, value) => {
        return form.loanType !== 'fund' && form.loanType !== 'combination' || (value && value > 0)
      }
    },
    { type: 'number', min: 0.01, message: '公积金贷年利率必须大于 0', trigger: 'blur' }
  ],
  fundYears: [
    {
      required: true,
      message: '请输入公积金贷还款年限',
      trigger: 'blur',
      validator: (rule, value) => {
        return form.loanType !== 'fund' && form.loanType !== 'combination' || (value && value >= 1)
      }
    },
    { type: 'number', min: 1, message: '公积金贷还款年限必须大于等于 1', trigger: 'blur' }
  ],
  reservedPrincipal: [
    { type: 'number', min: 0, message: '保留本金必须大于等于 0', trigger: 'blur' }
  ]
})

// 表单数据
const form = reactive({
  loanType: 'combination', // 贷款类型：single(纯商贷)、fund(纯公积金)、combination(组合贷)
  // 商贷参数
  businessLoanTotal: '',
  businessAnnualRate: '',
  businessYears: '',
  // 公积金贷参数
  fundLoanTotal: '',
  fundAnnualRate: '',
  fundYears: '',
  // 公共参数
  reservedPrincipal: 0,
  prepayments: [],
  periodicRepayList: []
})

// 监听贷款类型变化：自动切换面板状态 + 清空无关参数
watch(() => form.loanType, (newType) => {
  if (newType === 'single') {
    // 纯商贷：展开商贷面板，收起公积金面板
    activeBusinessPanel.value = ['business']
    activeFundPanel.value = []
    // 清空公积金参数
    form.fundLoanTotal = ''
    form.fundAnnualRate = ''
    form.fundYears = ''
  } else if (newType === 'fund') {
    // 纯公积金：展开公积金面板，收起商贷面板
    activeFundPanel.value = ['fund']
    activeBusinessPanel.value = []
    // 清空商贷参数
    form.businessLoanTotal = ''
    form.businessAnnualRate = ''
    form.businessYears = ''
  } else if (newType === 'combination') {
    // 组合贷：展开两个面板
    activeBusinessPanel.value = ['business']
    activeFundPanel.value = ['fund']
  }
})

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }

  // 重置提前还款子组件
  prepaymentSectionRef.value?.resetPrepayment()

  // 重置面板状态
  activeBusinessPanel.value = ['business']
  activeFundPanel.value = ['fund']

  // 重置默认值
  form.loanType = 'single'
  form.reservedPrincipal = 0
  form.prepayments = []
  form.periodicRepayList = []

  emit('reset')
  ElMessage.success('表单已重置')
}

// 提前还款子组件重置回调
const handlePrepaymentReset = () => {
  form.prepayments = []
  form.periodicRepayList = []
}

// 计算逻辑
const handleCalculate = async () => {
  // 表单校验
  try {
    await formRef.value.validate()
  } catch (error) {
    ElMessage.error('表单校验失败，请检查输入内容')
    return
  }

  // 组装请求参数
  const params = {
    loanType: form.loanType,
    // 商贷参数
    businessLoanTotal: Number(form.businessLoanTotal) || 0,
    businessAnnualRate: Number(form.businessAnnualRate) || 0,
    businessYears: Number(form.businessYears) || 0,
    // 公积金贷参数
    fundLoanTotal: Number(form.fundLoanTotal) || 0,
    fundAnnualRate: Number(form.fundAnnualRate) || 0,
    fundYears: Number(form.fundYears) || 0,
    // 公共参数
    reservedPrincipal: Number(form.reservedPrincipal),
    prepayments: form.prepayments
        .filter(item => item.month && item.amount)
        .map(item => ({
          month: Number(item.month),
          amount: Number(item.amount),
          year: 0
        })),
    periodicRepayList: form.periodicRepayList
  }

  // 保留本金校验（组合贷时校验总额）
  const totalLoan = params.businessLoanTotal + params.fundLoanTotal
  if (params.reservedPrincipal >= totalLoan && totalLoan > 0) {
    ElMessage.error(`保留本金需小于贷款总额（${totalLoan} 元）`)
    return
  }

  // 通知父组件计算（父组件需调用后端 /api/repay/combination-principal 接口）
  emit('calculate', params)
  ElMessage.info('正在计算，请稍候...')
}
</script>

<style scoped>
/* 核心容器：基础样式 + 响应式最大宽度 */
.calc-card {
  max-width: 1000px;
  min-width: 320px;
  margin: 0 auto;
  padding: 0 16px;
  margin-top: 20px;
  margin-bottom: 40px;
}

/* Element Plus 卡片内边距：响应式调整 */
:deep(.el-card__body) {
  padding: 10px;
  /* 小屏（手机）时减小内边距，节省空间 */
  @media (max-width: 768px) {
    padding: 16px;
  }
}

/* 表单项间距：响应式调整 */
:deep(.el-form-item) {
  margin-bottom: 40px;

  /* 小屏时减小间距，节省垂直空间 */
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
}

/* 折叠面板样式优化 */
:deep(.el-collapse-item__header) {
  font-weight: 500;
  padding: 12px 16px;
  background-color: #f8f9fa;
}

:deep(.el-collapse-item__content) {
  padding: 16px;
  border-top: 1px solid #ebeef5;
}


/* 按钮区域：核心响应式布局 */
.form-actions {
  display: flex;
  justify-content: flex-start;
  padding-left: 120px;
  margin-top: 8px;
  gap: 12px;

  /* 断点1：平板/小屏电脑（≤992px） */
  @media (max-width: 992px) {
    padding-left: 80px;
  }

  /* 断点2：手机（≤768px）- 核心适配 */
  @media (max-width: 768px) {
    /* 按钮从横向排列改为纵向排列 */
    flex-direction: column;
    /* 取消左内边距，避免内容溢出 */
    padding-left: 0;
    /* 按钮宽度占满容器，更易点击 */
    gap: 8px;
  }

  /* 断点3：超小屏手机（≤480px） */
  @media (max-width: 480px) {
    /* 进一步减小间距 */
    gap: 6px;
    margin-top: 4px;
  }
}

/* 表单标签宽度：响应式调整（解决小屏标签换行问题） */
:deep(.el-form-item__label) {
  /* 小屏时减小标签宽度，避免内容挤压 */
  @media (max-width: 768px) {
    width: 80px !important;
  }
  @media (max-width: 480px) {
    width: 60px !important;
    font-size: 14px; /* 减小字体，节省空间 */
  }
}

/* 输入框宽度：小屏占满容器 */
:deep(.el-input) {
  @media (max-width: 768px) {
    width: 100% !important;
  }
}

/* 单选框组样式优化 */
:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
  margin-top: 5px;
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
