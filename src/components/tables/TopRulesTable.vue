<script setup lang="ts">
// v-data-table 的 headers 定义
import {ref, PropType} from 'vue'
import {RuleData, RuleSetType} from "@/components/types";
import {getActionColor, getRuleTypeColor, timestampToDate, isSystemRule} from "@/components/utils";
import {itemsPerPageOptions} from "@/components/constants";

const props = defineProps({
  sortedRules: {
    type: Array as PropType<RuleData[]>,
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
  searchRule: String
})

const emit = defineEmits<{
  (e: 'edit', priority: number, type: RuleSetType): void
  (e: 'delete', priority: number, type: RuleSetType): void
  (e: 'delete-batch', priorities: number[], type: RuleSetType): void
  (e: 'reorder', targetPriority: number, movedPriority: number, type: RuleSetType): void
  (e: 'change-status', priority: number, disabled: boolean, type: RuleSetType): void
  (e: 'change-status-batch', priorities: number[], disabled: boolean, type: RuleSetType): void
}>()

const headers = ref([
  {title: '', key: 'handler', sortable: false, width: '1rem'},
  {title: '优先级', key: 'priority', sortable: true, width: '3.5rem'},
  {title: '类型', key: 'type', sortable: true},
  {title: '内容', key: 'payload', sortable: true},
  {title: '出站', key: 'action', sortable: false},
  {title: '日期', key: 'time_modified', sortable: true},
  {title: '', key: 'status', sortable: false, width: '1rem'},
  {title: '', key: 'actions', sortable: false, width: '1rem'},
]);

const dragEnabled = ref(false);
const hoveredPriority = ref<number>(-1);
const ruleset = "top"
const dragItem = ref<RuleData | null>(null);
const selected = ref<number[]>([]);

function dragStart(event: DragEvent, priority: number) {
  const item = props.sortedRules.find(r => r.priority === priority);
  if (!item) {
    event.preventDefault?.();
    return;
  }
  dragItem.value = item;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
}

function dragOver(event: DragEvent, priority: number) {
  event.preventDefault();
  hoveredPriority.value = priority
}

function drop(event: DragEvent, targetPriority: number) {
  if (dragItem.value && dragItem.value.priority !== targetPriority) {
    emit("reorder", targetPriority, dragItem.value.priority, ruleset)
  }
  dragItem.value = null;
  hoveredPriority.value = -1;
}

function dragEnd() {
  dragItem.value = null;
  hoveredPriority.value = -1;
}

function editRule(priority: number) {
  emit('edit', priority, ruleset);
}

function deleteRule(priority: number) {
  emit('delete', priority, ruleset);
}

function deleteSelected() {
  if (selected.value.length > 0) {
    emit('delete-batch', selected.value, ruleset);
    selected.value = [];
  }
}

function updateStatus(item: RuleData, disabled: boolean) {
  emit('change-status', item.priority, disabled, ruleset);
}

function changeBatchStatus(disabled: boolean) {
  if (selected.value.length > 0) {
    emit('change-status-batch', selected.value, disabled, ruleset);
    selected.value = [];
  }
}

const rowProps = (data: any) => {
  const item = data.item as RuleData;
  return {
    class: {
      'drop-over': item.priority === hoveredPriority.value,
      'dragging-item': dragItem.value?.priority === item.priority,
      'list-row': true,
      'text-grey': item.meta?.disabled
    },
    draggable: dragEnabled.value,
    onDragstart: (e: DragEvent) => dragStart(e, item.priority),
    onDragover: (e: DragEvent) => dragOver(e, item.priority),
    onDrop: (e: DragEvent) => drop(e, item.priority),
    onDragend: dragEnd
  }
}
</script>

<template>
  <v-data-table
      class="px-4"
      :headers="headers"
      :search="searchRule"
      :items="sortedRules"
      :page="page"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      item-key="priority"
      item-value="priority"
      v-model="selected"
      show-select
      density="compact"
      hide-default-footer
      fixed-header
      :row-props="rowProps"
  >
    <template #top>
      <teleport to="#top-rules-table-batch-actions" v-if="selected.length > 0">
        <v-btn-group rounded variant="tonal">
          <v-btn
              color="success"
              prepend-icon="mdi-check"
              @click="changeBatchStatus(false)"
              size="small"
          >
          </v-btn>
          <v-btn
              color="warning"
              prepend-icon="mdi-close"
              @click="changeBatchStatus(true)"
              size="small"
          >
          </v-btn>
          <v-btn
              color="error"
              prepend-icon="mdi-trash-can-outline"
              @click="deleteSelected"
              size="small"
          >
          </v-btn>
        </v-btn-group>
      </teleport>
    </template>
    <template #item.handler="{ }">
      <v-icon
          class="drag-handle"
          @mouseenter="dragEnabled = true"
          @mouseleave="dragEnabled = false"
      >mdi-drag-horizontal-variant
      </v-icon>
    </template>
    <template #item.priority="{ item }">
      <v-chip
          size="x-small"
          variant="tonal"
          color="secondary"
          class="font-weight-bold"
      >
        {{ item.priority }}
      </v-chip>
    </template>

    <template #item.type="{ item }">
      <v-chip :color="getRuleTypeColor(item.type)" size="small" label variant="tonal">
        {{ item.type }}
      </v-chip>
    </template>
    <template #item.payload="{ value }">
      <small>{{ value }}</small>
    </template>
    <template #item.action="{ item }">
      <v-chip :color="getActionColor(item.action)" size="small" variant="outlined" pill>
        {{ item.action }}
      </v-chip>
    </template>

    <template #item.time_modified="{ item }">
      <small>{{ item.meta?.time_modified ? timestampToDate(item.meta.time_modified) : '' }}</small>
    </template>
    <template #item.status="{ item }">
      <v-icon
          :color="item.meta.disabled ? 'grey' : 'success'"
      >
        {{ item.meta.disabled ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}
      </v-icon>
    </template>
    <template #item.actions="{ item }">
      <v-menu min-width="120">
        <template v-slot:activator="{ props }">
          <v-btn color="secondary" icon size="small" variant="text" v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
          <v-tooltip activator="parent" location="top" v-if="isSystemRule(item)">
            根据规则集自动添加
          </v-tooltip>
        </template>
        <v-list density="compact">
          <v-list-item @click="updateStatus(item, !item.meta?.disabled)">
            <template v-slot:prepend>
              <v-icon size="small" :color="item.meta?.disabled ? 'success' : 'warning'">
                {{ item.meta?.disabled ? 'mdi-check' : 'mdi-close' }}
              </v-icon>
            </template>
            <v-list-item-title>{{ item.meta?.disabled ? '启用' : '禁用' }}</v-list-item-title>
          </v-list-item>
          <v-list-item
              @click="editRule(item.priority)"
              :disabled="isSystemRule(item)"
          >
            <template v-slot:prepend>
              <v-icon size="small" color="primary">mdi-file-edit-outline</v-icon>
            </template>
            <v-list-item-title>编辑</v-list-item-title>
          </v-list-item>
          <v-list-item
              @click="deleteRule(item.priority)"
              :disabled="isSystemRule(item)"
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