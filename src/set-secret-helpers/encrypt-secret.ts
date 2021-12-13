import * as tweetsodium from 'tweetsodium'
import fetch from 'node-fetch'
import getGithubToken from '../helpers/get-github-token'
import {writeFile} from 'fs-extra'
import * as  path from 'node:path'
import {homedir} from 'node:os'

const encryptSecrets = async (repo: string, value: string, rcPath: string): Promise<{encryptedValue: string;keyId: string}> => {
  const organization = repo.split('/')[0]

  const GITHUB_TOKEN = await getGithubToken(rcPath, organization)
  const config = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  }
  try {
    const url = `https://api.github.com/repos/${repo}/actions/secrets/public-key`
    const response = await fetch(url, config)
    const {key, key_id: keyId} = await response.json()

    const messageBytes = Buffer.from(value)
    const keyBytes = Buffer.from(key, 'base64')
    const encryptedBytes = tweetsodium.seal(messageBytes, keyBytes)
    const encryptedValue = Buffer.from(encryptedBytes).toString('base64')
    return {encryptedValue, keyId}
  } catch {
    await writeFile(path.resolve(homedir(), rcPath), '')
    return encryptSecrets(repo, value, rcPath)
  }
}

export default encryptSecrets
