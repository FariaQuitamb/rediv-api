/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'

import Env from '@ioc:Adonis/Core/Env'

Route.get('/', async () => {
  return { hello: 'world', title: 'It Works' }
})

//MAIN WRAPPER
Route.group(() => {
  Route.get('/health', async ({ response }) => {
    const report = await HealthCheck.getReport()
    return report.healthy ? response.ok(report) : response.badRequest(report)
  })

  //Auth Login
  Route.post('auth/login', 'AuthController.login')

  Route.group(() => {
    //Auth
    Route.get('auth/logout', 'AuthController.logout')
    Route.post('auth/logged', 'AuthController.loggedUsers')
    Route.post('auth/logged_users', 'AuthController.loggedUsersView')
    Route.post('auth/about_usage', 'AuthController.aboutIUsage')
    //Preload Route
    Route.get('preload', 'PreloadsController.index')
    //Person
    Route.post('people', 'PeopleController.store')
    Route.post('people/search', 'PeopleController.list')
    Route.post('people/check', 'PeopleController.checkPerson')

    //RANKING - for covid old aproach
    Route.post('ranking', 'VaccinationRanksController.rankUser')

    //RANKING - for treatment new aproach
    Route.post('ranking_treatment', 'VaccinationRanksController.rankUserTreatment')

    Route.get('locations_rank', 'VaccinationRanksController.locationsRank')

    //Vaccination
    Route.post('vaccination/', 'VaccinationsController.store')
    Route.post('vaccination/booster', 'VaccinationsController.booster')

    //Goals
    Route.post('goals/postgoal', 'GoalsController.getVaccinationPostGoal')

    //Logs
    Route.post('logs/error', 'LogsController.getErrorLogs')
    Route.post('logs/activity', 'LogsController.getLogs')
    Route.post('logs/vaccine', 'LogsController.getVaccineLogs')
    Route.post('logs/vaccine/geo', 'LogsController.getVaccineGeoLogs')

    //API ACCESS ROUTE
    Route.post('accesses/list', 'ApiAcessesController.index')
    Route.post('accesses', 'ApiAcessesController.store')
    Route.post('accesses/state', 'ApiAcessesController.changeState')
    Route.post('accesses/search', 'ApiAcessesController.search')

    //MESSAGE ROUTES

    Route.post('usermessages', 'VaccinationMessagesController.getMessage')
    Route.post('viewmessage', 'VaccinationMessagesController.viewMessage')

    //MOBILE APP VERSION AND INSTALLATION
    Route.post('mobile_version', 'ConfigsController.changeAppVersion')
    Route.post('installations', 'AppInstallationsController.index')
  }).middleware('auth:api')

  Route.post('install', 'AppInstallationsController.store')

  //Rota para obter versão actual da aplicação
  Route.get('mobile_version', 'ConfigsController.getMobileVersion')

  //Rede de Confiança

  Route.group(() => {
    Route.get('today', 'TrustNetworksController.today')
    Route.get('general', 'TrustNetworksController.inGeneral')
    Route.get('overtime', 'TrustNetworksController.withOneOrMoreRecord')
    Route.post('ispartner', 'TrustNetworksController.isTrustPartner')
    Route.get('vaccination_post', 'TrustNetworksController.vaccinationPostLocations')
    Route.get('vaccination_places', 'TrustNetworksController.vaccinationPlaces')
  })
    .prefix('trust')
    .middleware('auth:api')

  //////////////
}).prefix(Env.get('API_VERSION'))
