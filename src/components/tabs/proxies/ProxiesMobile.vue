<script setup lang="ts">
import ProxyCard from '@/components/cards/ProxyCard.vue'
import { ProxyData } from '@/components/types'

defineProps<{
  paginatedProxies: ProxyData[]
  search: string
  page: number
  pageCount: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:search', val: string): void
  (e: 'update:page', val: number): void
  (e: 'open-import-dialog'): void
  (e: 'edit-proxy', proxyData: ProxyData): void
  (e: 'delete-proxy', name: string): void
  (e: 'delete-patch', name: string): void
  (e: 'change-status', name: string, disabled: boolean): void
  (e: 'edit-visibility', name: string): void
  (e: 'copy-to-clipboard', text: string): void
  (e: 'show-yaml', obj: any): void
}>()
</script>

<template>
  <div class="proxies-mobile-view">
    <!-- 移动端顶部工具栏 -->
    <div class="pa-2 pb-4">
      <v-row align="center" no-gutters>
        <v-col cols="10" class="d-flex justify-start">
          <v-text-field
            :model-value="search"
            label="搜索出站代理"
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
            <v-btn icon="mdi-import" :disabled="loading" @click="emit('open-import-dialog')" />
          </v-btn-group>
        </v-col>
      </v-row>
    </div>

    <!-- 移动端卡片列表 -->
    <div class="mobile-card-container">
      <v-row>
        <v-col v-for="item in paginatedProxies" :key="item.data.name" cols="12">
          <ProxyCard
            :proxy-data="item"
            @copy-to-clipboard="(t) => emit('copy-to-clipboard', t)"
            @show-yaml="(o) => emit('show-yaml', o)"
            @edit-proxy="(p) => emit('edit-proxy', p)"
            @delete-proxy="(n) => emit('delete-proxy', n)"
            @delete-patch="(n) => emit('delete-patch', n)"
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
