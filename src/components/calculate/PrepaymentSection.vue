<template>
  <!-- 整体显隐控制：由父组件传入的 visible 属性决定 -->
  <div class="prepayment-section" v-show="visible">
    <!-- 周期性提前还款设置 -->
    <el-form-item label="周期性提前还款">
      <!-- 外层容器：消除默认间距，确保一行展示 -->
      <div style="margin-left: 0; width: calc(100% - 120px); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <!-- 开始月份 -->
        <div style="display: flex; align-items: center;">
          <span>从第</span>
          <el-input
              v-model.number="periodicRepay.startMonth"
              type="number"
              min="1"
              placeholder="1"
              style="width: 60px; margin: 0 6px;"
              size="small"
          />
          <span>月</span>
        </div>

        <!-- 结束月份 -->
        <div style="display: flex; align-items: center;">
          <span>到第</span>
          <el-input
              v-model.number="periodicRepay.endMonth"
              type="number"
              min="1"
              placeholder="360"
              style="width: 60px; margin: 0 6px;"
              size="small"
          />
          <span>月</span>
        </div>

        <!-- 周期月数 -->
        <div style="display: flex; align-items: center;">
          <span>每隔</span>
          <el-input
              v-model.number="periodicRepay.cycleMonths"
              type="number"
              min="1"
              placeholder="6"
              style="width: 60px; margin: 0 6px;"
              size="small"
          />
          <span>个月</span>
        </div>

        <!-- 还款金额 -->
        <div style="display: flex; align-items: center; flex: 1; min-width: 150px;">
          <span>每次还</span>
          <el-input
              v-model.number="periodicRepay.amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="50000"
              style="width: 100px; margin: 0 6px;"
              size="small"
          />
          <span>元</span>
        </div>

        <!-- 添加按钮 -->
        <el-button
            type="primary"
            size="small"
            @click="addPeriodicRepay"
            :disabled="!periodicRepay.startMonth || !periodicRepay.endMonth || !periodicRepay.cycleMonths || !periodicRepay.amount"
            style="flex-shrink: 0;"
        >
          添加周期还款
        </el-button>
      </div>
    </el-form-item>

    <!-- 一次性提前还款 -->
    <el-form-item label="一次性提前还款">
      <el-button type="primary" size="small" @click="addPrepayment">添加单次还款</el-button>
    </el-form-item>

    <!-- 一次性提前还款表格 -->
    <el-form-item>
      <el-table
          :data="prepayments"
          border
          style="width: calc(100% - 120px); margin-left: 120px; max-width: 800px;"
      >
        <el-table-column label="月数" width="100">
          <template #default="scope">
            <el-input
                v-model.number="scope.row.month"
                type="number"
                min="1"
                max="12"
                size="small"
                placeholder="如1"
            />
          </template>
        </el-table-column>
        <el-table-column label="还款金额（元）" width="150">
          <template #default="scope">
            <el-input
                v-model.number="scope.row.amount"
                type="number"
                step="0.01"
                size="small"
                placeholder="如50000"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button
                type="danger"
                size="small"
                @click="deletePrepayment(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <!-- 周期性提前还款表格：新增起始月、结束月列 -->
    <el-form-item label="已添加周期还款">
      <el-table
          :data="periodicRepayList"
          border
          style="width: calc(100% - 120px); margin-left: 120px; max-width: 800px;"
      >
        <!-- 新增：起始月列 -->
        <el-table-column label="起始月" width="100">
          <template #default="scope">
            {{ scope.row.startMonth }} 月
          </template>
        </el-table-column>
        <!-- 新增：结束月列 -->
        <el-table-column label="结束月" width="100">
          <template #default="scope">
            {{ scope.row.endMonth }} 月
          </template>
        </el-table-column>
        <!-- 周期月数列（保留，优化显示） -->
        <el-table-column label="周期（月）" width="120">
          <template #default="scope">
            {{ scope.row.cycleMonths }} 个月
          </template>
        </el-table-column>
        <!-- 还款金额列（保留，优化显示） -->
        <el-table-column label="每次还款金额（元）" width="180">
          <template #default="scope">
            {{ scope.row.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button
                type="danger"
                size="small"
                @click="deletePeriodicRepay(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
  </div>
</template>

<script setup>
import { reactive, ref, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 定义接收的Props
const props = defineProps({
  // 控制组件整体显隐（核心新增）
  visible: {
    type: Boolean,
    default: true
  },
  // 初始化一次性提前还款数据
  initPrepayments: {
    type: Array,
    default: () => []
  },
  // 初始化周期性提前还款数据
  initPeriodicRepayList: {
    type: Array,
    default: () => []
  }
})

// 定义向外暴露的事件
const emit = defineEmits([
  'update:prepayments',    // 一次性还款列表更新
  'update:periodicRepayList', // 周期还款列表更新
  'reset' // 重置事件
])

// 临时存储周期还款的输入数据
const periodicRepay = reactive({
  startMonth: '',
  endMonth: '',
  cycleMonths: '',
  amount: ''
})

// 一次性提前还款列表（双向绑定）
const prepayments = ref([...props.initPrepayments])
// 周期性提前还款列表（双向绑定）
const periodicRepayList = ref([...props.initPeriodicRepayList])

// 监听一次性还款列表变化，同步到父组件
watch(prepayments, (newVal) => {
  emit('update:prepayments', newVal)
}, { deep: true })

// 监听周期还款列表变化，同步到父组件
watch(periodicRepayList, (newVal) => {
  emit('update:periodicRepayList', newVal)
}, { deep: true })

// 新增：添加一次性提前还款行
const addPrepayment = () => {
  prepayments.value.push({ month: '', amount: '' })
}

// 新增：删除一次性提前还款行
const deletePrepayment = (index) => {
  prepayments.value.splice(index, 1)
}

// 新增：添加周期性提前还款
const addPeriodicRepay = () => {
  const { startMonth, endMonth, cycleMonths, amount } = periodicRepay

  // 基础校验
  if (!startMonth || !endMonth || !cycleMonths || !amount) {
    ElMessage.error('请填写完整的周期还款信息（开始/结束月份、周期、金额）')
    return
  }
  if (Number(cycleMonths) < 1 || Number(amount) <= 0) {
    ElMessage.error('周期月数需≥1，还款金额需＞0')
    return
  }
  if (Number(startMonth) > Number(endMonth)) {
    ElMessage.error('开始月份不能大于结束月份')
    return
  }

  // 添加到周期还款列表
  periodicRepayList.value.push({
    startMonth: Number(startMonth),
    endMonth: Number(endMonth),
    cycleMonths: Number(cycleMonths),
    amount: Number(amount)
  })

  // 清空临时输入框
  periodicRepay.startMonth = ''
  periodicRepay.endMonth = ''
  periodicRepay.cycleMonths = ''
  periodicRepay.amount = ''

  ElMessage.success('周期还款规则添加成功')
}

// 新增：删除周期性提前还款
const deletePeriodicRepay = (index) => {
  periodicRepayList.value.splice(index, 1)
}

// 重置提前还款相关所有数据
const resetPrepayment = () => {
  // 清空临时输入
  periodicRepay.startMonth = ''
  periodicRepay.endMonth = ''
  periodicRepay.cycleMonths = ''
  periodicRepay.amount = ''
  // 清空列表
  prepayments.value = []
  periodicRepayList.value = []
  // 通知父组件重置
  emit('reset')
}

// 向外暴露方法（供父组件调用）
defineExpose({
  resetPrepayment
})
</script>

<style scoped>
.prepayment-section {
  margin-top: 16px;
}

/* 优化小屏适配：周期性还款输入行自动换行 */
@media (max-width: 768px) {
  .prepayment-section .el-form-item > div {
    flex-wrap: wrap !important;
  }
  .prepayment-section .el-table {
    width: 100% !important;
    margin-left: 0 !important;
  }
}
</style>