import {defineStore} from 'pinia';
import {useDropDownStore} from './DropDownStore';
import {useConfigStore} from './ConfigStore';
import * as ExcelJS from 'exceljs';

export const useExcelStore = defineStore({
  id: 'excel',
  state: () => ({
    workbook: null,
    worksheet: null,
    readableData: [],
  }),
  actions: {
    async getUploadedFile(event) {
      const {excelTemplateCells} = useDropDownStore();
      const {resetMapToAndMapFrom} = useConfigStore();
      excelTemplateCells.isLoading = true;

      console.log({event});
      const file = event.target.files[0];
      const fileType = file.type;
      console.log({file, fileType});

      if (file === undefined || fileType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        if (fileType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') alert('Upload only .xlsx!');
        console.log('yop');
        event.target.value = '';
        const input = document.getElementById('formFile');
        input.parentNode.replaceChild(input.cloneNode(), input);
        excelTemplateCells.isLoading = false;
        excelTemplateCells.options = [];

        resetMapToAndMapFrom();

        return;
      }

      const readableData = await this.readExcel(file);
      this.readableData = readableData;

      this.generateDropDownCells();
      excelTemplateCells.isLoading = false;
    },
    async generateDropDownCells() {
      const {excelTemplateCells} = useDropDownStore();
      const {readableData} = this;
      console.log({readableData});

      excelTemplateCells.options = readableData.map((cell) => ({
        label: cell.cellAddress,
        cellAddress: cell.cellAddress,
        colNumber: cell.colNumber,
        rowNumber: cell.rowNumber,
        cellValue: cell.cellValue,
      }));
    },
    async readExcel(file) {
      console.log({file});
      const workbook = new ExcelJS.Workbook();
      console.log({workbook});
      try {
        await workbook.xlsx.load(file);
      } catch (error) {
        console.log({error});
      }
      console.log({workbook});

      const worksheet = workbook.getWorksheet(1);

      const readableData = this.mapWorkSheetToReadableData(worksheet);
      // const groupedRowReadableData = groupByRowNumber(readableData);
      console.log({readableData});

      return readableData;
    },
    mapWorkSheetToReadableData(worksheet) {
      const mapped = [];
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell({includeEmpty: true}, (cell, colNumber) => {
          const cellAddress = cell.address;
          const cellValue = this.mapCellValue(cell);

          // if (cellValue === null) return;

          // console.log({cell, rowNumber, cellValue, cellAddress, ori: cell.value});

          mapped.push({
            rowNumber,
            cellValue,
            cellAddress,
            colNumber,
          });
        });
      });

      return mapped;
    },
    mapCellValue(cell) {
      let cellValue = cell.value;

      if (typeof cellValue === 'object') {
        if (cellValue?.richText) {
          cellValue = cellValue.richText.map((part) => part.text).join('');
        }

        if (cellValue?.formula) {
          cellValue = cellValue?.result;
        }

        if (cellValue?.sharedFormula) {
          cellValue = cellValue?.result;
        }
      }

      return cellValue;
    },
  },
});
