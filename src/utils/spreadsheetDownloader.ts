import type {
  SpreadsheetDownloadColumn,
  SpreadsheetDownloadWorkbook,
  SpreadsheetDownloadWorksheet,
} from '@/types/spreadsheet.types';
import { getStringValue } from '@/utils/dateFormatter';
import Excel from 'exceljs';
import FileSaver from 'file-saver';

type ExcelJsColumn = Partial<Excel.Column>;
const INITIAL_SPACING = 10;

/**
 * Freeze Header Row and set font styling
 */
const styleHeaderRow = (ws: Excel.Worksheet): void => {
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
};

/**
 * Generate reliable deterministic keys for tracking columns
 */
const getKey = <T extends object>(column: SpreadsheetDownloadColumn<T>): string => {
  const { key, altKey } = column;
  return altKey ? `${key.toString()}_${altKey}` : key.toString();
};

/**
 * Normalized column width handler ensuring proper fallbacks.
 * Optimizes performance by executing clean length checks.
 */
const setColumnWidth = <T extends object>(
  worksheet: SpreadsheetDownloadWorksheet<T>,
  currentColumn: ExcelJsColumn,
  columnDef?: SpreadsheetDownloadColumn<T>,
): void => {
  const { defaultColumnWidth, list } = worksheet;
  const targetWidth = columnDef?.width || defaultColumnWidth;

  if (!targetWidth) return;

  // Handle explicit numeric width assignment
  if (targetWidth !== 'auto' && Number(targetWidth)) {
    currentColumn.width = Number(targetWidth);
    return;
  }

  // Handle "auto" widths dynamically based on row lengths
  if (targetWidth === 'auto') {
    const labelLength = columnDef?.label?.length ?? 0;

    currentColumn.width = list.reduce((acc: number, currentValue: T) => {
      let cellValue = '';

      if (columnDef) {
        const key = columnDef.key as keyof T;
        const rawVal = currentValue[key];
        cellValue = columnDef.render
          ? (columnDef.render(rawVal, currentValue) ?? '')
          : getStringValue(rawVal as string);
      } else {
        const key = currentColumn.key as keyof T;
        cellValue = getStringValue(currentValue[key] as string);
      }

      return Math.max(acc, labelLength, cellValue.length);
    }, INITIAL_SPACING);
  }
};

/**
 * Unifies default and custom column generations safely
 */
const prepareColumns = <T extends object>(
  worksheet: SpreadsheetDownloadWorksheet<T>,
): ExcelJsColumn[] => {
  const { columns, list } = worksheet;

  // Map explicit columns if provided
  if (columns && columns.length > 0) {
    return columns.map((columnDef) => {
      const currentColumn: ExcelJsColumn = { key: getKey(columnDef) };
      if (columnDef.label) {
        currentColumn.header = columnDef.label;
      }
      setColumnWidth(worksheet, currentColumn, columnDef);
      return currentColumn;
    });
  }

  // Guard: Safe handling when list data is completely empty
  if (!list || list.length === 0) return [];

  // Extract structural schema keys safely from primary index object
  const defaultColumns: ExcelJsColumn[] = [];
  const referenceObj = list[0];

  for (const key in referenceObj) {
    if (Object.hasOwn(referenceObj, key)) {
      const newColumn: ExcelJsColumn = { header: key, key: key };
      setColumnWidth(worksheet, newColumn);
      defaultColumns.push(newColumn);
    }
  }
  return defaultColumns;
};

/**
 * Optimized row payload factory parsing values directly
 */
const getRows = <T extends object>(worksheet: SpreadsheetDownloadWorksheet<T>) => {
  const { columns, list } = worksheet;

  return list.map((row: T) => {
    const parsedRow: Record<string, unknown> = {};

    if (columns && columns.length > 0) {
      columns.forEach((column) => {
        const { key, render } = column;
        const lKey = getKey(column);
        parsedRow[lKey] = render ? render(row[key], row) : getStringValue(row[key] as string);
      });
    } else {
      for (const key in row) {
        if (Object.hasOwn(row, key)) {
          parsedRow[key] = getStringValue(row[key] as string);
        }
      }
    }
    return parsedRow;
  });
};

/**
 * Build worksheets systematically inside Excel JS engine
 */
const buildWorksheets = <T extends object>(
  wb: Excel.Workbook,
  worksheets: SpreadsheetDownloadWorksheet<T>[],
): void => {
  worksheets.forEach((worksheet, index) => {
    const defaultSheetName = `Sheet${index + 1}`;
    const ws = wb.addWorksheet(worksheet.worksheetName ?? defaultSheetName, {});

    ws.columns = prepareColumns(worksheet);
    const rows = getRows(worksheet);
    ws.addRows(rows);

    styleHeaderRow(ws);
  });
};

/**
 * Generates and downloads an Excel spreadsheet that contains one or more worksheets.
 *
 * @example
 * // Set column definitions (optional)
 *
 * const workbookPayload: Array<SpreadsheetDownloadColumn<MyModel>> = [
 *   {
 *     key: 'id',
 *   },
 *   {
 *     key: 'firstName',
 *     label: 'First Name',
 *     width: 20, // Overrides defaultColumnWidth for this column
 *   },
 *   {
 *     key: 'lastName',
 *     label: 'Last Name',
 *     width: 'auto', // Overrides defaultColumnWidth for this column
 *     render: (lastName: string) => lastName.toUpperCase(),
 *   },
 *   {
 *     key: 'address',
 *     altKey: 'street1',
 *     label: 'Address Line 1',
 *     render: (address: Address) => address.street1,
 *   },
 * ];
 *
 * downloadSpreadsheet<MyModel>(workbookPayload);
 */
export const downloadSpreadsheet = <T extends object>(
  workbook: SpreadsheetDownloadWorkbook<T>,
): void => {
  if (!workbook) {
    throw new Error('Missing required argument [workbook].');
  }
  if (!workbook?.worksheets || workbook.worksheets.length === 0) {
    throw new Error('At least one worksheet is required.');
  }

  const wb = new Excel.Workbook();
  buildWorksheets(wb, workbook.worksheets);

  wb.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, `${workbook.filename}.xlsx`);
  });
};
