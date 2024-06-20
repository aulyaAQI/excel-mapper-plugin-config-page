import {defineStore} from 'pinia';
import {KintoneRestAPIClient} from '@kintone/rest-api-client';

const baseUrl = import.meta.env.VITE_KINTONE_BASE_URL;
console.log({baseUrl});
// eslint-disable-next-line no-undef
const thisAppId = typeof kintone === 'undefined' ? 6 : kintone.app.getId();

const clientOpt =
  typeof kintone === 'undefined'
    ? {
        baseUrl,
        auth: {
          username: import.meta.env.VITE_KINTONE_USERNAME,
          password: import.meta.env.VITE_KINTONE_PASSWORD,
        },
      }
    : {};

const client = new KintoneRestAPIClient(clientOpt);

export const useDropDownStore = defineStore({
  id: 'dropdown',
  state: () => ({
    fields: {
      options: [],
      isLoading: false,
    },
    apps: {
      options: [],
      isLoading: false,
    },
    sourceAttachmentFields: {
      options: [],
      isLoading: false,
    },
    excelTemplateCells: {
      options: [],
      isLoading: false,
    },
  }),
  getters: {
    isEmptyExcelTemplateCells: (state) => state.excelTemplateCells.options.length === 0,
  },
  actions: {
    async fetchDropDownApps() {
      this.apps.isLoading = true;
      const response = await client.app.getApps();

      this.apps.options = response.apps
        .map((app) => ({
          label: app.name,
          appId: app.appId,
        }))
        .filter((app) => app.appId !== thisAppId.toString());

      this.apps.isLoading = false;
    },
    async fetchDropDownFields(appId) {
      this.fields.isLoading = true;
      const response = await client.app.getFormFields({
        app: appId,
      });

      console.log(response);

      const subFieldsArr = [];
      let fieldsArr = Object.keys(response.properties).map((fieldCode) => {
        const field = response.properties[fieldCode];

        const type = field.type;
        const code = field.code;
        // const label = `${field.label} - ${code}`;
        const label = field.label;

        let isTableField = false;
        let parentTable = null;
        if (type === 'SUBTABLE') {
          isTableField = true;
          parentTable = code;
          const tableSubFields = Object.keys(field.fields).map((subFieldCode) => {
            const subField = field.fields[subFieldCode];

            const subType = subField.type;
            const subCode = subField.code;
            // const subLabel = `${subField.label} - ${subCode}`;
            const subLabel = subField.label;

            return {
              label: subLabel,
              type: subType,
              code: subCode,
              isTableField,
              parentTable,
            };
          });

          console.log({subFieldsArr});
          subFieldsArr.push(...tableSubFields);
        }

        return {
          label,
          type,
          code,
          isTableField,
          parentTable,
        };
      });

      fieldsArr = [...fieldsArr, ...subFieldsArr];

      const acceptedFieldType = ['SINGLE_LINE_TEXT', 'NUMBER', 'MULTI_LINE_TEXT', 'DATE'];

      fieldsArr = fieldsArr.filter((field) => acceptedFieldType.includes(field.type));

      console.log({fieldsArr});

      this.fields.options = fieldsArr;
      this.fields.isLoading = false;

      return fieldsArr;
    },
    async fetchDropDownAttachmentFields(appId = thisAppId) {
      this.sourceAttachmentFields.isLoading = true;
      const response = await client.app.getFormFields({
        app: appId,
      });

      console.log({response, appId});

      const fieldsArr = Object.keys(response.properties).map((fieldCode) => {
        const field = response.properties[fieldCode];

        const type = field.type;
        const code = field.code;
        // const label = `${field.label} - ${code}`;
        const label = field.label;

        return {
          label,
          type,
          code,
        };
      });

      const acceptedFieldType = ['FILE'];

      const attachmentFields = fieldsArr.filter((field) => acceptedFieldType.includes(field.type));

      this.sourceAttachmentFields.options = attachmentFields;
      this.sourceAttachmentFields.isLoading = false;

      return attachmentFields;
    },
  },
});
