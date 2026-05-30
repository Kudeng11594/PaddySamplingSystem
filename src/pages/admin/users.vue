<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DesktopLayout from '../../layouts/DesktopLayout.vue'
import { listUsers } from '../../api'
import type { User, UserRole } from '../../api/types'

const searchKeyword = ref('')
const roleFilter = ref('')

const loading = ref(true)
const allUsers = ref<User[]>([])

onMounted(async () => {
  try {
    const res = await listUsers()
    allUsers.value = res.items
  } finally {
    loading.value = false
  }
})

const roleOptions = [
  { value: '', label: '全部角色' },
  { value: 'admin', label: '管理员' },
  { value: 'operator', label: '操作员' },
  { value: 'manager', label: '管理者' },
]

const roleBadgeStyle: Record<UserRole, { bg: string; text: string; label: string }> = {
  admin: { bg: '#fff3e0', text: '#e65100', label: '管理员' },
  operator: { bg: '#e3f2fd', text: '#1565c0', label: '操作员' },
  manager: { bg: '#e8f5e9', text: '#2e7d32', label: '管理者' },
}

const filtered = computed(() => {
  let list = [...allUsers.value]
  const kw = searchKeyword.value.toLowerCase().trim()
  if (kw) {
    list = list.filter(u => u.username.toLowerCase().includes(kw))
  }
  if (roleFilter.value) {
    list = list.filter(u => u.role === roleFilter.value)
  }
  return list
})

function formatDate(d: string): string {
  return d.slice(0, 10)
}
</script>

<template>
  <DesktopLayout>
    <template #title>用户管理</template>

    <div class="users-toolbar">
      <div class="filter-bar">
        <input
          v-model="searchKeyword"
          class="filter-input"
          placeholder="搜索用户名"
        />
        <select v-model="roleFilter" class="filter-select">
          <option
            v-for="opt in roleOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>角色</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filtered" :key="user.id">
            <td class="cell-username">{{ user.username }}</td>
            <td>
              <span
                class="role-badge"
                :style="{
                  background: roleBadgeStyle[user.role].bg,
                  color: roleBadgeStyle[user.role].text,
                }"
              >
                {{ roleBadgeStyle[user.role].label }}
              </span>
            </td>
            <td class="cell-date">{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="action-links">
                <a class="action-link" href="#">重置密码</a>
                <a class="action-link danger" href="#">删除</a>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="4" class="cell-empty">暂无用户</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DesktopLayout>
</template>

<style scoped>
.users-toolbar {
  margin-bottom: 1rem;
}

.filter-bar {
  display: flex;
  gap: 0.75rem;
}

.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  outline: none;
  min-height: 36px;
  min-width: 200px;
}

.filter-input:focus {
  border-color: #FF6600;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  outline: none;
  background: var(--color-surface, #fff);
  min-height: 36px;
  min-width: 120px;
}

.table-wrap {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  border: 1px solid var(--color-border, #eee);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.data-table th {
  text-align: left;
  padding: 0.65rem 0.75rem;
  background: #fafafa;
  color: var(--color-text-secondary, #666);
  font-weight: 600;
  border-bottom: 1px solid var(--color-border, #eee);
}

.data-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--color-border, #f5f5f5);
  color: var(--color-text, #333);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.cell-username {
  font-weight: 600;
}

.cell-date {
  color: var(--color-text-secondary, #666);
}

.role-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.action-links {
  display: flex;
  gap: 0.75rem;
}

.action-link {
  font-size: 0.8rem;
  color: #FF6600;
  text-decoration: none;
  cursor: pointer;
}

.action-link:hover {
  text-decoration: underline;
}

.action-link.danger {
  color: #e53935;
}

.cell-empty {
  text-align: center;
  color: var(--color-text-placeholder, #999);
  padding: 2rem 0 !important;
}
</style>
