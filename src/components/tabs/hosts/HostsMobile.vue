<script setup lang="ts">
import HostCard from '@/components/cards/HostCard.vue'
import { HostData } from '@/components/types'

defineProps<{
  paginatedHosts: HostData[]
  bestCloudflareIPs: string[]
  search: string
  page: number
  pageCount: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:search', val: string): void
  (e: 'update:page', val: number): void
  (e: 'open-add-dialog'): void
  (e: 'edit', domain: string): void
  (e: 'delete', name: string): void
}>()
</script>

<template>
  <div class="hosts-mobile-view">
    <!-- 移动端顶部工具栏 -->
    <div class="pa-2 pb-4">
      <v-row align="center" no-gutters>
        <v-col cols="10" class="d-flex justify-start">
          <v-text-field
            :model-value="search"
            label="搜索Hosts"
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
        <v-col v-for="item in paginatedHosts" :key="item.domain" cols="12">
          <HostCard
            :host-data="item"
            :best-cloudflare-i-ps="bestCloudflareIPs"
            @edit-host="(d) => emit('edit', d)"
            @delete-host="(n) => emit('delete', n)"
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
