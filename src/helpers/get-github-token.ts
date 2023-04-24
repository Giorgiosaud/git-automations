import {homedir} from 'node:os'
import {readEnv, buildEnvContent} from './file-system'
import {writeFileSync, existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {promptToken} from './prompt-token'
import {rcPath} from './config'
import octokitRepository from '../repositories/octokit-repository'

export default async (org: string): Promise<string> => {
  const rcRealPath = resolve(homedir(), rcPath)
  const SETTINGS_FILE_EXIST = existsSync(rcRealPath)
  let SETTINGS;
  if(SETTINGS_FILE_EXIST){
    SETTINGS = readEnv(rcRealPath)
  }else{
    writeFileSync(rcRealPath, 'utf-8')
    const token = await promptToken({org})
      buildEnvContent(rcRealPath, {
        [org]: {
          GITHUB_TOKEN: token,
        }},
      )
      SETTINGS = readEnv(rcRealPath)
    }
    const auth=SETTINGS[0][org].GITHUB_TOKEN
    const isValidToken=await octokitRepository.tokenIsValid({org,auth})
    console.log(isValidToken)
    return auth;
}
