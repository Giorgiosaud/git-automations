/* eslint-disable no-await-in-loop */
import {Command} from '@oclif/core'
import {info} from '../../helpers/logger'
import {validateRepoNames, validateSecrets} from '../../helpers/validations'
import secretVarsFlags from '../../helpers/set-vars-helpers/secret-vars-flags'
import repositoryFactory from '../../repositories/repository-factory'
import encryptSecret from '../../set-secret-helpers/encrypt-secret'

export default class SetSecret extends Command {
  static description = 'Set Secrets in repo from org'

  static examples = [
    `
    you must have a personal github token to set the first time that uses this tool
    $ github-automation set-secret --owner OWNER --repositories NAME1 NAME2 ... NAMEN --secrets NAME_1->SECRET_1 NAME_2->SECRET_2 ... NAME_N->SECRET_N
    $ github-automation set-secret --environment ENVIRONMENT --owner OWNER --repositories NAME1 NAME2 ... NAMEN --secrets NAME_1->SECRET_1 NAME_2->SECRET_2 ... NAME_N->SECRET_N

    $ github-automation set-secret -o OWNER -r NAME1 NAME2 ... NAMEN -s NAME_1->SECRET_1 NAME_2->SECRET_2 ... NAME_N->SECRET_N
    $ github-automation set-secret -e ENVIRONMENT -o OWNER -r NAME1 NAME2 ... NAMEN -s NAME_1->SECRET_1 NAME_2->SECRET_2 ... NAME_N->SECRET_N
    `,
  ]

  static usage='set-secret -e ENVIRONMENT -o OWNER  -r REPOS -s NAMES->VALUES'

  static strict = false

  static flags = secretVarsFlags

  async run(): Promise<void> {
    const {flags: {organization, repositories, secrets, environment, forced}} = await this.parse(SetSecret)
    validateSecrets(secrets)
    validateRepoNames(repositories)
    const octoFactory = repositoryFactory.get('octokit')
    for (const repo of repositories) {
      console.log(info(`Updating secrets in org: ${organization} in repo: ${repo}`))
      for (const secret of secrets) {
        const [name, value] = secret.split('->')
        console.log(info(`Generating Key for secret ${name} with value ${value} in org: ${organization} in repo: ${repo} ${environment ? `in environment: ${environment}` : ''}`))
        const {data: publicKey} = await octoFactory.getPublicKey({owner: organization, repo, environment, forced})
        console.log(info(`Encrypting secret ${name} with value ${value} in org: ${organization} in repo: ${repo} ${environment ? `in environment: ${environment}` : ''}`))
        const encryptedValue = await encryptSecret({value, publicKey})
        console.log(info(`Updating secret ${name} with value ${value} in org: ${organization} in repo: ${repo} ${environment ? `in environment: ${environment}` : ''}`))
        await octoFactory.updateSecret({owner: organization, repo, secret_name: name, encrypted_value: encryptedValue, key_id: publicKey.key_id, environment})
        console.log(info(`Updated secret ${name} with value ${value} in org: ${organization} in repo: ${repo} ${environment ? `in environment: ${environment}` : ''}`))
      }
    }
  }
}
