import ContactInfoService from '@/services/ContactInfoService';
import type { Address, ContactInfo } from '@/types/ContactInfo';
import type {
  SpreadsheetDownloadColumn,
  SpreadsheetDownloadWorkbook,
} from '@/types/SpreadsheetDownload';
import { getFormattedDate } from '@/utils/dateFormatter';
import { downloadSpreadsheet } from '@/utils/spreadsheetDownloader';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';

const contactInfoColumns: Array<SpreadsheetDownloadColumn<ContactInfo>> = [
  {
    key: 'firstName',
    label: 'First Name',
  },
  {
    key: 'lastName',
    label: 'Last Name',
  },
  {
    key: 'age',
    label: 'Age',
    render: (age: number | undefined) => (age !== undefined ? age.toString() : 'N/A'),
  },
  {
    key: 'hireDate',
    label: 'Hire Date',
    render: (hireDate: string) => getFormattedDate(hireDate, 'MM/dd/yyyy'),
  },
  {
    key: 'address',
    altKey: 'street1',
    label: 'Address Line 1',
    render: (address: Address) => address.street1,
  },
  {
    key: 'address',
    altKey: 'street2',
    label: 'Address Line 2',
    width: 100,
    render: (address: Address) => address?.street2 ?? '',
  },
  {
    key: 'address',
    altKey: 'city',
    label: 'City',
    render: (address: Address) => address.city,
  },
  {
    key: 'address',
    altKey: 'state',
    label: 'State',
    render: (address: Address) => address?.state ?? '',
  },
  {
    key: 'address',
    altKey: 'country',
    label: 'Country',
    render: (address: Address) => address.country,
  },
];

function Spreadsheet() {
  const { enqueueSnackbar } = useSnackbar();
  const [fileLoading, setFileLoading] = useState<boolean>(false);

  const handleDownloadClick = useCallback(() => {
    setFileLoading(true);

    ContactInfoService.getContactInfo()
      .then((contactInfoList: ContactInfo[]) => {
        const workbook: SpreadsheetDownloadWorkbook<ContactInfo> = {
          filename: 'react-hook-spreadsheet',
          worksheets: [
            {
              list: contactInfoList,
              worksheetName: 'Contact Info',
              columns: contactInfoColumns,
              defaultColumnWidth: 'auto',
            },
          ],
        };

        downloadSpreadsheet(workbook);

        setFileLoading(false);

        enqueueSnackbar('File downloaded!', {
          variant: 'success',
        });
      })
      .catch((errorMessage: string) => {
        enqueueSnackbar(`An error occurred: ${errorMessage}`, {
          variant: 'error',
        });
        setFileLoading(false);
      });
  }, [downloadSpreadsheet, enqueueSnackbar]);

  return (
    <button className="btn" onClick={handleDownloadClick} disabled={fileLoading}>
      CLICK TO DOWNLOAD CONTACT INFO
    </button>
  );
}

export default Spreadsheet;
