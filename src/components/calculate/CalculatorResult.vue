<template>
  <el-card
      shadow="hover"
      header="还款计算结果"
      v-if="showResult"
      style="margin-top: 20px;"
  >
    <!-- 总计信息：Element Plus 栅格布局 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <!-- 还款总年限 -->
      <el-col :span="6">
        <div class="summary-item">
          <label>还款总年限</label>
          <div class="value">{{ summary.years || '-' }} 年（{{ summary.totalMonths || '-' }} 个月）</div>
        </div>
      </el-col>
      <!-- 总还款本金 -->
      <el-col :span="6">
        <div class="summary-item">
          <label>总还款本金</label>
          <div class="value">{{ formatMoney(summary.totalAllPrincipal) }} 元</div>
        </div>
      </el-col>
      <!-- 总还款利息 -->
      <el-col :span="6">
        <div class="summary-item">
          <label>总还款利息</label>
          <div class="value">{{ formatMoney(summary.totalAllInterest) }} 元</div>
        </div>
      </el-col>
      <!-- 总还款金额 -->
      <el-col :span="24">
        <div class="summary-item total">
          <label>总还款金额</label>
          <div class="value">{{ formatMoney(summary.totalAllRepay) }} 元</div>
        </div>
      </el-col>
    </el-row>

    <!-- 标签页：Element Plus 自带 -->
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="月度还款明细" name="monthly">
        <!-- 空数据提示 -->
        <div v-if="!loading && (monthlyDetails === null || monthlyDetails.length === 0)" class="empty-tip">
          <el-empty description="暂无月度还款数据" />
        </div>
        <el-table
            :data="monthlyDetails"
            border
            v-loading="loading"
            style="width: 100%;"
            height="400px"
            v-else
            :empty-text="''"
        >
          <el-table-column prop="month" label="还款月份" align="center" />
          <el-table-column prop="monthlyPrincipal" label="当月本金（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.monthlyPrincipal) }}</template>
          </el-table-column>
          <el-table-column prop="monthlyInterest" label="当月利息（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.monthlyInterest) }}</template>
          </el-table-column>
          <el-table-column prop="monthlyRepay" label="当月还款总额（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.monthlyRepay) }}</template>
          </el-table-column>
          <el-table-column prop="remainingPrincipal" label="剩余本金（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.remainingPrincipal) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="年度还款汇总" name="yearly">
        <!-- 调试：打印数据到控制台（方便排查） -->
        <div style="display: none;">{{ yearlySummaries }}</div>
        <!-- 空数据提示：优化判断逻辑 -->
        <div v-if="!loading && (yearlySummaries === null || yearlySummaries.length === 0)" class="empty-tip">
          <el-empty description="暂无年度还款数据" />
        </div>
        <el-table
            :data="yearlySummaries"
            border
            v-loading="loading"
            style="width: 100%;"
            height="400px"
            v-else
            :empty-text="''"
        >
          <!-- 修复：移除重复的year列，年份不使用金额格式化 -->
          <el-table-column prop="year" label="还款年度" align="center" />
          <el-table-column prop="yearPrincipal" label="当年本金（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.yearPrincipal) }}</template>
          </el-table-column>
          <el-table-column prop="yearInterest" label="当年利息（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.yearInterest) }}</template>
          </el-table-column>
          <el-table-column prop="yearTotalRepay" label="当年还款总额（元)" align="right">
            <template #default="scope">{{ formatMoney(scope.row.yearTotalRepay) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
import { ref, defineProps, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 接收父组件传递的参数
const props = defineProps({
  summary: {
    type: Object,
    default: () => ({
      loanTotal: '-',
      years: '-',
      totalMonths: '-',
      totalAllPrincipal: '-',
      totalAllInterest: '-',
      totalAllRepay: '-'
    }),
    required: true
  },
  monthlyDetails: {
    type: Array,
    default: () => [],
    required: true
  },
  yearlySummaries: {
    type: Array,
    default: () => [],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  showResult: {
    type: Boolean,
    default: false
  }
})

// 激活的标签页
const activeTab = ref('monthly')

// 调试：组件挂载时检查年度数据
onMounted(() => {
  console.log('年度还款数据：', props.yearlySummaries)
  // 如果数据为空，给出调试提示
  if (props.showResult && props.yearlySummaries.length === 0) {
    console.warn('年度还款数据为空，请检查：1.后端是否返回yearlySummaries 2.字段名是否匹配 3.父组件是否正确传递')
  }
})

// 监听数据变化，给用户友好提示
watch([() => props.monthlyDetails, () => props.yearlySummaries], () => {
  if (props.showResult && !props.loading) {
    // 区分提示类型
    if (props.yearlySummaries.length > 0) {
      ElMessage.success('还款数据已更新（包含年度汇总）')
    } else {
      ElMessage.success('月度还款数据已更新（暂无年度数据）')
    }
  }
}, { deep: true })

// 金额格式化 - 增强版（移除debugger，优化逻辑）
const formatMoney = (num) => {
  // 处理空值、字符串、非数字情况
  if (num === null || num === undefined || num === '-' || isNaN(Number(num))) {
    return '0.00'
  }

  // 转换为数字并保留两位小数
  const number = Number(num)
  return number.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<style scoped>
/* 仅保留少量自定义样式，大部分由 Element Plus 提供 */
.summary-item {
  padding: 12px 15px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.summary-item:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.summary-item label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
}

.summary-item .value {
  color: #303133;
  font-size: 16px;
  font-family: "Microsoft YaHei", sans-serif;
}

.summary-item.total {
  background-color: #fff8e6;
  border-color: #ffd591;
}

.summary-item.total .value {
  color: #e6a23c;
  font-weight: bold;
  font-size: 18px;
}

/* 空数据提示样式 */
.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

/* 表格单元格样式优化 */
:deep(.el-table td),
:deep(.el-table th) {
  text-align: center;
}

:deep(.el-table .cell) {
  font-family: "Microsoft YaHei", sans-serif;
}

/* 标签页样式优化 */
:deep(.el-tabs__header) {
  margin-bottom: 15px;
}
</style>
