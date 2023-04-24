import {Flags} from '@oclif/core'

const FlagsSecretAndVars = {
  organization: Flags.string({
    char: 'o',
    description: 'A single string containing the organization name',
    required: true,
  }),
  repositories: Flags.string({
    char: 'r',
    description: 'Can be multiples repositories names',
    required: true,
    multiple: true,
  }),
  environment: Flags.string({
    char: 'e',
    description: 'If is set the env should be activated in the specified environment and create it if not exist',
    required: false,
  }),
  'secret-name': Flags.string({
    char: 'n',
    description: 'Can be multiples secret names separated by space',
    required: true,
    multiple: true,
  }),
  'secret-value': Flags.string({
    required: true,
    description: 'Can be multiples secret values separated by space',
    char: 'x',
    multiple: true,
  }),

  help: Flags.help({char: 'h'}),
}
export default FlagsSecretAndVars
