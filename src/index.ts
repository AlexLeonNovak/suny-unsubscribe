import 'dotenv/config';
import {MauticApiService} from './services/mautic-api.service';
import {SunyApiService} from './services/suny-api.service';
import {Logger} from './utils/logger';

const bootstrap = async () => {
  const logger = new Logger();
  const mauticApi = new MauticApiService();
  const sunyApi = new SunyApiService();

  try {
    const dncContacts = await mauticApi.getDNCContacts();
    console.log(dncContacts);
    // for (const { lead_id, channel } of stats) {
      // const result = await sunyApi.removeMailing(lead_id);
      // console.log(result);
      // logger.log(JSON.stringify({
      //   lead_id,
      //   channel
      // }));
    // }

  } catch (e) {
    logger.error(e.message);
    console.error(e);
  }

}

bootstrap();
