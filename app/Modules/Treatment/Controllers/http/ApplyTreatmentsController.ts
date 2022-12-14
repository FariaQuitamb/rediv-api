import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import AppliedTreatment from '../../Models/AppliedTreatment'
import ApplyTreatmentValidator from '../../Validators/ApplyTreatmentValidator'
import Env from '@ioc:Adonis/Core/Env'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import formatError from 'Contracts/functions/format_error'
import logError from 'Contracts/functions/log_error'
import resolveTreatment from 'Contracts/Treatment/functions/resolve_treatments'
import addActivityLogJob from 'App/bullmq/queue/queue'

export default class ApplyTreatmentsController {
  public async index({}: HttpContextContract) {}

  public async store({ auth, response, request }: HttpContextContract) {
    const treatmentsData = await request.validate(ApplyTreatmentValidator)

    try {
      if (treatmentsData.treatments.length === 0) {
        formatedLog({
          text: 'Foi enviada uma lista de tratamento vazia',
          type: LogType.warning,
          data: [],
          auth: auth,
          request: request,
        })
        return response.status(HttpStatusCode.OK).send({
          message: 'Lista de tratamento está vazia',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      const treatments = await resolveTreatment(request, auth, treatmentsData)

      const appliedTreatments = await AppliedTreatment.createMany(treatments)

      const version = Env.get('API_VERSION')

      const log = {
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'ApplyTreatmentsController/store',
        table: 'vac_vacTratamento',
        job: 'Cadastrar',
        tableId: appliedTreatments[0].id,
        action: 'Aplicação de tratamento',
        actionId: `V:${version}`,
      }

      await addActivityLogJob(log)

      formatedLog({
        text: 'Tratamento aplicado com sucesso',
        type: LogType.success,
        data: appliedTreatments,
        auth: auth,
        request: request,
      })

      //Utente registado com sucesso
      return response.status(HttpStatusCode.CREATED).send({
        message: 'Tratamento aplicado com sucesso',
        code: HttpStatusCode.CREATED,
        data: appliedTreatments,
      })
    } catch (error) {
      const userInfo = formatUserInfo(auth.user)
      const treatmentStr = JSON.stringify(treatmentsData)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'ApplyTreatmentsController/store',
        error: `User:${userInfo} Device: ${deviceInfo} Dados : ${treatmentStr} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível realizar a operação de registo de tratamento dentro do tempo esperado',
          type: LogType.warning,
          data: treatmentsData,
          auth: auth,
          request: request,
        })

        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível completar a operação dentro do tempo esperado',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: [],
        })
      }

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
