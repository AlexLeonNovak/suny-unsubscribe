import 'dotenv/config';
import {MauticApiService} from './services/mautic-api.service';
import {SunyApiService} from './services/suny-api.service';
import {Logger} from './utils/logger';

const bootstrap = async () => {
  const logger = new Logger();
  const mauticApi = new MauticApiService();
  const sunyApi = new SunyApiService();

  try {
    console.log(new Date(), 'Start process');
    const dncContacts = await mauticApi.getDNCContacts();
    const leadIds = dncContacts.map(({lead_id}) => lead_id);
    console.log(new Date(), 'Count leads:', leadIds.length);
    if (leadIds) {
      const result = await sunyApi.removeMailingBulk(leadIds);
      logger.log(JSON.stringify({ leadIds, result }));
    }
    console.log(new Date(), 'End');
    console.log('\n');
  } catch (e) {
    logger.error(e.message);
    console.error(e);
  }

}

bootstrap();
