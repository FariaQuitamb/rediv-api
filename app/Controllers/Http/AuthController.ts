// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

import AuthValidator from 'App/Validators/AuthValidator'

import { base64, safeEqual, string } from '@ioc:Adonis/Core/Helpers'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
export default class AuthController {
  public async login({ auth, response, request }: HttpContextContract) {
    const data = await request.validate(AuthValidator)
    try {
      const username = string.escapeHTML(data.username)

      const user = await User.query().where('Utilizador', username).whereNot('Flag', 'X').first()

      if (!user) {
        console.log('Login incorrecto')
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Login incorrecto',
          data: {},
        })
      }

      const b64 = base64.encode(data.password)

      if (!safeEqual(b64, user.password)) {
        console.log('Login incorrecto')
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Login incorrecto',
          data: {},
        })
      }

      const token = await auth.use('api').generate(user, {
        expiresIn: '10days',
        name: user.username,
      })

      await user?.load('vaccinationPost')
      return response.status(HttpStatusCode.ACCEPTED).send({
        code: HttpStatusCode.ACCEPTED,
        message: 'Login efectuado com sucesso!',
        data: { user, token },
      })
    } catch (error) {
      console.log(error)
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: 'Ocorreu um erro ao efectuar o login',
        data: [],
      })
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    try {
      await auth.use('api').revoke()

      if (auth.use('api').isLoggedOut) {
        return response.status(HttpStatusCode.ACCEPTED).send({
          code: HttpStatusCode.ACCEPTED,
          message: 'Logout efectuado',
          data: [],
        })
      } else {
        return response.status(HttpStatusCode.NOT_ACCEPTABLE).send({
          code: HttpStatusCode.NOT_ACCEPTABLE,
          message: 'Não foi possível efectuar logout',
        })
      }
    } catch (error) {
      console.log(error)
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        details: error,
        message: 'Erro ao efectuar logout',
      })
    }
  }
}
