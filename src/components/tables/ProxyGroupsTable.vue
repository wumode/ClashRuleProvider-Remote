<script setup lang="ts">
import {PropType, ref} from "vue";
import {ProxyGroupData} from "@/components/types";
import {itemsPerPageOptions} from "@/components/constants";
import {isManual, isRegion, getProxyGroupTypeColor, isTemplate, getSourceColor} from "@/components/utils";

const props = defineProps({
  proxyGroups: {
    type: Array as PropType<ProxyGroupData[]>,
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
  (e: 'editProxyGroup', name: string): void
  (e: 'deleteProxyGroup', name: string): void
}>()

const proxyGroupHeaders = ref([
  {title: '名称', key: 'name', sortable: true},
  {title: '类型', key: 'type', sortable: false},
  {title: '来源', key: 'source', sortable: false},
  {title: '', key: 'actions', sortable: false, width: '1rem'},
]);
</script>

<template>
  <v-data-table
      class="px-4"
      :headers="proxyGroupHeaders"
      :search="search"
      :items="proxyGroups"
      :page="page"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      density="compact"
      hide-default-footer
      fixed-header
      item-key="name"
  >
    <template #item.name="{ item }">
      <v-chip size="small" pill color="secondary">{{ item.proxy_group.name }}</v-chip>
    </template>

    <template #item.type="{ item }">
      <v-chip :color="getProxyGroupTypeColor(item.proxy_group.type)" size="small" label variant="tonal">
        {{ item.proxy_group.type }}
      </v-chip>
    </template>

    <template #item.source="{ item }">
      <v-chip size="small" :color="getSourceColor(item.source)" variant="outlined">{{ item.source }}</v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-menu min-width="120">
        <template v-slot:activator="{ props }">
          <v-btn color="secondary" icon size="small" variant="text" v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item @click="emit('showYaml', item.proxy_group)">
            <template v-slot:prepend>
              <v-icon size="small" color="info">mdi-code-json</v-icon>
            </template>
            <v-list-item-title>查看配置</v-list-item-title>
          </v-list-item>
          <v-list-item
              @click="emit('editProxyGroup', item.proxy_group.name)"
              :disabled="!(isManual(item.source)||isRegion(item.source))"
          >
            <template v-slot:prepend>
              <v-icon size="small" color="primary">mdi-file-edit-outline</v-icon>
            </template>
            <v-list-item-title>编辑</v-list-item-title>
          </v-list-item>
          <v-list-item
              @click="emit('deleteProxyGroup', item.proxy_group.name)"
              :disabled="!isManual(item.source)"
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