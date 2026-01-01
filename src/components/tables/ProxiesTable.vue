<script setup lang="ts">

import {getProxyColor, getSourceColor} from "@/components/utils";
import {PropType, ref} from "vue";
import {ProxyData} from "@/components/types";
import {itemsPerPageOptions} from "@/components/constants";
import ProxyActionMenu from "@/components/menu/ProxyActionMenu.vue";

defineProps({
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
  (e: 'changeStatus', name: string, disabled: boolean): void
}>()

const headers = ref([
  {title: '名称', key: 'name', sortable: true},
  {title: '类型', key: 'type', sortable: false},
  {title: '服务器', key: 'server', sortable: false},
  {title: '端口', key: 'port', sortable: false},
  {title: '来源', key: 'source', sortable: false},
  {title: '', key: 'status', sortable: false, width: '1rem'},
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
      <v-chip size="small" pill color="secondary">{{ item.data.name }}</v-chip>
      <v-btn v-if="item.v2ray_link" icon size="small" color="secondary" variant="text"
             @click="emit('copyToClipboard', item.v2ray_link)">
        <v-icon>mdi-link</v-icon>
      </v-btn>
    </template>

    <template #item.type="{ item }">
      <v-chip :color="getProxyColor(item.data.type)" size="small" label variant="tonal">
        {{ item.data.type }}
      </v-chip>
    </template>

    <template #item.server="{ item }">
      <small>{{ item.data.server }}</small>
    </template>

    <template #item.port="{ item }">
      <v-chip
          size="x-small"
          label
          variant="tonal"
          color="primary"
      >
        {{ item.data.port }}
      </v-chip>
    </template>

    <template #item.source="{ item }">
      <v-chip
          :color="getSourceColor(item.meta.source)"
          size="small"
          variant="outlined"
      >
        {{ item.meta.source }}
      </v-chip>
    </template>

    <template #item.status="{ item }">
      <v-icon
          :color="item.meta.disabled ? 'grey' : 'success'"
      >
        {{ item.meta.disabled ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}
      </v-icon>
    </template>

    <template #item.actions="{ item }">
      <ProxyActionMenu
          :proxy="item"
          @change-status="(disabled) => emit('changeStatus', item.data.name, disabled)"
          @show-yaml="emit('showYaml', item.data)"
          @edit="emit('editProxy', item)"
          @delete="emit('deleteProxy', item.data.name)"
          @copy-to-clipboard="(text) => emit('copyToClipboard', text)"
      />
    </template>
  </v-data-table>
</template>

<style scoped>

</style>