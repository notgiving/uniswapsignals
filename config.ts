import  * as convict  from 'convict' 
// Define a schema

export let  config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  twilio:{
    accountSid:{
        doc: 'twilio Account ID',
        default: '',
        format:"String",
        env: 'TWILIO_ACCOUNT_ID'
    },
    authToken:{
        doc: 'twilio Auth Token',
        format:"String",
        default: '',
        env: 'TWILIO_AUTH_TOKEN'
    },
    isEnable:{
        doc: 'twilio Account ID',
        default: false,
        format:"Boolean",
        env: 'TWILIO_ENABLE'
    }
  },
  alertRecievers:{
    format:"Array",
    doc: 'Array of Phone numbers to which alert should be send',
    default: [],

  }
});
 
// Load environment dependent configuration
let env = config.get('env');
config.loadFile('./config/' + env + '.json');
 
// Perform validation
config.validate({allowed: 'strict'});

  
  