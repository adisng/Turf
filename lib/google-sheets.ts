import 'server-only'

import { google } from 'googleapis'

export interface MarketingSheetContact {
  id: string
  name: string
  email: string
  whatsappNumber: string
  optedIn: boolean
  consentAt: string | null
  optedOutAt: string | null
}

const HEADERS = ['Contact ID', 'Name', 'Email', 'WhatsApp number', 'Marketing consent', 'Consent date', 'Opted out date', 'Last synced']

function sheetRange(tab: string, range: string) {
  return `'${tab.replace(/'/g, "''")}'!${range}`
}

function getConfiguration() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_MARKETING_SHEET_ID
  const rawCredentials = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON
  if (!spreadsheetId || !rawCredentials) return null

  try {
    return { spreadsheetId, credentials: JSON.parse(rawCredentials) }
  } catch {
    console.error('Google Sheets marketing sync is disabled: GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON is not valid JSON.')
    return null
  }
}

export async function syncMarketingContactToGoogleSheet(contact: MarketingSheetContact) {
  const config = getConfiguration()
  if (!config) return { configured: false as const }

  const auth = new google.auth.GoogleAuth({
    credentials: config.credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const sheets = google.sheets({ version: 'v4', auth })
  const tab = process.env.GOOGLE_SHEETS_MARKETING_TAB?.trim() || 'Marketing contacts'

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: config.spreadsheetId,
    fields: 'sheets.properties',
  })
  const exists = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === tab)
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: config.spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] },
    })
  }

  const headerRange = sheetRange(tab, 'A1:H1')
  const header = await sheets.spreadsheets.values.get({ spreadsheetId: config.spreadsheetId, range: headerRange })
  if (header.data.values?.[0]?.[0] !== HEADERS[0]) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: headerRange,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    })
  }

  const rowsRange = sheetRange(tab, 'A2:H')
  const rows = (await sheets.spreadsheets.values.get({ spreadsheetId: config.spreadsheetId, range: rowsRange })).data.values ?? []
  const values = [[
    contact.id,
    contact.name,
    contact.email,
    contact.whatsappNumber,
    contact.optedIn ? 'Yes' : 'No',
    contact.consentAt ?? '',
    contact.optedOutAt ?? '',
    new Date().toISOString(),
  ]]
  const existingIndex = rows.findIndex((row) => row[0] === contact.id)

  if (existingIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: rowsRange,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    })
  } else {
    const rowNumber = existingIndex + 2
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: sheetRange(tab, `A${rowNumber}:H${rowNumber}`),
      valueInputOption: 'RAW',
      requestBody: { values },
    })
  }

  return { configured: true as const }
}
