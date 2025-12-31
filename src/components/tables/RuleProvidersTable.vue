<script setup lang="ts">
import {PropType, ref} from "vue";
import {RuleProviderData} from "@/components/types";
import {itemsPerPageOptions} from "@/components/constants";
import {
  isManual,
  getBehaviorColor,
  isTemplate,
  getSourceColor,
  getRuleTypeColor,
  getFormatColor
} from "@/components/utils";

const headersRuleProviders = ref([
  {title: '名称', key: 'name', sortable: true},
  {title: '类型', key: 'type', sortable: true},
  {title: '行为', key: 'behavior', sortable: false},
  {title: '格式', key: 'format', sortable: false},
  {title: '来源', key: 'source', sortable: false},
  {title: '', key: 'actions', sortable: false, width: '1rem'},
]);

const props = defineProps({
  ruleProviders: {
    type: Array as PropType<RuleProviderData[]>,
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
  (e: 'editRuleProvider', name: string): void
  (e: 'deleteRuleProvider', name: string): void
}>()
</script>

<template>
  <v-data-table
      :headers="headersRuleProviders"
      :items="ruleProviders"
      :search="search"
      :page="page"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      item-key="name"
      class="px-4"
      density="compact"
      hide-default-footer
      fixed-header
  >
    <template #item.name="{ item }">
      <v-chip size="small" pill color="secondary">{{ item.name }}</v-chip>
    </template>
    <template #item.type="{ item }">
      <v-chip size="small" label variant="tonal" color="primary">
        {{ item.rule_provider.type }}
      </v-chip>
    </template>

    <template #item.behavior="{ item }">
      <v-chip v-if="item.rule_provider?.behavior" :color="getBehaviorColor(item.rule_provider.behavior)" size="small" label variant="tonal">
        {{ item.rule_provider.behavior }}
      </v-chip>
    </template>

    <template #item.format="{ item }">
      <v-chip :color="getFormatColor(item.rule_provider.format)" size="small" label variant="tonal">
        {{ item.rule_provider.format }}
      </v-chip>
    </template>

    <template #item.source="{ item }">
      <v-chip
          :color="getSourceColor(item.source)"
          size="small"
          variant="outlined"
      >
        {{ item.source }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-menu min-width="120">
        <template v-slot:activator="{ props }">
          <v-btn color="secondary" icon size="small" variant="text" v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
          <v-tooltip activator="parent" location="top" v-if="!isManual(item.source)">
            非手动添加
          </v-tooltip>
        </template>
        <v-list density="compact">
          <v-list-item
              @click="emit('editRuleProvider', item.name)"
              :disabled="!isManual(item.source)"
          >
            <template v-slot:prepend>
              <v-icon size="small" color="primary">mdi-file-edit-outline</v-icon>
            </template>
            <v-list-item-title>编辑</v-list-item-title>
          </v-list-item>
          <v-list-item
              @click="emit('deleteRuleProvider', item.name)"
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