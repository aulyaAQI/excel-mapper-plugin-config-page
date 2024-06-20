import {defineStore} from 'pinia';
import {useExcelStore} from './ExcelStore';

export function getDefaultMapObject() {
  return {
    mapTo: null,
    fieldCode: null,
    fieldType: null,
    isTableField: false,
    mapFrom: null,
    mapFromUntil: null,
    split: false,
    startLine: 0,
    endLine: null,
    parentTable: null,
  };
}

export const useConfigStore = defineStore({
  id: 'config',
  state: () => ({
    destinationApp: null,
    sourceAttachmentField: null,
    sourceReferenceField: '$id',
    destinationReferenceHolder: null,
    destinationExcelNameHolder: null,
    mapperList: [getDefaultMapObject()],
    //
    hasConfig: false,
    editMode: false,
  }),
  actions: {
    addMapper() {
      this.mapperList.push(getDefaultMapObject());
    },
    removeMapper(index) {
      if (this.mapperList.length === 1) {
        alert('Cannot remove the last mapper');

        return;
      }

      this.mapperList.splice(index, 1);
    },
    setDefaultMapperListFromDropDownFields(fields) {
      this.mapperList = [];

      this.mapperList = fields.map((field) => ({
        mapTo: field,
        fieldCode: field.code,
        fieldType: field.type,
        isTableField: field.isTableField,
        mapFrom: null,
        split: false,
        startLine: null,
        parentTable: field.parentTable,
      }));
    },
    saveConfig() {
      if (!this.destinationApp?.appId) {
        alert('Please select the destination app');
        return;
      }

      if (!this.sourceAttachmentField?.code) {
        alert('Please select the source attachment field');
        return;
      }

      if (!this.destinationReferenceHolder?.code) {
        alert('Please select the destination reference holder');
        return;
      }

      if (!this.destinationExcelNameHolder?.code) {
        alert('Please select the destination excel name holder');
        return;
      }

      const config = {
        mapperList: JSON.stringify(this.mapperList),
        destinationApp: JSON.stringify(this.destinationApp),
        sourceAttachmentField: JSON.stringify(this.sourceAttachmentField),
        sourceReferenceField: this.sourceReferenceField,
        destinationReferenceHolder: JSON.stringify(this.destinationReferenceHolder),
        destinationExcelNameHolder: JSON.stringify(this.destinationExcelNameHolder),
      };

      console.log({config});

      if (typeof kintone !== 'undefined') {
        // eslint-disable-next-line no-undef
        kintone.plugin.app.setConfig(config, () => {
          alert('The plug-in settings have been saved. Please update the app!');
          // eslint-disable-next-line no-undef
          window.location.href = '../../flow?app=' + kintone.app.getId();
        });
      } else {
        alert('not in kintone env');
      }
    },
    setDestinationApp(app) {
      this.destinationApp = app;
    },
    setSourceAttachmentField(field) {
      this.sourceAttachmentField = field;
    },
    setMapperList(mapperList) {
      this.mapperList = mapperList;
    },
    setSourceReferenceField(field) {
      this.sourceReferenceField = field;
    },
    setDestinationReferenceHolder(field) {
      this.destinationReferenceHolder = field;
    },
    setDestinationExcelNameHolder(field) {
      this.destinationExcelNameHolder = field;
    },
    resetMapToAndMapFrom() {
      this.mapperList = this.mapperList.map((mapper) => ({
        ...mapper,
        mapFromUntil: null,
        mapFrom: null,
      }));
    },
    getPreview(mapper) {
      const excelStore = useExcelStore();
      const excelData = excelStore.readableData;

      const {mapFrom, mapFromUntil, split, startLine, endLine} = mapper;

      if (mapFrom?.rowNumber && mapFromUntil?.rowNumber) {
        mapper.split = false;
        const filteredData = excelData.filter(
          (cell) => cell.rowNumber >= mapFrom.rowNumber && cell.rowNumber <= mapFromUntil.rowNumber && cell.colNumber === mapFrom.colNumber,
        );

        console.log({filteredData});

        return filteredData.map((cell) => cell.cellValue).join('\n');
      }

      if (!mapFrom?.cellAddress) {
        mapper.split = false;
        mapper.startLine = null;
        mapper.endLine = null;
        return '';
      }

      if (!split) {
        mapper.split = false;
        mapper.startLine = null;
        mapper.endLine = null;
        return mapFrom?.cellValue;
      }

      if (split) {
        const splitString = mapFrom?.cellValue.split('\n');

        let joinString = splitString.slice(startLine - 1).join('\n');

        if (!startLine && !endLine) {
          joinString = splitString.join('\n');
        }

        if (!startLine && endLine) {
          joinString = splitString.slice(0, endLine).join('\n');
        }

        if (startLine && !endLine) {
          joinString = splitString.slice(startLine - 1).join('\n');
        }

        if (startLine && endLine) {
          joinString = splitString.slice(startLine - 1, endLine).join('\n');
        }

        return joinString;
      }

      return mapFrom?.cellValue;
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
    },
  },
});
