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
  (e: 'reorder', targetPriority: number, movedPriority: number, type: RuleSetType): void
}>()

const headers = ref([
  {title: '', key: 'handler', sortable: false, width: '1rem'},
  {title: '优先级', key: 'priority', sortable: true},
  {title: '类型', key: 'type', sortable: true},
  {title: '内容', key: 'payload', sortable: true},
  {title: '出站', key: 'action', sortable: false},
  {title: '日期', key: 'time_modified', sortable: true},
  {title: '', key: 'actions', sortable: false, width: '1rem'},
]);

const dragEnabled = ref(false);
const hoveredPriority = ref<number>(-1);
const ruleset = "top"
const dragItem = ref<RuleData | null>(null);

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

const rowProps = (data: any) => {
  const item = data.item as RuleData;
  return {
    class: {
      'drop-over': item.priority === hoveredPriority.value,
      'dragging-item': dragItem.value?.priority === item.priority,
      'list-row': true
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
      density="compact"
      hide-default-footer
      fixed-header
      :row-props="rowProps"
  >
    <template #item.handler="{ }">
      <v-icon
          class="drag-handle"
          @mouseenter="dragEnabled = true"
          @mouseleave="dragEnabled = false"
      >mdi-drag-horizontal-variant
      </v-icon>
    </template>
    <template #item.priority="{ item }">
      {{ item.priority }}
    </template>

    <template #item.type="{ item }">
      <v-chip :color="getRuleTypeColor(item.type)" size="small" label>
        {{ item.type }}
      </v-chip>
    </template>

    <template #item.action="{ item }">
      <v-chip :color="getActionColor(item.action)" size="small" label>
        {{ item.action }}
      </v-chip>
    </template>

    <template #item.time_modified="{ item }">
      {{ item?.time_modified ? timestampToDate(item.time_modified) : '' }}
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