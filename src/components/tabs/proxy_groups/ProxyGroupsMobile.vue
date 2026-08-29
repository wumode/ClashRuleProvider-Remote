<script setup lang="ts">
import ProxyGroupCard from '@/components/cards/ProxyGroupCard.vue'
import { ProxyGroupData } from '@/components/types'

defineProps<{
  paginatedProxyGroups: ProxyGroupData[]
  search: string
  page: number
  pageCount: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:search', val: string): void
  (e: 'update:page', val: number): void
  (e: 'open-add-dialog'): void
  (e: 'edit-proxy-group', name: string): void
  (e: 'delete-proxy-group', name: string): void
  (e: 'delete-patch', name: string): void
  (e: 'change-status', name: string, disabled: boolean): void
  (e: 'edit-visibility', name: string): void
  (e: 'show-yaml', obj: any): void
}>()
</script>

<template>
  <div class="proxy-groups-mobile-view">
    <!-- 移动端顶部工具栏 -->
    <div class="pa-2 pb-4">
      <v-row align="center" no-gutters>
        <v-col cols="10" class="d-flex justify-start">
          <v-text-field
            :model-value="search"
            label="搜索代理组"
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
        <v-col cols="2" class="d-flex justify-end">
          <v-btn-group variant="outlined" rounded>
            <v-btn icon="mdi-plus" :disabled="loading" @click="emit('open-add-dialog')" />
          </v-btn-group>
        </v-col>
      </v-row>
    </div>

    <!-- 移动端卡片列表 -->
    <div class="mobile-card-container">
      <v-row>
        <v-col v-for="item in paginatedProxyGroups" :key="item.data.name" cols="12">
          <ProxyGroupCard
            :proxy-group-data="item"
            @edit-proxy-group="(n) => emit('edit-proxy-group', n)"
            @delete-proxy-group="(n) => emit('delete-proxy-group', n)"
            @delete-patch="(n) => emit('delete-patch', n)"
            @show-yaml="(o) => emit('show-yaml', o)"
            @change-status="(n, d) => emit('change-status', n, d)"
            @edit-visibility="(n) => emit('edit-visibility', n)"
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
