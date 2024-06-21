<script setup>
// import {useConfigStore} from '@/stores/';
import {useConfigStore} from '@/stores/ConfigStore';
import {useDropDownStore} from './stores/DropDownStore';
import {useExcelStore} from './stores/ExcelStore';
import {storeToRefs} from 'pinia';
import {onMounted, watch} from 'vue';
import Multiselect from 'vue-multiselect';

const configStore = useConfigStore();
const dropDownStore = useDropDownStore();
const excelStore = useExcelStore();

const {
  mapperList,
  destinationApp,
  sourceAttachmentField,
  sourceReferenceField,
  destinationReferenceHolder,
  destinationExcelNameHolder,
  hasConfig,
  editMode,
} = storeToRefs(configStore);
const {fields, apps, sourceAttachmentFields, excelTemplateCells, isEmptyExcelTemplateCells} = storeToRefs(dropDownStore);

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

onMounted(() => {
  console.log('mounted');

  dropDownStore.fetchDropDownApps();
  dropDownStore.fetchDropDownAttachmentFields();

  if (typeof kintone !== 'undefined') {
    // eslint-disable-next-line no-undef
    const config = kintone.plugin.app.getConfig(kintone.$PLUGIN_ID);
    console.log({config});
    hasConfig.value = !isEmpty(config);

    if (hasConfig.value) {
      const destinationApp = JSON.parse(config.destinationApp);
      const sourceAttachmentField = JSON.parse(config.sourceAttachmentField);
      const mapperList = JSON.parse(config.mapperList);
      const sourceReferenceField = config.sourceReferenceField;
      const destinationReferenceHolder = JSON.parse(config.destinationReferenceHolder);
      const destinationExcelNameHolder = JSON.parse(config.destinationExcelNameHolder);

      console.log({destinationApp, sourceAttachmentField, mapperList});

      configStore.setDestinationApp(destinationApp);
      configStore.setSourceAttachmentField(sourceAttachmentField);
      configStore.setMapperList(mapperList);
      configStore.setSourceReferenceField(sourceReferenceField);
      configStore.setDestinationReferenceHolder(destinationReferenceHolder);
      configStore.setDestinationExcelNameHolder(destinationExcelNameHolder);
    }
  }
});

watch(destinationApp, (newVal, oldVal) => {
  console.log('destinationApp', newVal, oldVal);

  if (hasConfig.value && !editMode.value) {
    return;
  }

  if (!newVal?.appId) {
    mapperList.value = [];

    return;
  }

  dropDownStore.fetchDropDownFields(newVal.appId).then((fields) => {
    configStore.setDefaultMapperListFromDropDownFields(fields);
  });
});
</script>

<template>
  <div class="main-container container">
    <div class="row mb-3">
      <div class="col">
        <div class="card mb-3">
          <div class="card-header">Plugin Settings</div>
          <div class="card-body">
            <p>
              This plugin is intended to be used to import data from an Excel file to a Kintone app. The plugin will map the data from the Excel file
              to the fields in the Kintone app.
            </p>
            <p>Important notes:</p>
            <ul>
              <li>
                You need to create a new field in the destination app to store the (source's Record Number) from the source app (preferably a lookup
                field).
              </li>
              <li>You need to create a new field in the destination app to store the reference (Excel's file name).</li>
              <li>You need to have a field in the source app to store the Excel file as an attachment.</li>
              <li>The uploaded file should be in .xlsx format.</li>
            </ul>
            <p>Steps to use the plugin:</p>
            <ol>
              <li>Select the destination app where the data will be imported.</li>
              <li>Select the attachment field in the source app where the Excel files will be uploaded.</li>
              <li>
                Select the reference field in the destination app to store the ID of source app. It is recommended for you to create a new field in
                the destination app to store the reference from the source app (preferably a lookup field).
              </li>
              <li>Select the reference field in the destination app that will be used to store the reference from the Excel file.</li>
              <li>Upload an Excel file template that will be used to map the fields in the Excel file to the fields in the destination app.</li>
              <li>Map the fields from the Excel file to the fields in the destination app. For each field, specify the following:</li>
              <ul>
                <li>Map to field in the destination app.</li>
                <li>Map from cells in the Excel file.</li>
                <li>
                  For table fields, specify the Map From and Map Until fields. Note that for the Map Until field, the value should be range of cells
                  right below the Map From cell (in the same row).
                </li>
                <li>
                  For value from excel's cell that needs to be split, check the Split checkbox and specify the Start Line and End Line. The split will
                  be based on the new line character.
                </li>
                <li>Preview the data that will be imported to the destination app according to the Excel file you have uploaded.</li>
                <li>Click the "+" button to add a new mapper. Click the "-" button to remove the mapper.</li>
              </ul>
              <li>Click the "Save" button to save the configuration.</li>
            </ol>
            <p>
              The plugin will then be available in the source app to import the data from the Excel files to the destination app according to the
              configuration.
            </p>
          </div>
          <div class="card-footer">
            <div d-flex flex-row>
              <button type="button" class="btn btn-primary action-button" @click.prevent="configStore.saveConfig()">Save</button>
              <button type="button" class="btn btn-info action-button ms-2" @click.prevent="configStore.toggleEditMode" v-if="hasConfig">
                {{ configStore.editMode ? 'Cancel Edit' : 'Edit' }}
              </button>
              <button type="button" class="btn btn-secondary action-button ms-2" @click.prevent="() => history.back()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-sm-6">
        <div class="card mb-3">
          <div class="card-header">Destination App Settings</div>
          <div class="card-body">
            <div class="row section upper-form-section mb-3">
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="select-destinationApp" class="form-label">Destination App Name</label>
                    <Multiselect
                      id="select-destinationApp"
                      v-model="destinationApp"
                      :options="apps.options"
                      trackBy="appId"
                      label="label"
                      placeholder="Select App"
                      :loading="apps.isLoading"
                      :disabled="apps.isLoading || (!editMode && hasConfig)"
                      :showLabels="false"
                    ></Multiselect>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="destination-app-id" class="form-label">Destination App Id</label>
                    <input class="form-control" id="destination-app-id" type="text" :value="destinationApp?.appId" disabled />
                  </div>
                </div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-sm-6">
                <label for="select-destinationReference" class="form-label">Destination Reference Holder (Key)</label>
                <Multiselect
                  id="select-destinationReference"
                  v-model="destinationReferenceHolder"
                  :options="fields.options"
                  trackBy="code"
                  label="label"
                  :loading="fields.isLoading"
                  :disabled="fields.isLoading || (!editMode && hasConfig) || !destinationApp?.appId"
                  :showLabels="false"
                ></Multiselect>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="destination-reference-field-code" class="form-label">Reference Field Code</label>
                    <input
                      class="form-control"
                      id="destination-reference-field-code"
                      type="text"
                      :value="destinationReferenceHolder?.code"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-6">
                <label for="excel-name-holder" class="form-label">Excel Reference Holder (Key)</label>
                <Multiselect
                  id="excel-name-holder"
                  v-model="destinationExcelNameHolder"
                  :options="fields.options"
                  trackBy="code"
                  label="label"
                  :loading="fields.isLoading"
                  :disabled="fields.isLoading || (!editMode && hasConfig) || !destinationApp?.appId"
                  :showLabels="false"
                ></Multiselect>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="excel-name-holder-field-code" class="form-label">Excel Reference Holder Code</label>
                    <input class="form-control" id="excel-name-holder-field-code" type="text" :value="destinationExcelNameHolder?.code" disabled />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-6">
        <div class="card mb-3">
          <div class="card-header">Source App Settings</div>
          <div class="card-body">
            <div class="row section upper-form-section mb-3">
              <div class="col-sm-6">
                <div class="row">
                  <label for="select-attachment" class="form-label">Attachment Field</label>
                  <div class="col">
                    <Multiselect
                      id="select-attachment"
                      v-model="sourceAttachmentField"
                      :options="sourceAttachmentFields.options"
                      trackBy="code"
                      label="label"
                      placeholder="Select Attachment Field"
                      :loading="sourceAttachmentFields.isLoading"
                      :disabled="sourceAttachmentFields.isLoading || (!editMode && hasConfig)"
                      :showLabels="false"
                    ></Multiselect>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="attachment-field-code" class="form-label">Attachment Field Code</label>
                    <input class="form-control" id="attachment-field-code" type="text" :value="sourceAttachmentField?.code" disabled />
                  </div>
                </div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col">
                <label for="formFile" class="form-label">Excel Template File</label>
                <input
                  class="form-control"
                  type="file"
                  id="formFile"
                  @change="excelStore.getUploadedFile"
                  :disabled="!editMode && hasConfig"
                  accept=".xlsx"
                />
              </div>
            </div>
            <div class="row">
              <div class="col-sm-3">
                <label for="source-reference" class="form-label">Source Reference</label>
                <input class="form-control" type="text" id="source-reference" disabled v-model="sourceReferenceField" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="container-table container" v-if="destinationApp?.appId">
    <div class="table-wrapper">
      <table class="table table-bordered">
        <colgroup>
          <col span="3" class="standard-size-col" />
          <col class="very-small-col" />
          <col span="2" class="medium-size-col" />
          <col class="very-small-col" />
          <col span="2" class="medium-size-col" />
          <col class="large-size-col" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" class="sticky-col sticky-col-1">Map to Field</th>
            <th scope="col">Field Code</th>
            <th scope="col">Field Type</th>
            <th scope="col" class="text-center">Subtable</th>
            <th scope="col">Map From</th>
            <th scope="col">Map Until</th>
            <th scope="col" class="text-center">Split</th>
            <th scope="col">Start Line</th>
            <th scope="col">End Line</th>
            <th scope="col">Preview</th>
            <th scope="col" class="col-hollow"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(mapper, mapperIndex) in mapperList" :key="mapperIndex">
            <td class="sticky-col sticky-col-1">
              <Multiselect
                v-model="mapper.mapTo"
                :options="fields.options"
                trackBy="code"
                label="label"
                :loading="fields.isLoading"
                :disabled="fields.isLoading || (!editMode && hasConfig)"
                :showLabels="false"
              ></Multiselect>
            </td>
            <td>
              <input class="form-control" type="text" :value="mapper.mapTo?.code" disabled />
            </td>
            <td>
              <input class="form-control" type="text" :value="mapper.mapTo?.type" disabled />
            </td>
            <td class="text-center">
              <input class="form-check-input big-checkbox" type="checkbox" v-model="mapper.isTableField" disabled />
            </td>
            <td>
              <Multiselect
                v-model="mapper.mapFrom"
                :options="excelTemplateCells.options"
                trackBy="cellAddress"
                label="label"
                :loading="excelTemplateCells.isLoading"
                :disabled="excelTemplateCells.isLoading || isEmptyExcelTemplateCells || (!editMode && hasConfig)"
                :showLabels="false"
              ></Multiselect>
            </td>
            <td>
              <Multiselect
                v-model="mapper.mapFromUntil"
                :options="excelTemplateCells.options"
                trackBy="cellAddress"
                label="label"
                :loading="excelTemplateCells.isLoading"
                :disabled="excelTemplateCells.isLoading || isEmptyExcelTemplateCells || !mapper.isTableField || (!editMode && hasConfig)"
                :showLabels="false"
              ></Multiselect>
            </td>
            <td class="text-center">
              <input
                class="form-check-input big-checkbox"
                type="checkbox"
                v-model="mapper.split"
                :disabled="!mapper.mapFrom?.cellAddress || (!editMode && hasConfig)"
              />
            </td>
            <td>
              <input class="form-control" type="number" v-model="mapper.startLine" :disabled="!mapper.split || (!editMode && hasConfig)" />
            </td>
            <td>
              <input class="form-control" type="number" v-model="mapper.endLine" :disabled="!mapper.split || (!editMode && hasConfig)" />
            </td>
            <td>
              <textarea class="form-control" rows="8" cols="28" :value="configStore.getPreview(mapper)" disabled></textarea>
            </td>
            <td class="col-hollow">
              <div class="d-flex flex-row text-center" style="text-align: end">
                <a class="action" data-toggle="tooltip" data-placement="top" title="Add mapper">
                  <font-awesome-icon icon="fa-solid fa-circle-plus" size="lg" @click.prevent="configStore.addMapper()" />
                </a>
                <a class="action" data-toggle="tooltip" data-placement="top" title="Remove mapper">
                  <font-awesome-icon icon="fa-solid fa-circle-minus" size="lg" @click.prevent="configStore.removeMapper(mapperIndex)" />
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.col-hollow {
  border-top-style: hidden;
  border-right-style: hidden;
  border-bottom-style: hidden;
}

.col-hollow-right-edge {
  border-top-style: hidden;
  border-bottom-style: hidden;
  border-left-style: hidden;
}

.col-hollow-left-edge {
  border-top-style: hidden;
  border-bottom-style: hidden;
  border-right-style: hidden;
}

.single-col-hollow {
  border-top-style: hidden;
  border-bottom-style: hidden;
}

.big-checkbox {
  width: 30px;
  height: 30px;
}

.action {
  margin: 0 2px;
}

.action:hover {
  cursor: pointer;
}

.action-container {
  text-align: center;
}

input[type='number'] {
  /* width: 50px; */
}

.table-wrapper {
  overflow-x: auto;
  height: 80vh;
}

table {
  /* table-layout: fixed; */
  min-width: 2000px;
  /* transform: scale(2); */
  word-wrap: break-word;
}

.sticky-col {
  position: -webkit-sticky;
  position: sticky;
  left: 0;
  background-color: white;
  z-index: 2;
}

.sticky-col-1 {
  left: 0;
  z-index: 2;
}

th:not(:last-child) {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background-color: gray !important;
  z-index: 2;
}

th:first-child {
  z-index: 3;
}

.standard-size-col {
  width: 200px;
}
</style>
