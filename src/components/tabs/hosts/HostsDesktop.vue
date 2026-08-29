<script setup lang="ts">
import HostsTable from '@/components/tables/HostsTable.vue'
import { itemsPerPageOptions } from '@/components/constants'
import { pageTitle } from '@/components/utils'
import { HostData } from '@/components/types'

defineProps<{
  hosts: HostData[]
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
  (e: 'open-add-dialog'): void
  (e: 'edit', domain: string): void
  (e: 'delete', name: string): void
}>()
</script>

<template>
  <div class="hosts-desktop-view">
    <!-- 桌面端顶部工具栏 -->
    <div class="pa-4">
      <v-row align="center" no-gutters>
        <v-col cols="6" class="d-flex justify-start">
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
        <v-col cols="6" class="d-flex justify-end">
          <v-btn-group variant="outlined" rounded>
            <v-btn icon="mdi-plus" :disabled="loading" @click="emit('open-add-dialog')" />
          </v-btn-group>
        </v-col>
      </v-row>
    </div>

    <!-- 桌面端表格区域 -->
    <div class="clash-data-table table-page-container">
      <HostsTable
        :hosts="hosts"
        :search="search"
        :page="page"
        :items-per-page="itemsPerPage"
        @edit="(d) => emit('edit', d)"
        @delete="(n) => emit('delete', n)"
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
