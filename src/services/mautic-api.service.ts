import axios, {AxiosInstance} from 'axios';
import qs from 'qs'
import * as fs from 'fs';

const { MAUTIC_API_URL, MAUTIC_API_USER, MAUTIC_API_PASSWORD } = process.env;

export type TChannel = 'message' | 'email';

export interface DNCContact {
  id: number;
  lead_id: number;
  date_added: Date;
  reason: boolean;
  channel: TChannel;
  comments?: string;
}

export interface DNCResponse {
  total: number;
  stats: DNCContact[];
}

export interface DNCData extends DNCResponse {
  limit: number;
  startId: number;
  endId: number;
}

export class MauticApiService {
  private readonly api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: `${MAUTIC_API_URL.replace(/\/$/, '')}/api/`,
      auth: {
        username: MAUTIC_API_USER,
        password: MAUTIC_API_PASSWORD
      },
    })
  }

  async getUnsubscribeContacts(start = 0, limit = 100): Promise<DNCData> {
    const response = await this.api.get<DNCResponse>('stats/lead_donotcontact', {
      params: {
        start,
        limit,
        order: [
          {
            col: 'id',
            dir: 'ASC'
          }
        ]
      },
      paramsSerializer: params => qs.stringify(params)
    });
    const {data} = response;
    let startId = 0, endId = 0;
    if (data.stats.length) {
      startId = data.stats[0].id;
      endId = data.stats[data.stats.length - 1].id;
    }

    return {
      ...data,
      startId,
      endId,
      limit,
    };
  }

  saveLastId(id) {
    fs.writeFileSync('mautic.json', JSON.stringify({ id }));
  }

  getLastId() {
    try {
      const data = fs.readFileSync('mautic.json', 'utf8');
      const {id} = JSON.parse(data);
      return id;
    } catch (e) {
      return 0;
    }
  }
}
