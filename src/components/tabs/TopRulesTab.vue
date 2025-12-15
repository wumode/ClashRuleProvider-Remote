<script setup lang="ts">
import { computed, ref } from 'vue';
import TopRulesTable from '../tables/TopRulesTable.vue';
import RuleCard from '../cards/RuleCard.vue';
import RuleDialog from '../dialog/RuleDialog.vue';
import ImportRuleDialog from '../dialog/ImportRuleDialog.vue';
import { itemsPerPageOptions, defaultRule } from '@/components/constants';
import { pageTitle } from '@/components/utils';
import { RuleData, RuleSetType, GeoRules } from '@/components/types';

const props = defineProps<{
  rules: RuleData[];
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

const searchTopRule = ref('');
const page = ref(1);
const itemsPerPage = ref(10);

// Dialog State
const ruleDialogVisible = ref(false)
const importRuleDialog = ref(false)
const editingPriority = ref<number | null>(null)
const currentRule = ref<RuleData>({...defaultRule})
const editingType = ref<RuleSetType>('top')

const filteredRules = computed(() => {
  if (!searchTopRule.value) return props.rules;
  const keyword = searchTopRule.value.toLowerCase();
  return props.rules.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(keyword)
    )
  );
});

const pageCount = computed(() => {
  if (itemsPerPage.value === -1) {
    return 1;
  }
  return Math.ceil(filteredRules.value.length / itemsPerPage.value);
});

const paginatedTopRules = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRules.value.slice(start, end);
});

// Actions
function openImportRuleDialog() {
  importRuleDialog.value = true;
}

function openAddRuleDialog() {
  editingPriority.value = null;
  const nextPriority = props.rules.length > 0
      ? props.rules[props.rules.length - 1].priority + 1
      : 0;
  currentRule.value = {...defaultRule};
  currentRule.value.priority = nextPriority;
  ruleDialogVisible.value = true;
}

function closeRuleDialog() {
  ruleDialogVisible.value = false;
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
    await props.api.delete(`/plugin/ClashRuleProvider/rules/top/${priority}`);
    emit('refresh', ["top", "ruleset"]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '删除规则失败');
    }
  }
}

async function handleReorderRule(targetPriority: number, movedPriority: number) {
  await props.api.put(`/plugin/ClashRuleProvider/reorder-rules/top/${targetPriority}`, {"moved_priority": movedPriority});
  emit('refresh', ["top", "ruleset"]);
}

</script>

<template>
  <div class="mb-2">
    <div class="pa-4">
      <v-row align="center" no-gutters>
        <v-col cols="8" sm="6" class="d-flex justify-start">
          <!-- 搜索框 -->
          <v-text-field
            v-model="searchTopRule"
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
          ></v-text-field>
        </v-col>
        <v-col cols="4" sm="6" class="d-flex justify-end">
          <v-btn-group divided variant="outlined" rounded>
            <v-btn
                @click="openImportRuleDialog"
                icon="mdi-import"
            ></v-btn>
            <v-btn
                @click="openAddRuleDialog"
                icon="mdi-plus"
            ></v-btn>
          </v-btn-group>

        </v-col>
      </v-row>
    </div>
    <div class="d-none d-sm-flex clash-data-table">
      <TopRulesTable
        :sorted-rules="rules"
        :page="page"
        :items-per-page="itemsPerPage"
        :search-rule="searchTopRule"
        @edit="editRule"
        @delete="deleteRule"
        @reorder="handleReorderRule"
      ></TopRulesTable>
    </div>
    <!-- 移动端卡片 -->
    <div class="d-sm-none">
      <v-row>
        <v-col
          v-for="item in paginatedTopRules"
          :key="item.priority"
          cols="12"
        >
          <RuleCard
            ruleset="top"
            :rule="item"
            @delete="deleteRule"
            @edit="editRule"
          >
          </RuleCard>
        </v-col>
      </v-row>
    </div>
    <div class="pa-4" style="min-height: 4rem;">
      <v-row align="center" no-gutters>
        <v-col cols="2" md="1">
        </v-col>
        <v-col cols="8" md="10" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="pageCount"
            total-visible="5"
            rounded="circle"
            class="d-none d-sm-flex my-0"
          />
          <v-pagination
            v-model="page"
            :length="pageCount"
            total-visible="0"
            rounded="circle"
            class="d-sm-none my-0"
          />
        </v-col>
        <v-col cols="2" md="1" class="d-flex justify-end">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon rounded="circle" variant="tonal">
                {{ pageTitle(itemsPerPage) }}
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                v-for="(item, index) in itemsPerPageOptions"
                :key="index"
                :value="item.value"
                @click="itemsPerPage = item.value"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </div>
    <v-divider></v-divider>
    <div class="text-caption text-grey mt-2">
      *置顶规则用于管理来自规则集的匹配规则，这些规则会动态更新。
    </div>
    <div class="text-caption text-grey mt-2">
      *对置顶规则的修改只有Clash更新配置后才会生效。
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
    <ImportRuleDialog
        v-model="importRuleDialog"
        :api="api"
        @refresh="emit('refresh', ['top'])"
        @show-snackbar="(val) => emit('show-snackbar', val)"
        @show-error="(msg) => emit('show-error', msg)"
    />
  </div>
</template>

<style scoped>
</style>