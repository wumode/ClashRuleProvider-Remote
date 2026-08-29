<script setup lang="ts">
import TopRulesTable from '@/components/tables/TopRulesTable.vue'
import { itemsPerPageOptions } from '@/components/constants'
import { pageTitle } from '@/components/utils'
import { RuleData, RuleSetType } from '@/components/types'

defineProps<{
  rules: RuleData[]
  search: string
  page: number
  itemsPerPage: number
  pageCount: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:search', val: string): void
  (e: 'update:page', val: number): void
  (e: 'update:itemsPerPage', val: number): void
  (e: 'open-import-dialog'): void
  (e: 'open-add-dialog'): void
  (e: 'edit', priority: number): void
  (e: 'delete', priority: number): void
  (e: 'delete-batch', priorities: number[]): void
  (e: 'reorder', targetPriority: number, movedPriority: number): void
  (e: 'change-status', priority: number, disabled: boolean): void
  (e: 'change-status-batch', priorities: number[], disabled: boolean): void
  (e: 'edit-visibility', priority: number, type: RuleSetType): void
}>()
</script>

<template>
  <div class="top-rules-desktop-view">
    <!-- 桌面端顶部工具栏 -->
    <div class="pa-4">
      <v-row align="center" no-gutters>
        <v-col cols="6" class="d-flex justify-start">
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
        <v-col cols="6" class="d-flex justify-end">
          <v-btn-group divided variant="outlined" rounded>
            <v-btn icon="mdi-import" :disabled="loading" @click="emit('open-import-dialog')" />
            <v-btn icon="mdi-plus" :disabled="loading" @click="emit('open-add-dialog')" />
          </v-btn-group>
        </v-col>
      </v-row>
    </div>

    <!-- 桌面端表格区域 -->
    <div class="clash-data-table table-page-container">
      <TopRulesTable
        :sorted-rules="rules"
        :page="page"
        :items-per-page="itemsPerPage"
        :search-rule="search"
        @edit="(p) => emit('edit', p)"
        @delete="(p) => emit('delete', p)"
        @delete-batch="(ps) => emit('delete-batch', ps)"
        @reorder="(target, moved) => emit('reorder', target, moved)"
        @change-status="(p, d) => emit('change-status', p, d)"
        @change-status-batch="(ps, d) => emit('change-status-batch', ps, d)"
        @edit-visibility="(p, t) => emit('edit-visibility', p, t)"
      />
    </div>

    <!-- 桌面端底部分页与批量操作栏 -->
    <div class="pa-4" style="min-height: 4rem">
      <v-row align="center" no-gutters>
        <v-col cols="2">
          <div id="top-rules-table-batch-actions"></div>
        </v-col>
        <v-col cols="8" class="d-flex justify-center">
          <v-pagination
            :model-value="page"
            :length="pageCount"
            total-visible="5"
            rounded="circle"
            class="my-0"
            :disabled="loading"
            @update:model-value="(v) => emit('update:page', v)"
          />
        </v-col>
        <v-col cols="2" class="d-flex justify-end">
          <v-menu>
            <template #activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" icon rounded="circle" variant="tonal" :disabled="loading">
                {{ pageTitle(itemsPerPage) }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(item, index) in itemsPerPageOptions"
                :key="index"
                :value="item.value"
                @click="emit('update:itemsPerPage', item.value)"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
