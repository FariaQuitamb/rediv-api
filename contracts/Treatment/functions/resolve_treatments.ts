import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import isAfterToday from 'Contracts/functions/isafter_today'
import moment from 'moment'
import doseMap from './dose_map'
import doseStrategy from './dose_strategy'

interface Treatment {
  personId: number | undefined
  campaignId: number | undefined
  illnessId: number
  treatmentId: number
  treatmentDoseId: number | undefined
  vaccinationPostUserId: number | undefined
  latitude: string | undefined
  longitude: string | undefined
  createdAt: string
}

interface TreatmentData {
  campaignId: number
  personId: number
  vaccinationPostUserId: number
  latitude: string
  longitude: string
  treatments: Treatment[]
}

const resolveTreatment = async (request, auth, treatmentData: TreatmentData) => {
  //Start - Atribuição de dose estratégia

  const map = await doseMap()

  //End

  for (let i = 0; i < treatmentData.treatments.length; i++) {
    //Start strategy

    //Get dose acording to child age and treatment

    const doseId = await doseStrategy(map, treatmentData.treatments[i].treatmentId, '2022-07-05')

    //Start - Organização do objecto - Juntar propriedades
    treatmentData.treatments[i].campaignId = treatmentData.campaignId
    treatmentData.treatments[i].personId = treatmentData.personId
    treatmentData.treatments[i].vaccinationPostUserId = treatmentData.vaccinationPostUserId
    treatmentData.treatments[i].latitude = treatmentData.latitude
    treatmentData.treatments[i].longitude = treatmentData.longitude

    //End

    if (isAfterToday(treatmentData.treatments[i].createdAt)) {
      const previewsDate = treatmentData.treatments[i].createdAt
      treatmentData.treatments[i].createdAt = moment().toISOString()
      formatedLog({
        text: `Data superior ao dia actual : A data de aplicação do tratamento foi modificada para data de hoje! Data Inserida: ${previewsDate} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
        data: treatmentData.treatments[i],
        auth: auth,
        request: request,
        type: LogType.warning,
      })
    }

    const prevDate = treatmentData.treatments[i].createdAt

    treatmentData.treatments[i].createdAt = moment(
      treatmentData.treatments[i].createdAt,
      moment.ISO_8601,
      true
    )
      .utc(true)
      .toISOString()
    //Caso tenha inserido data que não seja possível converter

    if (treatmentData.treatments[i].createdAt === null) {
      treatmentData.treatments[i].createdAt = moment().toISOString()

      formatedLog({
        text: `Data inválida: A data de aplicação do tratamento foi modificada para data de hoje! Data Inserida: ${prevDate} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
        data: treatmentData.treatments[i],
        auth: auth,
        request: request,
        type: LogType.warning,
      })
    }

    treatmentData.treatments[i].treatmentDoseId = 10101 * i
  }

  return treatmentData.treatments
}

export default resolveTreatment
