<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DesktopLayout from '../../layouts/DesktopLayout.vue'
import AppointmentInfoCard from '../../components/AppointmentInfoCard.vue'
import { listAppointments } from '../../api'
import type { Appointment } from '../../api/types'

const loading = ref(true)
const appointments = ref<Appointment[]>([])

onMounted(async () => {
  try {
    const res = await listAppointments({ pageSize: 200 })
    appointments.value = res.items
  } finally {
    loading.value = false
  }
})
const selectedId = ref('')
const selectedAppointment = ref<Appointment | null>(null)

const form = ref({
  moisture: '',
  riceYield: '',
  impurity: '',
  bellyWhite: '',
  diseaseSpot: '',
  crossMix: '',
  conclusion: '',
})

function selectAppointment(id: string) {
  selectedId.value = id
  selectedAppointment.value = appointments.value.find(a => a._id === id) || null
}

function handleSubmit() {
  const f = form.value
  if (!f.moisture || !f.riceYield || !f.conclusion) return
  alert('扦样结果已提交（模拟）')
}
</script>

<template>
  <DesktopLayout>
    <template #title>扦样录入</template>

    <div class="appointment-select">
      <label class="select-label">选择预约</label>
      <select v-model="selectedId" class="select-input" @change="selectAppointment(selectedId)">
        <option value="">-- 请选择 --</option>
        <option
          v-for="a in appointments.filter(a => a.status === 'called' || a.status === 'waiting')"
          :key="a._id"
          :value="a._id"
        >
          {{ a.appointmentNo }} - {{ a.licensePlate }} - {{ a.driverName }}
        </option>
      </select>
    </div>

    <div v-if="selectedAppointment" class="sampling-layout">
      <AppointmentInfoCard
        :appointment-number="selectedAppointment.appointmentNo"
        :driver-name="selectedAppointment.driverName"
        :license-plate="selectedAppointment.licensePlate"
        :variety="selectedAppointment.variety"
      />

      <div class="form-card">
        <div class="form-card-title">扦样检测</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">水分 (%)</label>
            <input v-model="form.moisture" class="form-input" placeholder="如：14.5" />
          </div>
          <div class="form-group">
            <label class="form-label">出米率 (%)</label>
            <input v-model="form.riceYield" class="form-input" placeholder="如：60.2" />
          </div>
          <div class="form-group">
            <label class="form-label">杂质 (%)</label>
            <input v-model="form.impurity" class="form-input" placeholder="选填" />
          </div>
          <div class="form-group">
            <label class="form-label">垩白 (%)</label>
            <input v-model="form.bellyWhite" class="form-input" placeholder="选填" />
          </div>
          <div class="form-group">
            <label class="form-label">病斑 (%)</label>
            <input v-model="form.diseaseSpot" class="form-input" placeholder="选填" />
          </div>
          <div class="form-group">
            <label class="form-label">互混 (%)</label>
            <input v-model="form.crossMix" class="form-input" placeholder="选填" />
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">结论</label>
          <select v-model="form.conclusion" class="form-input">
            <option value="">-- 请选择 --</option>
            <option value="合格">合格</option>
            <option value="不合格">不合格</option>
          </select>
        </div>

        <button class="submit-btn" @click="handleSubmit">
          提交结果
        </button>
      </div>
    </div>

    <div v-else class="empty-state">请先选择预约记录</div>
  </DesktopLayout>
</template>

<style scoped>
.appointment-select {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.select-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
  white-space: nowrap;
  font-weight: 500;
}

.select-input {
  flex: 1;
  max-width: 400px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  outline: none;
  background: var(--color-surface, #fff);
  min-height: 36px;
}

.select-input:focus {
  border-color: #FF6600;
}

.sampling-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 1.25rem;
  border: 1px solid var(--color-border, #eee);
}

.form-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
  font-weight: 500;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  outline: none;
  min-height: 36px;
}

.form-input:focus {
  border-color: #FF6600;
}

.submit-btn {
  padding: 0.65rem 2rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 40px;
}

.submit-btn:hover {
  opacity: 0.9;
}

.empty-state {
  text-align: center;
  color: var(--color-text-placeholder, #999);
  padding: 3rem 0;
  font-size: 0.9rem;
}
</style>
