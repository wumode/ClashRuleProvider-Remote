<script setup lang="ts">
import {ref, PropType} from 'vue'
import {itemsPerPageOptions} from "@/components/constants"
import {getBoolColor} from '@/components/utils'
import type {HostData} from "@/components/types"

const props = defineProps({
  hosts: {
    type: Array as PropType<HostData[]>,
    required: true
  },
  search: {
    type: String,
    default: ''
  },
  page: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'update:page', 'update:itemsPerPage'])

const headersHosts = ref([
  {title: '域名', key: 'domain', sortable: true},
  {title: 'IP', key: 'value', sortable: false},
  {title: 'Cloudflare CDN', key: 'using_cloudflare', sortable: false},
  {title: '', key: 'actions', sortable: false, width: '1rem'},
]);

</script>
<template>
  <v-data-table
      :headers="headersHosts"
      :items="hosts"
      :search="search"
      :page="page"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      class="px-4"
      density="compact"
      hide-default-footer
      fixed-header
      item-key="domain"
  >
    <template #item.domain="{ item }">
      <v-chip size="small" pill color="secondary">{{ item.domain }}</v-chip>
    </template>

    <template #item.value="{ item }">
      <v-chip
          v-for="ip in item.value"
          :key="ip"
          size="small"
          class="ma-1"
          variant="tonal"
      >
        {{ ip }}
      </v-chip>
    </template>

    <template #item.using_cloudflare="{ item }">
      <v-chip
          :color="getBoolColor(item.using_cloudflare)"
          size="small"
          variant="tonal"
      >
        {{ item.using_cloudflare ? '是' : '否' }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-menu min-width="120">
        <template v-slot:activator="{ props }">
          <v-btn color="secondary" icon size="small" variant="text" v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item
              @click="$emit('edit', item.domain)"
          >
            <template v-slot:prepend>
              <v-icon size="small" color="primary">mdi-file-edit-outline</v-icon>
            </template>
            <v-list-item-title>编辑</v-list-item-title>
          </v-list-item>
          <v-list-item
              @click="$emit('delete', item.domain)"
          >
            <template v-slot:prepend>
              <v-icon size="small" color="error">mdi-trash-can-outline</v-icon>
            </template>
            <v-list-item-title>删除</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-data-table>
</template>

<style scoped>
</style>
