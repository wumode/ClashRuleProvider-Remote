<script setup lang="ts">

import {getProxyColor, isInvalid, isManual, isTemplate} from "@/components/utils";
import {PropType, ref} from "vue";
import {ProxyData} from "@/components/types";
import {itemsPerPageOptions} from "@/components/constants";

const props = defineProps({
  proxies: {
    type: Array as PropType<ProxyData[]>,
    required: true,
  },
  page: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true
  },
  search: String
})

const emit = defineEmits<{
  (e: 'copyToClipboard', content: string): void,
  (e: 'showYaml', obj: any): void,
  (e: 'editProxy', proxyData: ProxyData): void
  (e: 'deleteProxy', name: string): void
}>()

const headers = ref([
  {title: '名称', key: 'name', sortable: true},
  {title: '类型', key: 'type', sortable: false},
  {title: '服务器', key: 'server', sortable: false},
  {title: '端口', key: 'port', sortable: false},
  {title: '来源', key: 'source', sortable: false},
  {title: '', key: 'actions', sortable: false, width: '1rem'},
]);
</script>

<template>
  <v-data-table
      class="px-4"
      :headers="headers"
      :search="search"
      :items="proxies"
      :page="page"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      item-key="name"
      density="compact"
      hide-default-footer
      fixed-header
  >
    <template #item.name="{ item }">
      {{ item.proxy.name }}
      <v-btn v-if="item.v2ray_link" icon size="small" color="secondary" variant="text"
             @click="emit('copyToClipboard', item.v2ray_link)">
        <v-icon>mdi-link</v-icon>
      </v-btn>
    </template>

    <template #item.type="{ item }">
      <v-chip :color="getProxyColor(item.proxy.type)" size="small" label>
        {{ item.proxy.type }}
      </v-chip>
    </template>

    <template #item.server="{ item }">
      {{ item.proxy.server }}
    </template>

    <template #item.port="{ item }">
      {{ item.proxy.port }}
    </template>

    <template #item.source="{ item }">
      <v-icon v-if="isManual(item.source)" color="primary">mdi-feather</v-icon>
      <v-icon v-else-if="isTemplate(item.source)" color="success">mdi-file-code-outline</v-icon>
      <v-icon v-else color="info">mdi-file-download-outline</v-icon>
    </template>

    <template #item.actions="{ item }">
      <v-menu min-width="120">
        <template v-slot:activator="{ props }">
          <v-btn color="secondary" icon size="small" variant="text" v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item @click="emit('showYaml', item.proxy)">
            <template v-slot:prepend>
              <v-icon size="small" color="info">mdi-code-json</v-icon>
            </template>
            <v-list-item-title>查看配置</v-list-item-title>
          </v-list-item>
          <v-list-item @click="emit('editProxy', item)">
            <template v-slot:prepend>
              <v-icon size="small" color="primary">mdi-file-edit-outline</v-icon>
            </template>
            <v-list-item-title>编辑</v-list-item-title>
          </v-list-item>
          <v-list-item
              @click="emit('deleteProxy', item.proxy.name)"
              :disabled="!(isManual(item.source)||isInvalid(item.source))"
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