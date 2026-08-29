<script setup lang="ts">
import ProxiesTable from '@/components/tables/ProxiesTable.vue'
import { itemsPerPageOptions } from '@/components/constants'
import { pageTitle } from '@/components/utils'
import { ProxyData } from '@/components/types'

defineProps<{
  proxies: ProxyData[]
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
  <div class="proxies-desktop-view">
    <!-- 桌面端顶部工具栏 -->
    <div class="pa-4">
      <v-row align="center" no-gutters>
        <v-col cols="6" class="d-flex justify-start">
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
        <v-col cols="6" class="d-flex justify-end">
          <v-btn-group variant="outlined" rounded>
            <v-btn icon="mdi-import" :disabled="loading" @click="emit('open-import-dialog')" />
          </v-btn-group>
        </v-col>
      </v-row>
    </div>

    <!-- 桌面端表格区域 -->
    <div class="clash-data-table table-page-container">
      <ProxiesTable
        :items-per-page="itemsPerPage"
        :page="page"
        :proxies="proxies"
        :search="search"
        @copy-to-clipboard="(t) => emit('copy-to-clipboard', t)"
        @show-yaml="(o) => emit('show-yaml', o)"
        @edit-proxy="(p) => emit('edit-proxy', p)"
        @delete-proxy="(n) => emit('delete-proxy', n)"
        @delete-patch="(n) => emit('delete-patch', n)"
        @change-status="(n, d) => emit('change-status', n, d)"
        @edit-visibility="(n) => emit('edit-visibility', n)"
      />
    </div>

    <!-- 桌面端底部分页 -->
    <div class="pa-4" style="min-height: 4rem">
      <v-row align="center" no-gutters>
        <v-col cols="2" md="1"></v-col>
        <v-col cols="8" md="10" class="d-flex justify-center">
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
        <v-col cols="2" md="1" class="d-flex justify-end">
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
