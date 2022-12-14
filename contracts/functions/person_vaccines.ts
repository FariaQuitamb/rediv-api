import moment from 'moment'

interface Covid {
  personId: number
  vaccinationId: number
  name: string
  genre: string
  birthday: string
  phone: string
  docTypeId: number
  nationalityId: number
  provinceId: number
  municipalityId: number
  docId: string
  registeredAt: string
  code: string
  codeNum: string
  cardNumber: string
  vaccine: string
  createdAt: string
  vaccinationType: string
  batch: string
  manufacturer: string
  dose: string
  province: string
  namePVAR: string
  nameEA: string
  nameEM: string
}

interface Treatment {
  personId: number
  treatmentId: number
  name: string
  genre: string
  birthday: string
  phone: string
  docId: string
  docTypeId: number
  nationalityId: number
  provinceId: number
  municipalityId: number
  code: string
  registeredAt: string
  codeNum: string
  cardNumber: string
  vaccine: string
  createdAt: string
  dose: string
  province: string
  namePVAR: string
  nameEA: string
  nameEM: string
  campaignId: number
}

interface Vaccine {
  appliedTreatmentId: number
  vaccinationId: number
  type: string
  vaccine: string
  createdAt: string
  vaccinationType: string
  batch: string
  manufacturer: string
  dose: string
  province: string
  vaccinationPost: string
}

interface Person {
  personId: number
  name: string
  genre: string
  birthday: string
  phone: string
  docId: string
  docTypeId: number
  nationalityId: number
  provinceId: number
  municipalityId: number
  code: string
  codeNum: string
  cardNumber: string
  registeredAt: string
}

const personVaccines = (covidVaccines: Covid[], treatemts: Treatment[]) => {
  const hasCovidVaccines = covidVaccines.length > 0

  const person: Person = {
    personId: hasCovidVaccines ? covidVaccines[0].personId : treatemts[0].personId,
    name: hasCovidVaccines ? covidVaccines[0].name : treatemts[0].name,
    genre: hasCovidVaccines ? covidVaccines[0].genre : treatemts[0].genre,
    birthday: hasCovidVaccines ? covidVaccines[0].birthday : treatemts[0].birthday,
    phone: hasCovidVaccines ? covidVaccines[0].phone : treatemts[0].phone,
    docId: hasCovidVaccines ? covidVaccines[0].docId : treatemts[0].docId,
    code: hasCovidVaccines ? covidVaccines[0].code : treatemts[0].code,
    codeNum: hasCovidVaccines ? covidVaccines[0].codeNum : treatemts[0].codeNum,
    cardNumber: hasCovidVaccines ? covidVaccines[0].cardNumber : treatemts[0].cardNumber,
    registeredAt: hasCovidVaccines ? covidVaccines[0].registeredAt : treatemts[0].registeredAt,
    docTypeId: hasCovidVaccines ? covidVaccines[0].docTypeId : treatemts[0].docTypeId,
    nationalityId: hasCovidVaccines ? covidVaccines[0].nationalityId : treatemts[0].nationalityId,
    provinceId: hasCovidVaccines ? covidVaccines[0].provinceId : treatemts[0].provinceId,
    municipalityId: hasCovidVaccines
      ? covidVaccines[0].municipalityId
      : treatemts[0].municipalityId,
  }

  let vaccines: Vaccine[] = []

  covidVaccines.map((vaccine) => {
    const auxVaccine: Vaccine = {
      type: 'covid',
      vaccinationId: vaccine.vaccinationId,
      appliedTreatmentId: 0,
      vaccine: vaccine.vaccine,
      createdAt: vaccine.createdAt,
      vaccinationType: vaccine.vaccinationType,
      batch: vaccine.batch,
      manufacturer: vaccine.manufacturer,
      dose: vaccine.dose,
      province: vaccine.province,
      vaccinationPost: `${vaccine.nameEM} ${vaccine.nameEA} ${vaccine.namePVAR}`,
    }

    vaccines.push(auxVaccine)
  })

  treatemts.map((vaccine) => {
    const auxVaccine: Vaccine = {
      type: vaccine.campaignId === 0 ? 'rotina' : 'campanha',
      vaccinationId: 0,
      appliedTreatmentId: vaccine.treatmentId,
      vaccine: vaccine.vaccine,
      createdAt: vaccine.createdAt,
      vaccinationType: '',
      batch: '',
      manufacturer: '',
      dose: vaccine.dose,
      province: vaccine.province,
      vaccinationPost: `${vaccine.nameEM} ${vaccine.nameEA} ${vaccine.namePVAR}`,
    }

    vaccines.push(auxVaccine)
  })

  vaccines.sort((a, b) => (moment(a.createdAt).isBefore(moment(b.createdAt)) ? 1 : -1))

  return { person, vaccines }
}

export default personVaccines
