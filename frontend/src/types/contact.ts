export type ContactType = 'EMPLOYEE' | 'FREELANCE'

export interface CompanySummary {
  id: number
  name: string | null
  vatNumber: string
}

export interface Contact {
  id: number
  firstName: string
  lastName: string
  address: string
  type: ContactType
  vatNumber: string | null
  companies: CompanySummary[]
}

export interface ContactRequest {
  firstName: string
  lastName: string
  address: string
  type: ContactType
  vatNumber: string | null
}
