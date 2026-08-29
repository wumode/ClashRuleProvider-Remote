<script setup lang="ts">
import RuleCard from '@/components/cards/RuleCard.vue'
import { RuleData, RuleSetType } from '@/components/types'

defineProps<{
  paginatedRules: RuleData[]
  search: string
  page: number
  pageCount: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:search', val: string): void
  (e: 'update:page', val: number): void
  (e: 'open-import-dialog'): void
  (e: 'open-add-dialog'): void
  (e: 'edit', priority: number): void
  (e: 'delete', priority: number): void
  (e: 'change-status', priority: number, disabled: boolean): void
  (e: 'edit-visibility', priority: number, type: RuleSetType): void
}>()
</script>

<template>
  <div class="top-rules-mobile-view">
    <!-- 移动端顶部工具栏 -->
    <div class="pa-2 pb-4">
      <v-row align="center" no-gutters>
        <v-col cols="8" class="d-flex justify-start">
          <v-text-field
            :model-value="search"
            label="搜索规则"
            clearable
            density="compact"
            variant="solo-filled"
            hide-details
            class="search-field"
            prepend-inner-icon="mdi-magnify"
            flat
            rounded="pill"
            single-line
            :disabled="loading"
            @update:model-value="(v) => emit('update:search', v || '')"
          />
        </v-col>
        <v-col cols="4" class="d-flex justify-end">
          <v-btn-group divided variant="outlined" rounded>
            <v-btn icon="mdi-import" :disabled="loading" @click="emit('open-import-dialog')" />
            <v-btn icon="mdi-plus" :disabled="loading" @click="emit('open-add-dialog')" />
          </v-btn-group>
        </v-col>
      </v-row>
    </div>

    <!-- 移动端卡片列表 -->
    <div class="mobile-card-container">
      <v-row>
        <v-col v-for="item in paginatedRules" :key="item.priority" cols="12">
          <RuleCard
            ruleset="top"
            :rule="item"
            @delete="(p) => emit('delete', p)"
            @edit="(p) => emit('edit', p)"
            @change-status="(p, d) => emit('change-status', p, d)"
            @edit-visibility="(p, t) => emit('edit-visibility', p, t)"
          />
        </v-col>
      </v-row>
    </div>

    <!-- 移动端底部分页 -->
    <div class="pa-4 d-flex justify-center" style="min-height: 4rem">
      <v-pagination
        :model-value="page"
        :length="pageCount"
        total-visible="0"
        rounded="circle"
        class="my-0"
        :disabled="loading"
        @update:model-value="(v) => emit('update:page', v)"
      />
    </div>
  </div>
</template>

<style scoped>
.mobile-card-container {
  min-height: 20rem;
}
</style>
