import axios, {AxiosInstance} from 'axios';
import qs from 'qs'
import * as fs from 'fs';

const { MAUTIC_API_URL, MAUTIC_API_USER, MAUTIC_API_PASSWORD } = process.env;

export type TChannel = 'message' | 'email';

export type TOrderDirection = 'ASC' | 'DESC';

export type TWhereExpression = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'is' | 'in' | 'nin' | 'contains' | 'member_of' | 'starts_with' | 'ends_with';

type TWhereOrAnd = 'orX' | 'andX';

type TWhereValue<T> = T extends TWhereOrAnd ? WhereClause[] : string | number;

type TWhereColumn<T> = T extends TWhereOrAnd ? never : string;

interface WhereClause {
  col?: TWhereColumn<TWhereExpression | TWhereOrAnd>;
  expr: TWhereExpression | TWhereOrAnd;
  val: TWhereValue<TWhereExpression | TWhereOrAnd>;
}

export interface ParamQuery {
  start?: number;
  limit?: number;
  order?: {
    col: string;
    dir?: TOrderDirection;
  }[],
  where?: WhereClause[]
}

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

interface IdInfo {
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

  private async fetchDNC(params: ParamQuery) {
    const { data } = await this.api.get<DNCResponse>('stats/lead_donotcontact', {
      params,
      paramsSerializer: params => qs.stringify(params)
    });
    return data;
  }

  async getDNCContacts(limit = 10): Promise<DNCContact[]> {
    const ids = this.getIds();
    let dncData: DNCContact[] = [];
    if (!ids) {
      const { stats } = await this.fetchDNC({
        limit,
        order: [
          {
            col: 'id',
            dir: 'DESC',
          }
        ],
        where: [
          {
            col: 'channel',
            expr: 'eq',
            val: 'email',
          }
        ]
      });
      dncData = stats;
      this.updateIds(dncData);
      return dncData;
    }
    if (ids.startId) {
      const { stats } = await this.fetchDNC({
        limit,
        order: [
          {
            col: 'id',
            dir: 'ASC'
          }
        ],
        where: [
          {
            col: 'id',
            expr: 'gt',
            val: ids.startId
          },
          {
            col: 'channel',
            expr: 'eq',
            val: 'email',
          }
        ]
      });
      dncData = stats.reverse();
      if (dncData.length) {
        this.saveIds({ startId: dncData[0].id, endId: ids.endId });
      }
      if (dncData.length < limit && ids.endId) {
        const { stats } = await this.fetchDNC({
          limit: limit - dncData.length,
          order: [
            {
              col: 'id',
              dir: 'DESC'
            }
          ],
          where: [
            {
              col: 'id',
              expr: 'lt',
              val: ids.endId
            },
            {
              col: 'channel',
              expr: 'eq',
              val: 'email',
            }
          ]
        });
        dncData = [...dncData, ...stats];
        this.updateIds(dncData);
      }
    }


    return dncData;
  }

  updateIds(dncData: DNCContact[]) {
    let startId = 0, endId = 0;
    if (dncData.length) {
      startId = dncData[0].id;
      endId = dncData[dncData.length - 1].id;
    }

    this.saveIds({ startId, endId })
  }

  saveIds(data: IdInfo) {
    fs.writeFileSync('mautic.json', JSON.stringify(data));
  }

  getIds(): IdInfo | null {
    try {
      return JSON.parse(fs.readFileSync('mautic.json', 'utf8'));
    } catch (e) {
      return null;
    }
  }
}
