# ExcelJS React Hook Example

## ℹ️ Overview

An example React project demonstrating how to generate Excel spreadsheets using **ExcelJS** via a **custom, reusable React hook**.

## 🚀 Running the Project

```bash
npm install
npm run dev
```

## 🛠 Example Usage

```ts
const workbookPayload: Array<SpreadsheetDownloadColumn<MyModel>> = [
  {
    key: 'id',
  },
  {
    key: 'firstName',
    label: 'First Name',
    width: 20,
  },
  {
    key: 'lastName',
    label: 'Last Name',
    width: 'auto',
    render: (lastName: string) => lastName.toUpperCase(),
  },
  {
    key: 'address',
    altKey: 'street1',
    label: 'Address Line 1',
    render: (address: Address) => address.street1,
  },
];

downloadSpreadsheet<MyModel>(workbookPayload);
```

## 📄 License

MIT
