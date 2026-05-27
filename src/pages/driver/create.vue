<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileLayout from '../../layouts/MobileLayout.vue'
import TagSelector from '../../components/TagSelector.vue'
import { createAppointment } from '../../api/index'
import { mockVarieties } from '../../api/mock/data'

const router = useRouter()

const form = ref({
  driverName: '',
  phone: '',
  licensePlate: '',
  variety: '',
  appointmentDate: '',
  appointmentTime: '',
  remark: '',
})

const submitting = ref(false)

async function handleSubmit() {
  const f = form.value
  if (!f.driverName || !f.phone || !f.licensePlate || !f.variety || !f.appointmentDate || !f.appointmentTime)
    return
  submitting.value = true
  try {
    await createAppointment({
      driverName: f.driverName,
      phone: f.phone,
      licensePlate: f.licensePlate,
      variety: f.variety as any,
      appointmentDate: f.appointmentDate,
      appointmentTime: f.appointmentTime,
      remark: f.remark || undefined,
    })
    router.push('/driver/queue')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <MobileLayout>
    <template #header>
      <div class="page-header">新建预约</div>
    </template>

    <div class="create-form">
      <div class="form-group">
        <label class="form-label">驾驶员姓名</label>
        <input v-model="form.driverName" class="form-input" placeholder="请输入姓名" />
      </div>

      <div class="form-group">
        <label class="form-label">手机号</label>
        <input v-model="form.phone" class="form-input" placeholder="11位手机号" maxlength="11" />
      </div>

      <div class="form-group">
        <label class="form-label">车牌号</label>
        <input v-model="form.licensePlate" class="form-input" placeholder="如：辽A12345" />
      </div>

      <div class="form-group">
        <label class="form-label">粮食品种</label>
        <TagSelector v-model="form.variety" :options="mockVarieties" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">日期</label>
          <input v-model="form.appointmentDate" class="form-input" placeholder="YYYY-MM-DD" />
        </div>
        <div class="form-group">
          <label class="form-label">时间</label>
          <input v-model="form.appointmentTime" class="form-input" placeholder="HH:MM" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">备注</label>
        <textarea v-model="form.remark" class="form-textarea" placeholder="选填" />
      </div>

      <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? '提交中...' : '提交预约' }}
      </button>
    </div>
  </MobileLayout>
</template>

<style scoped>
.page-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  padding: 0.75rem 0;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
  font-weight: 500;
}

.form-input {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.9rem;
  outline: none;
  min-height: 44px;
}

.form-input:focus {
  border-color: #FF6600;
}

.form-textarea {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.9rem;
  outline: none;
  min-height: 80px;
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.submit-btn {
  padding: 0.75rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 48px;
  margin-top: 0.5rem;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
