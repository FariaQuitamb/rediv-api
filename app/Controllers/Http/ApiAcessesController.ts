import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ApiAccess from 'App/Models/ApiAccess'
import ApiAccessValidator from 'App/Validators/ApiAccessValidator'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import ListAccessesValidator from 'App/Validators/ListAccessesValidator'

export default class ApiAcessesController {
  public async index({ auth, response, request }: HttpContextContract) {
    const searchData = await request.validate(ListAccessesValidator)
    try {
      let query

      if (searchData.search !== ' ' && searchData.search !== undefined) {
        const wildCard = `'%${searchData.search}%'`

        query = `name COLLATE SQL_Latin1_General_CP1_CI_AS LIKE ${wildCard}`
      } else {
        query = ''
      }
      const accesses = await ApiAccess.query()
        .whereRaw(query)
        .orderBy('name', 'asc')
        .paginate(searchData.page, searchData.limit)

      return response.status(HttpStatusCode.OK).send({
        message: 'Lista de instituições com acesso a API : ',
        code: HttpStatusCode.OK,
        data: accesses,
      })
    } catch (error) {
      console.log(error)

      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'ApiAcessesController/store',
        error: `User:${userInfo} - ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const accessData = await request.validate(ApiAccessValidator)
    try {
      const findAccess = await ApiAccess.findBy('name', accessData.name)

      console.log(accessData.name)

      if (findAccess) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Essa Instituição já possuí acesso !',
          code: HttpStatusCode.FOUND,
          data: {},
        })
      }

      const access = await ApiAccess.create(accessData)

      //Generate JWT token here
      const token = jwt.sign({ id: access.apiId }, Env.get('SECRET'), {
        expiresIn: Env.get('ACCESS_JWT_EXPIRES_IN'), // expires in 5min
      })

      await access.merge({ accessKey: token }).save()

      return response.status(HttpStatusCode.CREATED).send({
        message: 'Acesso criado com sucesso!',
        code: HttpStatusCode.CREATED,
        data: access,
      })
    } catch (error) {
      console.log(error)

      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'ApiAcessesController/store',
        error: `User:${userInfo} - ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}