import 'dotenv/config';
import {MauticApiService} from './services/mautic-api.service';
import {SunyApiService} from './services/suny-api.service';
import {Logger} from './utils/logger';

const bootstrap = async () => {
  const logger = new Logger();
  const mauticApi = new MauticApiService();
  const sunyApi = new SunyApiService();

  try {
    const { endId, stats } = await mauticApi.getUnsubscribeContacts(mauticApi.getLastId());
    for (const { lead_id, channel } of stats) {
      const result = await sunyApi.removeMailing(lead_id);
      console.log(result);
      logger.log(JSON.stringify({
        lead_id,
        channel
      }))
    }
    mauticApi.saveLastId(endId);
  } catch (e) {
    logger.error(e.message);
    console.error(e);
  }

}

bootstrap();
