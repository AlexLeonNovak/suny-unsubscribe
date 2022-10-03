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
    for (const { lead_id } of dncContacts) {
      const result = await sunyApi.removeMailing(lead_id);
      logger.log(JSON.stringify({
        lead_id,
        result
      }));
    }
  } catch (e) {
    logger.error(e.message);
    console.error(e);
  }

}

bootstrap();
