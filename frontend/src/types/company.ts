export interface ContactSummary {
  id: number
  firstName: string
  lastName: string
}

export interface Company {
  id: number
  name: string | null
  address: string
  vatNumber: string
  contacts: ContactSummary[]
}

export interface CompanyRequest {
  name: string | null
  address: string
  vatNumber: string
}
