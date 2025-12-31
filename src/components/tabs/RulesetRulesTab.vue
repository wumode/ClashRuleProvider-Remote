<script setup lang="ts">
import {computed, ref} from 'vue';
import RulesetRulesTable from '../tables/RulesetRulesTable.vue';
import RuleCard from '../cards/RuleCard.vue';
import RuleDialog from '../dialog/RuleDialog.vue';
import {itemsPerPageOptions, defaultRule} from '@/components/constants';
import {pageTitle} from '@/components/utils';
import {RuleData, RuleSetType, GeoRules} from '@/components/types';

const props = defineProps<{
  rules: RuleData[];
  rulesetPrefix: string;
  api: any;
  ruleProviderNames: string[];
  geoRules: GeoRules;
  customOutbounds: string[];
}>();

const emit = defineEmits<{
  (e: 'refresh', regions: string[]): void;
  (e: 'show-snackbar', value: any): void;
  (e: 'show-error', msg: string): void;
}>();

const searchRulesetRule = ref('');
const pageRuleset = ref(1);
const itemsPerPageRuleset = ref(10);
// 是否要分组
const group = ref(false)
// Dialog State
const ruleDialogVisible = ref(false)
const editingPriority = ref<number | null>(null)
const currentRule = ref<RuleData>({...defaultRule})
const editingType = ref<RuleSetType>('ruleset')

const filteredRulesetRules = computed(() => {
  if (!searchRulesetRule.value) return props.rules;
  const keyword = searchRulesetRule.value.toLowerCase();
  return props.rules.filter(item =>
      Object.values(item).some(val =>
          String(val).toLowerCase().includes(keyword)
      )
  );
});

const pageCountRuleset = computed(() => {
  if (itemsPerPageRuleset.value === -1) {
    return 1;
  }
  return Math.ceil(filteredRulesetRules.value.length / itemsPerPageRuleset.value);
});

const paginatedRulesetRules = computed(() => {
  const start = (pageRuleset.value - 1) * itemsPerPageRuleset.value;
  const end = start + itemsPerPageRuleset.value;
  return filteredRulesetRules.value.slice(start, end);
});

// Actions
function openAddRuleDialog() {
  editingPriority.value = null;
  const nextPriority = props.rules.length > 0
      ? props.rules[props.rules.length - 1].priority + 1
      : 0;
  currentRule.value = {...defaultRule};
  currentRule.value.priority = nextPriority;
  ruleDialogVisible.value = true;
}

function editRule(priority: number) {
  const rule = props.rules.find(r => r.priority === priority);
  if (rule) {
    editingPriority.value = priority;
    currentRule.value = {...rule};
    ruleDialogVisible.value = true;
  }
}

async function deleteRule(priority: number) {
  try {
    await props.api.delete(`/plugin/ClashRuleProvider/rules/ruleset/${priority}`);
    emit('refresh', ["top", "ruleset"]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '删除规则失败');
    }
  }
}

async function deleteRules(priorities: number[]) {
  try {
    await props.api.delete('/plugin/ClashRuleProvider/rules/ruleset', { data: { rules_priority: priorities } });
    emit('refresh', ["top", "ruleset"]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '批量删除规则失败');
    }
  }
}

async function handleReorderRule(targetPriority: number, movedPriority: number) {
  await props.api.put(`/plugin/ClashRuleProvider/reorder-rules/ruleset/${targetPriority}`, {"moved_priority": movedPriority});
  emit('refresh', ["top", "ruleset"]);
}

async function handleStatusChange(priority: number, disabled: boolean) {
  try {
    await props.api.post(`/plugin/ClashRuleProvider/rules/ruleset/metadata/disabled`, {
        [priority]: disabled
    });
    emit('refresh', ["top", "ruleset"]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '更新规则状态失败');
    }
  }
}

async function handleBatchStatusChange(priorities: number[], disabled: boolean) {
  try {
    const payload = priorities.reduce((acc, p) => ({ ...acc, [p]: disabled }), {});
    await props.api.post(`/plugin/ClashRuleProvider/rules/ruleset/metadata/disabled`, payload);
    emit('refresh', ["top", "ruleset"]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '批量更新规则状态失败');
    }
  }
}

function closeRuleDialog() {
  ruleDialogVisible.value = false;
}
</script>

<template>
  <div class="mb-2">
    <!-- 顶部工具栏 -->
    <div class="pa-4">
      <v-row align="center" no-gutters>
        <v-col cols="10" sm="6" class="d-flex justify-start">
          <v-text-field
              v-model="searchRulesetRule"
              label="搜索规则"
              clearable
              density="compact"
              variant="solo-filled"
              hide-details
              class="search-field"
              prepend-inner-icon="mdi-magnify"
              flat
              rounded="pill"
              single-line
          />
        </v-col>
        <v-col cols="2" sm="6" class="d-flex justify-end">
          <v-btn-group variant="outlined" rounded divided>
            <v-btn
                class="d-none d-sm-flex"
                :icon="group ? 'mdi-format-list-bulleted' : 'mdi-format-list-group'"
                @click="group = !group"
            />
            <v-btn @click="openAddRuleDialog" icon="mdi-plus"></v-btn>
          </v-btn-group>
        </v-col>
      </v-row>
    </div>
    <!-- 桌面端表格 -->
    <div class="d-none d-sm-flex clash-data-table">
      <RulesetRulesTable
          :group="group"
          :sorted-rules="rules"
          :page="pageRuleset"
          :items-per-page="itemsPerPageRuleset"
          :ruleset-prefix="rulesetPrefix"
          :search-rule="searchRulesetRule"
          @edit="editRule"
          @delete="deleteRule"
          @delete-batch="deleteRules"
          @reorder="handleReorderRule"
          @change-status="handleStatusChange"
          @change-status-batch="handleBatchStatusChange"
      ></RulesetRulesTable>
    </div>
    <!-- 移动端卡片 -->
    <div class="d-sm-none">
      <v-row>
        <v-col
            v-for="item in paginatedRulesetRules"
            :key="item.priority"
            cols="12"
        >
          <RuleCard
              ruleset="ruleset"
              :rule="item"
              @delete="deleteRule"
              @edit="editRule"
          ></RuleCard>
        </v-col>
      </v-row>
    </div>
    <div class="pa-4" style="min-height: 4rem;">
      <v-row align="center" no-gutters>
        <v-col cols="2" md="2">
          <div id="ruleset-rules-table-batch-actions"></div>
        </v-col>
        <v-col cols="8" md="8" class="d-flex justify-center">
          <v-pagination
              v-model="pageRuleset"
              :length="pageCountRuleset"
              total-visible="5"
              rounded="circle"
              class="d-none d-sm-flex my-0"
          />
          <!-- 移动端分页器：只在 sm 以下显示 -->
          <v-pagination
              v-model="pageRuleset"
              :length="pageCountRuleset"
              total-visible="0"
              rounded="circle"
              class="d-sm-none my-0"
          />
        </v-col>
        <v-col cols="2" md="2" class="d-flex justify-end">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon rounded="circle" variant="tonal">
                {{ pageTitle(itemsPerPageRuleset) }}
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                  v-for="(item, index) in itemsPerPageOptions"
                  :key="index"
                  :value="item.value"
                  @click="itemsPerPageRuleset = item.value"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </div>
    <v-divider></v-divider>
    <!-- 说明文字 -->
    <div class="text-caption text-grey mt-2">
      * 对规则集的修改会在 Clash 中立即生效。
    </div>

    <RuleDialog
        v-model="ruleDialogVisible"
        v-if="ruleDialogVisible"
        :initial-rule="currentRule"
        :is-adding="editingPriority === null"
        :editing-type="editingType"
        :rule-provider-names="ruleProviderNames"
        :geo-rules="geoRules"
        :custom-outbounds="customOutbounds"
        :api="api"
        @refresh="(v: string[]) => emit('refresh', v)"
        @show-snackbar="(val) => emit('show-snackbar', val)"
        @show-error="(msg) => emit('show-error', msg)"
        @close="closeRuleDialog"
    ></RuleDialog>
  </div>
</template>

<style scoped>
</style>